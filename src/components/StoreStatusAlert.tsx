"use client";

import { useEffect, useState } from "react";
import { usePublicSettings } from "@/lib/public-settings-store";
import { Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function StoreStatusAlert() {
  const storeStatus = usePublicSettings((s) => s.storeStatus);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number; totalSeconds: number } | null>(null);

  useEffect(() => {
    if (!storeStatus?.closingTimerEndsAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTime = () => {
      const endsAt = new Date(storeStatus.closingTimerEndsAt!).getTime();
      const diffMs = endsAt - Date.now();

      if (diffMs <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, totalSeconds: 0 });
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      setTimeLeft({ minutes: mins, seconds: secs, totalSeconds: totalSec });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [storeStatus?.closingTimerEndsAt]);

  const isClosed = !storeStatus?.isOpen || (timeLeft !== null && timeLeft.totalSeconds <= 0);
  const isClosingSoon = storeStatus?.isOpen && timeLeft !== null && timeLeft.totalSeconds > 0;

  if (!isClosed && !isClosingSoon) {
    return null;
  }

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      {isClosed ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-[#661E28] text-white px-4 py-2 text-center text-xs font-bold shadow-md flex items-center justify-center gap-2 border-b border-red-900/30 z-40 sticky top-0"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-300 animate-pulse" />
          <span className="truncate max-w-[90%]">
            {storeStatus?.closedMessage || "We are currently closed for orders. Check back soon!"}
          </span>
        </motion.div>
      ) : isClosingSoon ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-black px-4 py-2 text-center text-xs font-black shadow-md flex items-center justify-center gap-2 border-b border-amber-600/40 z-40 sticky top-0"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <Clock className="h-4 w-4 shrink-0 text-black" />
          <span className="truncate">
            Closing orders soon! <span className="underline font-mono bg-black text-amber-300 px-1.5 py-0.5 rounded-md ml-1 tracking-wider">{formatTime(timeLeft!.minutes, timeLeft!.seconds)}</span> remaining
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
