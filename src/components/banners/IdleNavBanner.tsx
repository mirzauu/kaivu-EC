"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Flame, X, ArrowRight, Clock } from "lucide-react";
import { IdleNavBannerConfig } from "@/lib/types/banners";

interface IdleNavBannerProps {
  config: IdleNavBannerConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function IdleNavBanner({ config, isOpen, onClose }: IdleNavBannerProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 380, damping: 26 }}
        className="fixed bottom-24 sm:bottom-8 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c0f12] via-[#241217] to-[#1a0c10] border border-brand/40 p-4 shadow-2xl backdrop-blur-xl text-white">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-brand/30 rounded-full blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Dismiss banner"
            className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            {/* Animated Flame Icon */}
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-amber-500 text-slate-950 shadow-md shadow-brand/20">
              <Flame className="h-5 w-5 animate-pulse" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                <Clock className="h-3 w-3" />
                <span>Express Kitchen Priority</span>
              </div>
              <h4 className="text-sm font-black text-white truncate mt-0.5">
                {config.title || "Still thinking?"}
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 leading-snug">
                {config.description || "Our kitchen is fired up! Order now for instant express preparation."}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={config.buttonLink || "/menu"}
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand text-slate-950 text-xs font-black shadow-md hover:bg-brand/90 active:scale-95 transition-all"
                >
                  <span>{config.buttonText || "Explore Menu"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={onClose}
                  className="text-[11px] text-slate-400 hover:text-white px-2 py-1 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
