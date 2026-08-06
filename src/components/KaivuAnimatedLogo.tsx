"use client";

import { motion } from "framer-motion";

export function KaivuAnimatedLogo() {
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        viewBox="0 0 380 120"
        className="w-[280px] sm:w-[360px] h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Mask to cut out the bite from the letter 'a' */}
          <mask id="kaivu-bite-mask">
            {/* Base white rectangle keeps the letter visible */}
            <rect x="0" y="0" width="380" height="120" fill="white" />

            {/* Black bite shapes chomp into the letter 'a' */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: 0.25,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{ transformOrigin: "140px 60px" }}
            >
              {/* Scalloped bite marks matching teeth impressions */}
              <circle cx="143" cy="55" r="7.5" fill="black" />
              <circle cx="136" cy="63" r="7" fill="black" />
              <circle cx="145" cy="65" r="6.5" fill="black" />
            </motion.g>
          </mask>
        </defs>

        {/* --- FOREGROUND LAYER (Solid Flat Pale Yellow) --- */}
        <g
          fontFamily="var(--font-brand)"
          fontSize="110"
          fontWeight="700"
          fill="#ECEAB4"
        >
          <text x="45" y="98" transform="rotate(-6 75 80)">k</text>
          <g mask="url(#kaivu-bite-mask)">
            <text x="105" y="98" transform="rotate(3 145 80)">a</text>
          </g>
          <text x="175" y="98" transform="rotate(-3 195 80)">i</text>
          <text x="210" y="98" transform="rotate(5 245 80)">v</text>
          <text x="270" y="98" transform="rotate(-4 305 80)">u</text>
        </g>

        {/* --- 3 ANIMATED CRUMB DOTS ABOVE THE 'a' BITE --- */}
        {/* Bottom Left Dot */}
        <motion.circle
          cx="120"
          cy="40"
          r="3.5"
          fill="#ECEAB4"
          initial={{ x: 20, y: 20, scale: 0, opacity: 0 }}
          animate={{ x: [20, 0], y: [20, 0, -2, 0], scale: 1, opacity: 1 }}
          transition={{
            x: { duration: 0.4, delay: 0.3, ease: "easeOut" },
            y: { duration: 0.4, delay: 0.3, ease: "easeOut" },
            scale: { duration: 0.3, delay: 0.3 },
            opacity: { duration: 0.2, delay: 0.3 },
          }}
        />

        {/* Top Middle Dot */}
        <motion.circle
          cx="128"
          cy="28"
          r="3"
          fill="#ECEAB4"
          initial={{ x: 14, y: 28, scale: 0, opacity: 0 }}
          animate={{ x: [14, 0], y: [28, 0, -3, 0], scale: 1, opacity: 1 }}
          transition={{
            x: { duration: 0.45, delay: 0.32, ease: "easeOut" },
            y: { duration: 0.45, delay: 0.32, ease: "easeOut" },
            scale: { duration: 0.3, delay: 0.32 },
            opacity: { duration: 0.2, delay: 0.32 },
          }}
        />

        {/* Top Right Dot */}
        <motion.circle
          cx="137"
          cy="33"
          r="3"
          fill="#ECEAB4"
          initial={{ x: 8, y: 24, scale: 0, opacity: 0 }}
          animate={{ x: [8, 0], y: [24, 0, -2, 0], scale: 1, opacity: 1 }}
          transition={{
            x: { duration: 0.42, delay: 0.34, ease: "easeOut" },
            y: { duration: 0.42, delay: 0.34, ease: "easeOut" },
            scale: { duration: 0.3, delay: 0.34 },
            opacity: { duration: 0.2, delay: 0.34 },
          }}
        />
      </svg>
    </div>
  );
}
