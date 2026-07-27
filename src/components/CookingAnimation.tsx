"use client";

import { motion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";

export function CookingAnimation() {
  return (
    <div className="relative flex flex-col items-center justify-center pt-2 pb-1 select-none">
      {/* Floating Steam Wisps */}
      <div className="absolute -top-3 flex justify-center gap-3 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ y: 8, opacity: 0, scale: 0.6 }}
            animate={{
              y: [-2, -22, -36],
              opacity: [0, 0.7, 0],
              scale: [0.6, 1.2, 0.9],
              x: [0, i % 2 === 0 ? 6 : -6, i % 2 === 0 ? -4 : 4],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              delay: i * 0.7,
              ease: "easeOut",
            }}
            className="text-white/40 text-xs font-bold"
          >
            ☁️
          </motion.span>
        ))}
      </div>

      {/* Sizzling Grill Pan & Patty Container */}
      <div className="relative flex items-center justify-center">
        {/* Animated Heat Glow Ring */}
        <motion.div
          animate={{
            scale: [0.95, 1.12, 0.95],
            opacity: [0.3, 0.65, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute h-16 w-28 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/40 to-yellow-500/30 blur-md"
        />

        {/* Frying Pan / Grill Graphic */}
        <div className="relative z-10 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20 shadow-lg">
          {/* Animated Sizzling Flame Icon */}
          <motion.div
            animate={{
              scale: [1, 1.2, 0.9, 1.15, 1],
              rotate: [-3, 5, -4, 3, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 text-white shadow-md"
          >
            <Flame className="h-4 w-4 fill-white" />
          </motion.div>

          {/* Sizzling Burger Emoji bouncing gently */}
          <motion.span
            animate={{
              y: [0, -3, 0],
              rotate: [0, -2, 2, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-xl"
          >
            🍳
          </motion.span>

          {/* Sizzling Label */}
          <span className="text-xs font-bold uppercase tracking-wider text-yellow-200 drop-shadow-sm flex items-center gap-1">
            Sizzling Fresh <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
          </span>
        </div>
      </div>
    </div>
  );
}
