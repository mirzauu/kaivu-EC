"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Tag, Copy, Check, X, ArrowRight, Sparkles, Gift } from "lucide-react";
import { toast } from "sonner";
import { HalfScreenOfferBannerConfig } from "@/lib/types/banners";

interface HalfScreenOfferBannerProps {
  config: HalfScreenOfferBannerConfig;
  isOpen: boolean;
  onClose: () => void;
}

export function HalfScreenOfferBanner({ config, isOpen, onClose }: HalfScreenOfferBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!config.promoCode) return;
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(config.promoCode);
      setCopied(true);
      toast.success(`Coupon code "${config.promoCode}" copied to clipboard!`);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9990] flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 340, damping: 30 }}
          className="relative w-full max-w-md max-h-[58vh] sm:max-h-[52vh] rounded-t-[32px] sm:rounded-[32px] bg-gradient-to-b from-[#1c0e12] via-[#12070a] to-[#080305] border-t sm:border border-amber-500/30 p-6 shadow-2xl text-white overflow-y-auto flex flex-col justify-between"
        >
          {/* Pull Handle Indicator */}
          <div className="mx-auto h-1.5 w-12 rounded-full bg-white/20 -mt-2 mb-3" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close offer"
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div>
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="h-3 w-3" />
              <span>{config.badgeText || "BUY 1 GET 1 FREE"}</span>
            </div>

            {/* Offer Header & Title */}
            <div className="flex items-start gap-3.5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 via-rose-600 to-brand text-white shadow-lg shadow-brand/25">
                <Gift className="h-6 w-6 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
                  {config.title || "BUY 1 GET 1 FREE on First Order!"}
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {config.description || "Add any 2 artisanal craft burgers to your cart & get the second one completely FREE! Applied automatically at checkout."}
                </p>
              </div>
            </div>

            {/* Promo Code Box */}
            {config.promoCode && (
              <div className="mt-4 rounded-2xl bg-white/5 border border-dashed border-amber-500/40 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/20 text-amber-400">
                    <Tag className="h-4 w-4 shrink-0" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Coupon / Offer Code</p>
                    <p className="text-sm font-black text-amber-400 tracking-wider font-mono">
                      {config.promoCode}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-amber-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-6 flex items-center gap-3">
            <Link
              href={config.buttonLink || "/menu?category=Burgers"}
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-brand text-slate-950 font-extrabold text-sm shadow-xl shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{config.buttonText || "Claim BOGO Offer"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={onClose}
              className="px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              No thanks
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
