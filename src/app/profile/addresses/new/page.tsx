"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MapPin, Loader2, Navigation, CheckCircle2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { auth } from "@/lib/auth-store";
import { toast } from "sonner";

function NewAddressForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Form states
  const [name, setName] = useState("");
  const [label, setLabel] = useState("Home"); // Home, Work, Other or custom
  const [customLabel, setCustomLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [pincode, setPincode] = useState("");
  const [place, setPlace] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [detectedLat, setDetectedLat] = useState<number | null>(null);
  const [detectedLng, setDetectedLng] = useState<number | null>(null);

  // Loading states
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Quick select label helper
  const labelOptions = ["Home", "Work", "Other"];

  // Geolocation detection and reverse mapping
  const handleAutoDetect = async () => {
    setIsDetecting(true);
    toast.info("Accessing GPS location...");

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      
      setDetectedLat(lat);
      setDetectedLng(lng);

      toast.info("Reverse geocoding your coordinates...");
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "Kaivu/1.0 (food-delivery-app)",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to reverse geocode location");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const addr = data.address || {};

      // Build readable fields
      const detectedPincode = addr.postcode || "";
      const detectedPlace = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || "";
      
      const houseNumber = addr.house_number || "";
      const road = addr.road || addr.pedestrian || addr.neighbourhood || addr.suburb || "";
      const detectedAddressLine = houseNumber 
        ? `${houseNumber}, ${road}` 
        : road;

      // Animate filling fields
      setAddressLine(detectedAddressLine);
      setPincode(detectedPincode);
      setPlace(detectedPlace);

      toast.success("Location auto-detected successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to auto-detect location. Please enter manually.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalLabel = label === "Other" ? (customLabel.trim() || "Other") : label;

    if (!finalLabel) {
      toast.error("Please specify a label/name for the address");
      return;
    }
    if (!addressLine.trim()) {
      toast.error("Please enter the address details");
      return;
    }
    if (!pincode.trim()) {
      toast.error("Please enter the pincode");
      return;
    }
    if (!place.trim()) {
      toast.error("Please enter the place/city");
      return;
    }

    setIsSaving(true);

    // fullAddress combines details, place, and pincode for display
    const fullAddress = `${addressLine}, ${place} - ${pincode}`;

    const res = await auth.addAddress({
      name: name.trim() || undefined,
      label: finalLabel,
      fullAddress,
      city: place,
      pincode,
      isDefault,
      lat: detectedLat !== null ? detectedLat : undefined,
      lng: detectedLng !== null ? detectedLng : undefined,
    });

    setIsSaving(false);

    if (res.success) {
      toast.success("Address saved successfully");
      if (redirect) {
        router.push(redirect);
      } else {
        router.push("/profile/addresses");
      }
    } else {
      toast.error(res.error || "Failed to save address");
    }
  };

  return (
    <MobileShell>
      {/* Header */}
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 pt-6">
        <button
          onClick={() => {
            if (redirect) {
              router.push(redirect);
            } else {
              router.push("/profile/addresses");
            }
          }}
          className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-sm"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-center">Add Address</h1>
        <div className="w-10" />
      </header>

      {/* Auto Detect Section */}
      <section className="px-5 pt-6">
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={isDetecting}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand/10 border border-brand/20 py-3.5 text-sm font-semibold text-brand transition-all hover:bg-brand/15 active:scale-[0.99] disabled:opacity-50"
        >
          {isDetecting ? (
            <>
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
              Detecting Current Location...
            </>
          ) : (
            <>
              <Navigation className="h-4.5 w-4.5 fill-brand/20" />
              Auto-Detect Current Location
            </>
          )}
        </button>
      </section>

      {/* Form */}
      <form onSubmit={handleSave} className="px-5 pt-5 pb-10 space-y-5">
        {/* Receiver Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Receiver Name
          </label>
          <input
            type="text"
            placeholder="Name of the person receiving the order"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface p-3 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
            required
          />
        </div>

        {/* Address Label */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Address Name / Label
          </label>
          <div className="flex gap-2.5">
            {labelOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setLabel(opt)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  label === opt
                    ? "bg-brand border-brand text-brand-foreground shadow-sm"
                    : "bg-surface border-border text-foreground hover:bg-accent"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {label === "Other" && (
            <input
              type="text"
              placeholder="e.g. Grandma's Place, Gym"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface p-3 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
              required
            />
          )}
        </div>

        {/* Address Details */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
            Address Details (Flat/Road/Area)
          </label>
          <textarea
            placeholder="Flat/House No., Building Name, Street details"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-surface p-3 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
            required
          />
        </div>

        {/* Place and Pincode Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              City / Place
            </label>
            <input
              type="text"
              placeholder="e.g. Bangalore"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Pincode
            </label>
            <input
              type="text"
              placeholder="e.g. 560001"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
              required
            />
          </div>
        </div>

        {/* Set as Default */}
        <label className="flex items-center gap-3 py-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
            className="h-4 w-4 rounded text-brand focus:ring-brand accent-brand border-border"
          />
          <span className="text-sm font-semibold text-foreground">Set as default delivery address</span>
        </label>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-sm font-bold text-brand-foreground shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:hover:scale-100"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Address...
              </>
            ) : (
              "Save Address"
            )}
          </button>
        </div>
      </form>
    </MobileShell>
  );
}

export default function NewAddressPage() {
  return (
    <Suspense
      fallback={
        <MobileShell>
          <div className="flex h-[80vh] flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-sm text-muted-foreground">Loading form...</p>
          </div>
        </MobileShell>
      }
    >
      <NewAddressForm />
    </Suspense>
  );
}
