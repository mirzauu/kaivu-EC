"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles, Zap, BellRing, Smartphone, Share, PlusSquare } from "lucide-react";
import { FullScreenInstallBannerConfig } from "@/lib/types/banners";

interface FullScreenInstallBannerProps {
  config: FullScreenInstallBannerConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function FullScreenInstallBanner({ config, isOpen, onClose }: FullScreenInstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Detect standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        onClose();
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers without beforeinstallprompt or desktop
      setShowIOSGuide(true);
    }
  };

  if (!isOpen || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-md h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[36px] sm:rounded-[36px] bg-gradient-to-b from-[#1c1214] via-[#120a0c] to-[#0a0507] border border-amber-500/20 text-white shadow-2xl overflow-y-auto flex flex-col justify-between p-6 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header & Badges */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/20 border border-brand/40 text-brand text-xs font-black uppercase tracking-wider mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{config.badgeText || "100% Free & Fast"}</span>
            </div>

            {/* App Icon Visual */}
            <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-brand via-amber-500 to-amber-600 p-1 shadow-2xl shadow-brand/30 flex items-center justify-center my-2">
              <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center text-center p-2">
                <span className="text-3xl sm:text-4xl">🍔</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand mt-1">KAIVU</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                APP
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-center text-white tracking-tight mt-4">
              {config.title || "Experience Kaivu on the App"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 text-center mt-2 leading-relaxed max-w-xs mx-auto">
              {config.description || "Install Kaivu for lightning-fast 1-tap orders, real-time live GPS order tracking & VIP app-only treats."}
            </p>
          </div>

          {/* Perks Feature List */}
          <div className="my-6 space-y-3 bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand/20 text-brand">
                <Zap className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Instant 1-Tap Ordering</p>
                <p className="text-[10px] text-slate-400">Never wait in browser tabs. Opens like a native app.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-400">
                <BellRing className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Real-Time Kitchen Updates</p>
                <p className="text-[10px] text-slate-400">Get notified the second your burger hits the grill.</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-400/20 text-emerald-400">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Lightweight & Offline-Ready</p>
                <p className="text-[10px] text-slate-400">Uses less than 2 MB. Zero App Store downloads needed.</p>
              </div>
            </div>
          </div>

          {/* iOS Guide if needed */}
          {showIOSGuide && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs text-left space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-amber-300">
                <Share className="h-4 w-4" /> How to install on your device:
              </p>
              <p className="text-[11px] leading-relaxed">
                1. Tap the <span className="font-bold text-white">Share</span> button in Safari / Chrome.<br />
                2. Scroll down and select <span className="font-bold text-white inline-flex items-center gap-1"><PlusSquare className="h-3 w-3" /> Add to Home Screen</span>.
              </p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleInstallClick}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand to-amber-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-brand/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              <span>{config.buttonText || "Install App Now"}</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-medium transition-colors cursor-pointer"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
