import { useSyncExternalStore } from "react";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

type Coords = { lat: number; lng: number };

type State = {
  address: string | null;
  isLoading: boolean;
  error: string | null;
  coords: Coords | null;
};

type CachedLocation = {
  address: string;
  lat: number;
  lng: number;
  timestamp: number;
};

/* ─── Constants ─────────────────────────────────────────────────────────────── */

const CACHE_KEY = "kaivu_user_location";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/* ─── State ─────────────────────────────────────────────────────────────────── */

let state: State = {
  address: null,
  isLoading: true,
  error: null,
  coords: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((cb) => cb());
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

/* ─── Cache helpers ─────────────────────────────────────────────────────────── */

function getCachedLocation(): CachedLocation | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached: CachedLocation = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached;
  } catch {
    return null;
  }
}

function setCachedLocation(address: string, lat: number, lng: number) {
  try {
    const data: CachedLocation = { address, lat, lng, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable in some contexts, ignore
  }
}

/* ─── Reverse geocoding (OpenStreetMap Nominatim) ───────────────────────────── */

/**
 * Extracts a concise, human-readable address from Nominatim's response.
 * Prefers: road/neighbourhood, suburb, city.
 */
function formatAddress(nominatimAddress: Record<string, string>): string {
  const a = nominatimAddress;

  // Primary location identifier
  const road =
    a.road ||
    a.pedestrian ||
    a.neighbourhood ||
    a.hamlet ||
    a.village ||
    "";

  // Area/suburb
  const area =
    a.suburb ||
    a.neighbourhood ||
    a.city_district ||
    a.county ||
    "";

  // City
  const city =
    a.city ||
    a.town ||
    a.village ||
    a.state_district ||
    "";

  // Build the display string, avoiding duplicates
  const parts: string[] = [];
  if (road) parts.push(road);
  if (area && area !== road) parts.push(area);
  if (city && city !== area && city !== road) parts.push(city);

  return parts.length > 0 ? parts.join(", ") : "Unknown location";
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      // Nominatim requires a User-Agent to identify the application
      "User-Agent": "Kaivu/1.0 (food-delivery-app)",
    },
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  if (data.address) {
    return formatAddress(data.address);
  }

  // Fallback to the display_name if address breakdown is unavailable
  return data.display_name || "Unknown location";
}

/* ─── Geolocation ───────────────────────────────────────────────────────────── */

function requestGeolocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes — reuse recent GPS fix
    });
  });
}

/* ─── Core logic ────────────────────────────────────────────────────────────── */

async function fetchLocation(skipCache = false) {
  setState({ isLoading: true, error: null });

  // 1. Try cache first (unless forced refresh)
  if (!skipCache) {
    const cached = getCachedLocation();
    if (cached) {
      setState({
        address: cached.address,
        coords: { lat: cached.lat, lng: cached.lng },
        isLoading: false,
        error: null,
      });
      // Silently refresh in background for freshness
      fetchLocation(true).catch(() => {
        // Background refresh failed — keep cached data, don't overwrite state
      });
      return;
    }
  }

  // 2. Request GPS position
  try {
    const position = await requestGeolocation();
    const { latitude: lat, longitude: lng } = position.coords;

    setState({ coords: { lat, lng } });

    // 3. Reverse geocode
    try {
      const address = await reverseGeocode(lat, lng);
      setCachedLocation(address, lat, lng);
      setState({ address, isLoading: false, error: null });
    } catch (geoErr) {
      // Geocoding failed but we have coords — show a fallback
      const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setState({ address: fallback, isLoading: false, error: null });
    }
  } catch (err: any) {
    let errorMessage = "Unable to get location";

    if (err instanceof GeolocationPositionError) {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = "Location access denied";
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = "Location unavailable";
          break;
        case err.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }
    }

    setState({ isLoading: false, error: errorMessage });
  }
}

/* ─── Initialize on client ──────────────────────────────────────────────────── */

if (typeof window !== "undefined") {
  fetchLocation();
}

/* ─── Public API ────────────────────────────────────────────────────────────── */

export const locationStore = {
  /** Re-fetch location (bypasses cache, re-requests GPS). */
  refresh() {
    fetchLocation(true);
  },

  /** Get current snapshot (for non-React usage). */
  getState(): State {
    return state;
  },
};

/** React hook — subscribe to location state with a selector. */
export function useLocation<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state)
  );
}
