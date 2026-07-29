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
          {/* Mask to cut out the bite from the letter 'A' */}
          <mask id="kaivu-bite-mask">
            {/* Base white rectangle keeps the letter visible */}
            <rect x="0" y="0" width="380" height="120" fill="white" />

            {/* Black bite shapes chomp into the letter 'A' */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.35,
                delay: 0.25,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              style={{ transformOrigin: "142px 46px" }}
            >
              {/* Scalloped bite marks matching teeth impressions */}
              <circle cx="145" cy="40" r="7.5" fill="black" />
              <circle cx="138" cy="48" r="7" fill="black" />
              <circle cx="147" cy="50" r="6.5" fill="black" />
            </motion.g>
          </mask>
        </defs>

        {/* --- LETTER K --- */}
        <g stroke="#24060A" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
          <line x1="38" y1="36" x2="38" y2="94" />
          <path d="M72 36 L38 65 L74 94" />
        </g>

        {/* --- LETTER A (WITH ANIMATED BITE CUTOUT) --- */}
        <g mask="url(#kaivu-bite-mask)" stroke="#24060A" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
          <path d="M102 94 L127 36 L152 94" />
          <line x1="112" y1="74" x2="142" y2="74" strokeWidth="15" />
        </g>

        {/* --- 3 ANIMATED CRUMB DOTS ABOVE THE 'A' BITE --- */}
        {/* Bottom Left Dot */}
        <motion.circle
          cx="120"
          cy="26"
          r="3.5"
          fill="#24060A"
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
          cy="15"
          r="3"
          fill="#24060A"
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
          cy="20"
          r="3"
          fill="#24060A"
          initial={{ x: 8, y: 24, scale: 0, opacity: 0 }}
          animate={{ x: [8, 0], y: [24, 0, -2, 0], scale: 1, opacity: 1 }}
          transition={{
            x: { duration: 0.42, delay: 0.34, ease: "easeOut" },
            y: { duration: 0.42, delay: 0.34, ease: "easeOut" },
            scale: { duration: 0.3, delay: 0.34 },
            opacity: { duration: 0.2, delay: 0.34 },
          }}
        />

        {/* --- LETTER I --- */}
        <g stroke="#24060A" strokeWidth="18" strokeLinecap="round">
          <line x1="188" y1="36" x2="188" y2="94" />
        </g>

        {/* --- LETTER V --- */}
        <g stroke="#24060A" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
          <path d="M222 36 L245 94 L268 36" />
        </g>

        {/* --- LETTER U --- */}
        <g stroke="#24060A" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
          <path d="M302 36 L302 74 C302 94, 342 94, 342 74 L342 36" />
        </g>
      </svg>
    </div>
  );
}
