/**
 * Resilient Client-Side Visitor Tracker for Kaivu.
 *
 * Uses a persistent First-Party Cookie + LocalStorage sync (auto-healing UUID)
 * combined with a lightweight hardware/device fingerprint (Screen, GPU WebGL, Timezone, Platform).
 *
 * This completely decouples visitor detection from unstable/rotating IP addresses
 * (such as mobile 4G/5G CGNAT, Wi-Fi reconnection, and in-app browsers).
 */

const VISITOR_ID_KEY = "kaivu_vid";
const TRACKED_FLAG_KEY = "kaivu_visitor_tracked_v2";

/**
 * Safely read a cookie by name on client
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Set a long-lived first-party cookie (1 year)
 */
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Generate a random UUID
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "vid_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);
}

/**
 * Get or create a persistent Visitor ID that cross-syncs between localStorage and cookies.
 * If user clears localStorage, cookie restores it. If cookies are cleared, localStorage restores it.
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";

  let vid: string | null = null;

  try {
    vid = localStorage.getItem(VISITOR_ID_KEY);
  } catch {}

  if (!vid) {
    vid = getCookie(VISITOR_ID_KEY);
  }

  if (!vid) {
    vid = generateUUID();
  }

  // Cross-sync to ensure resilience against cache/storage clearing
  try {
    localStorage.setItem(VISITOR_ID_KEY, vid);
  } catch {}
  setCookie(VISITOR_ID_KEY, vid, 365);

  return vid;
}

/**
 * Fast 32-bit FNV-1a string hasher
 */
function hashString(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return "fp_" + (hash >>> 0).toString(16);
}

/**
 * Fast, non-blocking hardware & browser fingerprint.
 * Generates a stable signature based on hardware properties independent of IP address.
 */
export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "server";

  try {
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth || 24}@${window.devicePixelRatio || 1}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    const platform = navigator.platform || "";
    const concurrency = navigator.hardwareConcurrency || 0;

    let gpu = "";
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          gpu = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
        }
      }
    } catch {}

    return hashString(`${screenInfo}|${timezone}|${platform}|${concurrency}|${gpu}`);
  } catch {
    return "fp_default";
  }
}

/**
 * Zero-latency client-side visitor tracker.
 * Checks local persistent state first (0ms latency).
 * If unknown, dispatches a non-blocking background payload with UUID & device fingerprint.
 */
export function trackNewVisitor(currentPath: string = "/") {
  if (typeof window === "undefined") return;

  // Don't track admin pages
  if (currentPath.startsWith("/csuite")) return;

  try {
    const visitorId = getOrCreateVisitorId();
    const isLocalTracked =
      localStorage.getItem(TRACKED_FLAG_KEY) || getCookie(TRACKED_FLAG_KEY);

    if (isLocalTracked) {
      // Returning visitor detected locally — 0ms overhead, immediate return
      return;
    }

    // Mark locally immediately to prevent repeated requests from the same session/device
    localStorage.setItem(TRACKED_FLAG_KEY, "true");
    setCookie(TRACKED_FLAG_KEY, "true", 365);
    localStorage.setItem("kaivu_first_visit_time", new Date().toISOString());

    const fingerprint = getDeviceFingerprint();

    const payload = JSON.stringify({
      visitorId,
      fingerprint,
      pathname: currentPath || window.location.pathname || "/",
      referrer: document.referrer || "",
      screen: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language || "en",
      userAgent: navigator.userAgent || "",
    });

    const endpoint = "/api/analytics/new-visitor";

    // Dispatch in background via sendBeacon or non-blocking keepalive fetch
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, payload);
    } else {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // Fail silently so user experience is never interrupted
    console.debug("[VisitorTracker] error:", e);
  }
}
