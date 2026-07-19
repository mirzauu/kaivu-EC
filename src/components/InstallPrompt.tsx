"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { useAuth, auth } from "@/lib/auth-store";

// Helper function to convert VAPID public key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Request permission and subscribe the user to push notifications
async function subscribeToPushNotifications() {
  if (
    typeof window === "undefined" || 
    !("serviceWorker" in navigator) || 
    !("PushManager" in window)
  ) {
    return;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    const existingSubscription = await reg.pushManager.getSubscription();
    if (existingSubscription) {
      // Sync with backend in case it changed
      await fetch("/api/user/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: existingSubscription.toJSON() }),
      });
      return;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("VAPID public key is missing in environment variables");
      return;
    }

    // Subscribe user
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    };

    const rawSub = await reg.pushManager.subscribe(subscribeOptions);
    const subscription = rawSub.toJSON();

    // Send to backend
    await fetch("/api/user/push-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });
    console.log("Successfully subscribed to Web Push Notifications");
  } catch (err) {
    console.error("Failed to subscribe to Web Push:", err);
  }
}

export function InstallPrompt() {
  const user = useAuth((s) => s.user);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => {
          console.log("Service Worker registered with scope:", reg.scope);
          
          // Auto-sync subscription on load if permission has already been granted
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            subscribeToPushNotifications();
          }
        })
        .catch((err) => console.error("Service Worker registration failed:", err));
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setIsVisible(false);
      return;
    }

    // 2. Check standalone mode in browser first
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (navigator as any).standalone === true;

    if (isStandalone) {
      // If standalone (running as PWA on home screen), auto-subscribe to push notifications
      subscribeToPushNotifications();

      // If DB doesn't know it's installed, sync it
      if (!user.pwaInstalled) {
        fetch("/api/user/pwa-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "installed" }),
        }).then(() => auth.refreshUser());
      }
      setIsVisible(false);
      return;
    }

    // 3. Check PWA conditions from user DB record
    // Only show if user has placed at least 1 order
    if (user.orderCount < 1) {
      setIsVisible(false);
      return;
    }

    // Don't show if already installed according to DB
    if (user.pwaInstalled) {
      setIsVisible(false);
      return;
    }

    // Don't show if dismissed on the current order count
    if (user.orderCount <= user.pwaLastDismissedOrderCount) {
      setIsVisible(false);
      return;
    }

    // 4. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    // 5. Capture native install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPrompt = e;
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // For iOS, show the prompt manually after 3 seconds since there is no beforeinstallprompt event
    if (isAppleMobile) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [user]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      // For iOS we record it as installed when they express intent to install
      try {
        await fetch("/api/user/pwa-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "installed" }),
        });
        auth.refreshUser();
      } catch (err) {
        console.error("Failed to save iOS install action", err);
      }
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      try {
        await fetch("/api/user/pwa-action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "installed" }),
        });
        auth.refreshUser();
        // Prompt for notification permissions immediately after installing
        setTimeout(() => {
          subscribeToPushNotifications();
        }, 1000);
      } catch (err) {
        console.error("Failed to save install action", err);
      }
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = async () => {
    try {
      await fetch("/api/user/pwa-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismissed" }),
      });
      auth.refreshUser();
    } catch (err) {
      console.error("Failed to save dismiss action", err);
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 inset-x-4 z-50 mx-auto max-w-sm">
      <div className="overflow-hidden rounded-3xl bg-surface p-4 shadow-xl border border-brand/10 ring-1 ring-black/5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <img
            src={getImageUrl("/images/menu/burger-classic.jpg")}
            alt="Kaivu Logo"
            className="h-12 w-12 rounded-2xl object-cover border border-accent/30"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold">Install Kaivu Web App</h4>
            <p className="text-xs text-muted-foreground leading-normal mt-0.5">
              Add Kaivu to your home screen for quick, one-tap burger ordering!
            </p>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-accent cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-full border border-border py-2 text-xs font-semibold hover:bg-accent cursor-pointer text-center"
          >
            Maybe later
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-brand py-2 text-xs font-bold text-brand-foreground hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </button>
        </div>

        {showIOSInstructions && (
          <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
              <Share className="h-4 w-4 text-brand" /> How to install on iOS:
            </p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Tap the <span className="font-semibold text-foreground">Share</span> button at the bottom of Safari.</li>
              <li>Scroll down and select <span className="font-semibold text-foreground">Add to Home Screen</span>.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
