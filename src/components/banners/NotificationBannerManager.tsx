"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { usePublicSettings } from "@/lib/public-settings-store";
import { useAuth } from "@/lib/auth-store";
import { useOrders } from "@/lib/orders-store";
import { TargetAudience } from "@/lib/types/banners";
import { FullScreenInstallBanner } from "./FullScreenInstallBanner";
import { IdleNavBanner } from "./IdleNavBanner";
import { HalfScreenOfferBanner } from "./HalfScreenOfferBanner";

export function NotificationBannerManager() {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const orders = useOrders((s) => s.orders);
  const bannersConfig = usePublicSettings((s) => s.notificationBanners);

  const [activeBanner, setActiveBanner] = useState<"FULLSCREEN" | "IDLE" | "HALF_OFFER" | null>(null);

  // Audience matching helper
  const matchesAudience = useCallback((target: TargetAudience): boolean => {
    if (target === "ALL") return true;
    if (target === "GUEST") return !isAuthenticated;
    
    // Check order history
    const orderCount = orders.length;
    if (target === "FIRST_ORDER") {
      return !isAuthenticated || orderCount === 0;
    }
    if (target === "REGULAR") {
      return isAuthenticated && orderCount > 0;
    }
    return true;
  }, [isAuthenticated, orders]);

  // Route matching helper
  const matchesRoute = useCallback((routes: string[]): boolean => {
    if (!pathname || pathname.startsWith("/csuite")) return false;
    if (!routes || routes.length === 0) return true;
    if (routes.includes("ALL")) return true;
    return routes.some((r) => (r === "/" ? pathname === "/" : pathname.startsWith(r)));
  }, [pathname]);

  // Dismiss session checks
  const isDismissed = (key: string): boolean => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(key) === "true";
  };

  const setDismissed = (key: string) => {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(key, "true");
  };

  // 1. Full Screen Install Prompt Timer
  useEffect(() => {
    if (!bannersConfig?.fullScreenInstall?.enabled) return;
    if (isDismissed("kaivu_dismiss_fullscreen_install")) return;
    if (!matchesRoute(bannersConfig.fullScreenInstall.routes)) return;
    if (!matchesAudience(bannersConfig.fullScreenInstall.targetAudience)) return;

    const delay = (bannersConfig.fullScreenInstall.delaySeconds || 4) * 1000;
    const timer = setTimeout(() => {
      setActiveBanner((prev) => (prev === null ? "FULLSCREEN" : prev));
    }, delay);

    return () => clearTimeout(timer);
  }, [pathname, bannersConfig?.fullScreenInstall, matchesRoute, matchesAudience]);

  // 2. Half Screen Offer Drawer Timer
  useEffect(() => {
    if (!bannersConfig?.halfScreenOffer?.enabled) return;
    if (isDismissed("kaivu_dismiss_half_offer")) return;
    if (!matchesRoute(bannersConfig.halfScreenOffer.routes)) return;
    if (!matchesAudience(bannersConfig.halfScreenOffer.targetAudience)) return;

    const delay = (bannersConfig.halfScreenOffer.delaySeconds || 3) * 1000;
    const timer = setTimeout(() => {
      setActiveBanner((prev) => (prev === null ? "HALF_OFFER" : prev));
    }, delay);

    return () => clearTimeout(timer);
  }, [pathname, bannersConfig?.halfScreenOffer, matchesRoute, matchesAudience]);

  // 3. Idle / Inactivity 1-Minute Tracker for Small Banner
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (!bannersConfig?.idleSmallBanner?.enabled) return;
    if (isDismissed("kaivu_dismiss_idle_banner")) return;
    if (!matchesRoute(bannersConfig.idleSmallBanner.routes)) return;
    if (!matchesAudience(bannersConfig.idleSmallBanner.targetAudience)) return;

    const idleMs = (bannersConfig.idleSmallBanner.idleSeconds || 60) * 1000;

    idleTimerRef.current = setTimeout(() => {
      setActiveBanner((prev) => (prev === null ? "IDLE" : prev));
    }, idleMs);
  }, [bannersConfig?.idleSmallBanner, matchesRoute, matchesAudience]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    activityEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      activityEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  if (!bannersConfig || pathname?.startsWith("/csuite")) return null;

  return (
    <>
      {/* Fullscreen App Install */}
      {bannersConfig.fullScreenInstall && (
        <FullScreenInstallBanner
          config={bannersConfig.fullScreenInstall}
          isOpen={activeBanner === "FULLSCREEN"}
          onClose={() => {
            setActiveBanner(null);
            setDismissed("kaivu_dismiss_fullscreen_install");
          }}
        />
      )}

      {/* Small Floating Idle Nav Banner */}
      {bannersConfig.idleSmallBanner && (
        <IdleNavBanner
          config={bannersConfig.idleSmallBanner}
          isOpen={activeBanner === "IDLE"}
          onClose={() => {
            setActiveBanner(null);
            setDismissed("kaivu_dismiss_idle_banner");
          }}
        />
      )}

      {/* Half-Screen Offer Drawer */}
      {bannersConfig.halfScreenOffer && (
        <HalfScreenOfferBanner
          config={bannersConfig.halfScreenOffer}
          isOpen={activeBanner === "HALF_OFFER"}
          onClose={() => {
            setActiveBanner(null);
            setDismissed("kaivu_dismiss_half_offer");
          }}
        />
      )}
    </>
  );
}
