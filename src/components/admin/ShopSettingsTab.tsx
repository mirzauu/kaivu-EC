"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MapPin, Navigation, Save, Loader2, IndianRupee, Map } from "lucide-react";

export function ShopSettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  // Form State
  const [shopLat, setShopLat] = useState("");
  const [shopLng, setShopLng] = useState("");
  const [maxDeliveryKm, setMaxDeliveryKm] = useState("");
  const [freeDeliveryKm, setFreeDeliveryKm] = useState("");
  const [perKmCharge, setPerKmCharge] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data?.settings) {
        const settings = json.data.settings;
        const getVal = (key: string) => settings.find((s: any) => s.key === key)?.value || "";
        
        setShopLat(getVal("shop_lat"));
        setShopLng(getVal("shop_lng"));
        setMaxDeliveryKm(getVal("max_delivery_km"));
        setFreeDeliveryKm(getVal("free_delivery_km"));
        setPerKmCharge(getVal("per_km_charge"));
      }
    } catch (e) {
      toast.error("Failed to fetch shop settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setShopLat(pos.coords.latitude.toString());
        setShopLng(pos.coords.longitude.toString());
        setLocating(false);
        toast.success("Location acquired successfully!");
      },
      (err) => {
        setLocating(false);
        toast.error("Failed to get location. Please allow location permissions.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            { key: "shop_lat", value: shopLat },
            { key: "shop_lng", value: shopLng },
            { key: "max_delivery_km", value: maxDeliveryKm },
            { key: "free_delivery_km", value: freeDeliveryKm },
            { key: "per_km_charge", value: perKmCharge },
          ]
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Shop settings saved successfully!");
      } else {
        toast.error(json.error || "Failed to save settings");
      }
    } catch (e) {
      toast.error("Network error while saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-[oklch(0.18_0.02_50)] tracking-tight">
            Shop Management
          </h2>
          <p className="text-sm text-[oklch(0.5_0.02_60)] mt-1">
            Configure your physical shop location and dynamic delivery distance rules.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Section */}
        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[oklch(0.9_0.015_75)] pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Shop Coordinates</h3>
              <p className="text-xs text-[oklch(0.5_0.02_60)]">Where are orders dispatched from?</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 py-3 text-sm font-bold text-slate-700 transition-colors disabled:opacity-50"
            >
              {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              <span>{locating ? "Acquiring Location..." : "Use My Current Location"}</span>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={shopLat}
                  onChange={(e) => setShopLat(e.target.value)}
                  placeholder="e.g. 10.0234"
                  className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-2.5 text-sm text-[oklch(0.18_0.02_50)] focus:border-brand focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={shopLng}
                  onChange={(e) => setShopLng(e.target.value)}
                  placeholder="e.g. 76.3214"
                  className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-2.5 text-sm text-[oklch(0.18_0.02_50)] focus:border-brand focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Rules Section */}
        <div className="rounded-[2rem] bg-white border border-[oklch(0.9_0.015_75)] p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[oklch(0.9_0.015_75)] pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <Map className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[oklch(0.18_0.02_50)]">Distance & Fee Rules</h3>
              <p className="text-xs text-[oklch(0.5_0.02_60)]">Set boundaries and per-km charges</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="flex justify-between text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                <span>Max Delivery Range (KM)</span>
              </label>
              <input
                type="number"
                step="any"
                required
                value={maxDeliveryKm}
                onChange={(e) => setMaxDeliveryKm(e.target.value)}
                placeholder="e.g. 15"
                className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-2.5 text-sm text-[oklch(0.18_0.02_50)] focus:border-brand focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-[oklch(0.5_0.02_60)]">Orders beyond this distance will be blocked entirely.</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                Free Delivery Range (KM)
              </label>
              <input
                type="number"
                step="any"
                required
                value={freeDeliveryKm}
                onChange={(e) => setFreeDeliveryKm(e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] px-4 py-2.5 text-sm text-[oklch(0.18_0.02_50)] focus:border-brand focus:outline-none transition-colors"
              />
              <p className="text-[10px] text-[oklch(0.5_0.02_60)]">Deliveries within this radius are automatically free, regardless of subtotal.</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-[oklch(0.18_0.02_50)] uppercase tracking-wider">
                Charge Per KM After Free Range (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.5_0.02_60)]" />
                <input
                  type="number"
                  step="any"
                  required
                  value={perKmCharge}
                  onChange={(e) => setPerKmCharge(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full rounded-xl border border-[oklch(0.9_0.015_75)] bg-[oklch(0.98_0.005_75)] pl-10 pr-4 py-2.5 text-sm text-[oklch(0.18_0.02_50)] focus:border-brand focus:outline-none transition-colors"
                />
              </div>
              <p className="text-[10px] text-[oklch(0.5_0.02_60)]">Fee applied for every kilometer beyond the free range (if subtotal doesn't meet the global free delivery threshold).</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-brand px-8 py-3 text-sm font-bold text-brand-foreground hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Saving..." : "Save Shop Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
