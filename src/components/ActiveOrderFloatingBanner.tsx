"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useOrders } from "@/lib/orders-store";
import { ChevronRight, Flame, Bike, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const emptySubscribe = () => () => {};

interface ActiveOrderFloatingBannerProps {
  isVisible?: boolean;
}

export function ActiveOrderFloatingBanner({
  isVisible = true,
}: ActiveOrderFloatingBannerProps) {
  const orders = useOrders((s) => s.orders);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted || !orders || orders.length === 0) return null;

  const activeOrders = orders.filter(
    (o) => o.status === "active" || (o.stage >= 0 && o.stage < 3)
  );

  const activeOrder = activeOrders[0];

  if (!activeOrder) return null;

  const hasMultiple = activeOrders.length > 1;

  const stageInfo = (() => {
    if (hasMultiple) {
      return {
        title: `${activeOrders.length} Active Orders`,
        subtitle: `Order ${activeOrder.id} (+${activeOrders.length - 1} more) • Tap to view all`,
        icon: <Clock className="h-4 w-4 text-amber-400 animate-pulse" />,
      };
    }
    switch (activeOrder.stage) {
      case 0:
        return {
          title: "Order Confirmed",
          subtitle: `Order #${activeOrder.id} • Preparing soon`,
          icon: <Clock className="h-4 w-4 text-amber-400 animate-spin-slow" />,
        };
      case 1:
        return {
          title: "Cooking & Preparing",
          subtitle: `Order #${activeOrder.id} • ETA: ~${activeOrder.eta || "25 mins"}`,
          icon: <Flame className="h-4 w-4 text-orange-400 animate-pulse" />,
        };
      case 2:
        return {
          title: "Out for Delivery",
          subtitle: `Order #${activeOrder.id} • Driver is on the way!`,
          icon: <Bike className="h-4 w-4 text-emerald-400 animate-bounce" />,
        };
      default:
        return {
          title: "Order Active",
          subtitle: `Order #${activeOrder.id} • Tap to view status`,
          icon: <CheckCircle2 className="h-4 w-4 text-[#00F0FF]" />,
        };
    }
  })();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 90, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 90, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="fixed bottom-6 left-5 right-5 z-50 max-w-md mx-auto pointer-events-auto"
        >
          <Link
            href="/orders"
            className="group relative flex items-center justify-between overflow-hidden rounded-full bg-[#1A1A1A]/95 p-3 sm:p-3.5 text-[#FFF8E7] shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl border border-[#333] hover:border-[#661E28]/50 active:scale-[0.98] transition-all"
          >
            {/* Subtle Ambient Background Light */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#00F0FF]/15 blur-xl" />

            {/* Left Order Info */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Live Pulsing Dot & Stage Icon */}
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 shadow-inner">
                {stageInfo.icon}
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {stageInfo.title}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 truncate max-w-[110px]">
                    {activeOrder.item}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] font-bold text-slate-300 truncate">
                  {stageInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Right Action Arrow */}
            <div className="flex items-center gap-1 shrink-0 pl-2">
              <span className="text-[10.5px] font-black text-amber-400 uppercase tracking-wider hidden sm:inline-block">
                Track
              </span>
              <div className="grid h-7 w-7 place-items-center rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <ChevronRight className="h-4 w-4 text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
