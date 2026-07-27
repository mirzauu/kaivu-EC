"use client";

import { useLocation, locationStore } from "@/lib/location-store";
import { MapPin, X } from "lucide-react";
import { useEffect } from "react";

export function LocationPermissionModal() {
  const isOpen = useLocation((s) => s.showPermissionModal);
  const message = useLocation((s) => s.permissionMessage);

  // Auto-close after 5 seconds to act like a toast
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        locationStore.closePermissionModal();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="flex max-w-[90vw] items-center gap-3 rounded-full bg-surface px-4 py-2.5 shadow-lg border border-border">
        <MapPin className="h-4 w-4 shrink-0 text-brand" />
        <p className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
          {message || "Location blocked. Check browser settings."}
        </p>
        <button
          onClick={() => locationStore.closePermissionModal()}
          className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
