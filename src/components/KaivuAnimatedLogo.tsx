"use client";

import { motion } from "framer-motion";

export function KaivuAnimatedLogo() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none text-center w-full">
      {/* Exact Official Kaivu Logo with solid cream letters on Maroon canvas */}
      <motion.img
        src="/images/brand/kaivu-logo-black.png"
        alt="kaivu. Where Every Bite Hits Different"
        initial={{ opacity: 0, scale: 0.88, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        className="w-full max-w-[420px] h-auto object-contain mix-blend-screen"
      />
    </div>
  );
}
