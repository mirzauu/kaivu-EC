"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function CheesePullOverscroll() {
  const [activePull, setActivePull] = useState(0);
  const [isPullingState, setIsPullingState] = useState(false);

  // Springs for smooth drag physics
  const pullY = useSpring(0, { damping: 25, stiffness: 220, mass: 0.6 });
  const burgerScaleX = useSpring(1, { damping: 12, stiffness: 150 });
  const burgerScaleY = useSpring(1, { damping: 12, stiffness: 150 });

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const wheelTimeoutRef = useRef<any>(null);

  useEffect(() => {
    // Detect overscroll touch/drag pull-up when scrolled at absolute bottom
    const handlePointerDown = (e: PointerEvent) => {
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 15;
      
      if (isAtBottom) {
        startYRef.current = e.clientY;
        isPullingRef.current = true;
        setIsPullingState(true);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isPullingRef.current) return;
      const deltaY = startYRef.current - e.clientY;

      if (deltaY > 0) {
        // Dragging upwards at bottom of page
        // Log-damped pull distance up to max 150px
        const dampedPull = Math.min(Math.pow(deltaY, 0.75) * 2.8, 150);
        pullY.set(dampedPull);
        setActivePull(dampedPull);
      } else {
        pullY.set(0);
        setActivePull(0);
      }
    };

    const handlePointerUp = () => {
      if (isPullingRef.current) {
        isPullingRef.current = false;
        setIsPullingState(false);
        pullY.set(0);
        setActivePull(0);

        // Snap impact bounce wiggle (squash & stretch)
        burgerScaleY.set(0.76);
        burgerScaleX.set(1.24);
        setTimeout(() => {
          burgerScaleY.set(1);
          burgerScaleX.set(1);
        }, 120);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [pullY, burgerScaleX, burgerScaleY]);

  // Intercept mouse wheel scroll down when scrolled to bottom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 15;

      if (isAtBottom && e.deltaY > 0) {
        e.preventDefault();
        const current = pullY.get();
        const target = Math.min(current + e.deltaY * 0.28, 150);
        pullY.set(target);
        setActivePull(target);
        setIsPullingState(true);

        clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = setTimeout(() => {
          pullY.set(0);
          setActivePull(0);
          setIsPullingState(false);

          // Snap impact bounce wiggle
          burgerScaleY.set(0.76);
          burgerScaleX.set(1.24);
          setTimeout(() => {
            burgerScaleY.set(1);
            burgerScaleX.set(1);
          }, 120);
        }, 280);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(wheelTimeoutRef.current);
    };
  }, [pullY, burgerScaleX, burgerScaleY]);

  // Map 0-150px drag pull to a 0-280px tall bottom overscroll reveal container
  const containerHeight = useTransform(pullY, [0, 150], [0, 280]);
  
  // Opacity of "Cheese Pull!" helper text
  const labelOpacity = useTransform(pullY, [20, 80], [0, 1]);
  const labelScale = useTransform(pullY, [20, 80], [0.8, 1]);

  // Translate calculation for top half of burger
  const topHalfY = useTransform(pullY, (val) => -val * 0.5);

  // Dynamic Cheese SVG Path calculator (stretches from top veggies to bottom melting cheese)
  const calculateCheesePath = (x1: number, x2: number) => {
    const topY = 120 - activePull * 0.5; // Bottom of lettuce/tomato layer
    const bottomY = 132;                // Top of patty cheese layer
    const yMid = (topY + bottomY) / 2;

    // Strands start thick (24px) and get thinner in the middle as they stretch (down to 2.8px)
    const wTop = Math.max(24 - activePull * 0.1, 9);
    const wBottom = Math.max(24 - activePull * 0.1, 9);
    const wMid = Math.max(24 - activePull * 0.16, 2.8);

    return `
      M ${x1 - wTop / 2} ${topY}
      Q ${x1 - wMid / 2} ${yMid - 5}, ${x1 - wMid / 2} ${yMid}
      T ${x2 - wBottom / 2} ${bottomY}
      L ${x2 + wBottom / 2} ${bottomY}
      Q ${x2 + wMid / 2} ${yMid + 5}, ${x2 + wMid / 2} ${yMid}
      T ${x1 + wTop / 2} ${topY}
      Z
    `;
  };

  return (
    <motion.div
      style={{ height: containerHeight }}
      className="w-full overflow-hidden bg-background/60 flex flex-col items-center justify-center relative select-none pointer-events-none border-t border-border/5"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center py-4">
        {/* Cheese Pull Text Label */}
        <motion.div
          style={{ opacity: labelOpacity, scale: labelScale }}
          className="text-xs font-bold text-brand tracking-widest uppercase mb-4"
        >
          🧀 Cheese Pull!
        </motion.div>

        {/* Real Illustrated Cheeseburger SVG Container (Big Size 240px) */}
        <motion.div
          style={{ scaleX: burgerScaleX, scaleY: burgerScaleY }}
          className="w-[240px] h-[240px] relative flex items-center justify-center"
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 240 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Top Bun toasted radial glow */}
              <radialGradient id="topBunGrad" cx="50%" cy="30%" r="55%" fx="42%" fy="22%">
                <stop offset="0%" stopColor="#fffbeb" /> {/* Brioche interior shine */}
                <stop offset="30%" stopColor="#fef3c7" /> {/* Warm golden interior */}
                <stop offset="65%" stopColor="#f59e0b" /> {/* Rich Amber Bun */}
                <stop offset="90%" stopColor="#b45309" /> {/* Golden Brown */}
                <stop offset="100%" stopColor="#78350f" /> {/* Toasted Crust */}
              </radialGradient>

              {/* Bottom Bun toasted gradient */}
              <linearGradient id="bottomBunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              {/* Juicy Tomato gradient */}
              <radialGradient id="tomatoGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="70%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </radialGradient>

              {/* Hand-Smashed Beef Patty caramelization */}
              <linearGradient id="pattyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#451a03" />
                <stop offset="50%" stopColor="#78350f" />
                <stop offset="100%" stopColor="#1c0d02" />
              </linearGradient>

              {/* Cheese gradient */}
              <linearGradient id="cheeseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="15%" stopColor="#fbbf24" />
                <stop offset="85%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>

              {/* Advanced Noise Filter for Sizzled Meat Texture */}
              <filter id="pattyTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" result="noise" />
                <feColorMatrix type="matrix" values="
                  0.32 0 0 0 0.12
                  0 0.18 0 0 0.06
                  0 0 0.1 0 0.02
                  0 0 0 0.85 0" in="noise" result="coloredNoise" />
                <feComposite operator="in" in2="SourceGraphic" />
                <feBlend mode="multiply" in="SourceGraphic" in2="coloredNoise" />
              </filter>

              {/* Volumetric shadows to separate layers */}
              <filter id="layerShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1e0b00" floodOpacity="0.25" />
              </filter>

              <filter id="cheeseShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#9a3412" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* 1. Stretchy cheese strands (Drawn between top veggies and bottom patty cheese) */}
            {activePull > 2 && (
              <g fill="url(#cheeseGrad)" stroke="#d97706" strokeWidth="2.2" strokeLinejoin="round" filter="url(#cheeseShadow)">
                <path d={calculateCheesePath(72, 72)} />
                <path d={calculateCheesePath(120, 120)} />
                <path d={calculateCheesePath(168, 168)} />
              </g>
            )}

            {/* 2. Top Half (Bun + Lettuce + Tomato, translates up with pull) */}
            <motion.g style={{ y: topHalfY }}>
              {/* Sesame Top Brioche Bun */}
              <path
                d="M 38 108 C 38 32, 70 24, 120 24 C 170 24, 202 32, 202 108 Z"
                fill="url(#topBunGrad)"
                stroke="#78350f"
                strokeWidth="2.5"
                filter="url(#layerShadow)"
              />

              {/* Bun Gloss Highlight */}
              <path
                d="M 58 64 C 80 48, 160 48, 182 64 C 162 56, 80 56, 58 64 Z"
                fill="#ffffff"
                opacity="0.35"
              />
              {/* Crust shadow overlay */}
              <path
                d="M 38 108 C 50 109, 190 109, 202 108"
                stroke="#451a03"
                strokeWidth="2.5"
                opacity="0.6"
              />

              {/* Detailed 3D Sesame Seeds with highlight and shadow */}
              <g fill="#fef08a" stroke="#78350f" strokeWidth="0.5">
                {/* Seed 1 */}
                <ellipse cx="68" cy="62" rx="1.8" ry="3.8" transform="rotate(-30 68 62)" />
                {/* Seed 2 */}
                <ellipse cx="98" cy="52" rx="1.8" ry="3.8" transform="rotate(15 98 52)" />
                {/* Seed 3 */}
                <ellipse cx="120" cy="46" rx="1.8" ry="3.8" />
                {/* Seed 4 */}
                <ellipse cx="142" cy="52" rx="1.8" ry="3.8" transform="rotate(-15 142 52)" />
                {/* Seed 5 */}
                <ellipse cx="172" cy="62" rx="1.8" ry="3.8" transform="rotate(30 172 62)" />
                {/* Seed 6 */}
                <ellipse cx="82" cy="78" rx="1.8" ry="3.8" transform="rotate(10 82 78)" />
                {/* Seed 7 */}
                <ellipse cx="110" cy="72" rx="1.8" ry="3.8" transform="rotate(-20 110 72)" />
                {/* Seed 8 */}
                <ellipse cx="132" cy="72" rx="1.8" ry="3.8" transform="rotate(20 132 72)" />
                {/* Seed 9 */}
                <ellipse cx="158" cy="78" rx="1.8" ry="3.8" transform="rotate(-10 158 78)" />
              </g>

              {/* Juicy Tomato Slices */}
              {/* Left Tomato */}
              <g filter="url(#layerShadow)">
                <rect x="42" y="106" width="74" height="15" rx="7.5" fill="url(#tomatoGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
                {/* Seed Cavities */}
                <path d="M 52 114 C 52 110, 72 110, 72 114 Z" fill="#7f1d1d" opacity="0.75" />
                <path d="M 82 114 C 82 110, 102 110, 102 114 Z" fill="#7f1d1d" opacity="0.75" />
                {/* Yellow seeds */}
                <ellipse cx="58" cy="112" rx="1" ry="1.8" fill="#fbbf24" transform="rotate(30 58 112)" />
                <ellipse cx="66" cy="112" rx="1" ry="1.8" fill="#fbbf24" transform="rotate(-30 66 112)" />
                <ellipse cx="88" cy="112" rx="1" ry="1.8" fill="#fbbf24" transform="rotate(30 88 112)" />
                <ellipse cx="96" cy="112" rx="1" ry="1.8" fill="#fbbf24" transform="rotate(-30 96 112)" />
                {/* Tomato Skin Gloss */}
                <path d="M 46 109 Q 78 107 112 109" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.45" />
              </g>

              {/* Right Tomato */}
              <g filter="url(#layerShadow)">
                <rect x="124" y="106" width="74" height="15" rx="7.5" fill="url(#tomatoGrad)" stroke="#7f1d1d" strokeWidth="1.5" />
                {/* Seed Cavities */}
                <path d="M 134 114 C 134 110, 154 110, 154 114 Z" fill="#7f1d1d" opacity="0.75" />
                <path d="M 166 114 C 166 110, 186 110, 186 114 Z" fill="#7f1d1d" opacity="0.75" />
                {/* Seeds */}
                <ellipse cx="140" cy="112" rx="1" ry="1.8" fill="#fbbf24" transform="rotate(30 140 112)" />
                <ellipse cx="148" cy="112" rx="1" ry="1.8" fill="#fbbf24" transform="rotate(-30 148 112)" />
                <ellipse cx="172" cy="112" rx="1" ry="1.8" fill="#fbbf24" transform="rotate(30 172 112)" />
                <ellipse cx="180" cy="112" rx="1" ry="1.8" fill="#fbbf24" transform="rotate(-30 180 112)" />
                {/* Gloss */}
                <path d="M 128 109 Q 160 107 194 109" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.45" />
              </g>

              {/* Wavy Lettuce Ribbon Layer 1 (Dark green backing shadow) */}
              <path
                d="M 38 120 Q 56 126 74 120 T 110 120 T 146 120 T 182 120 T 202 120 L 202 124 L 38 124 Z"
                fill="#14532d"
                opacity="0.9"
              />

              {/* Lettuce Ribbon Layer 2 (Crisp green folds) */}
              <path
                d="M 36 121 C 46 126, 56 116, 66 121 C 76 126, 86 116, 96 121 C 106 126, 116 116, 126 121 C 136 126, 146 116, 156 121 C 166 126, 176 116, 186 121 C 196 126, 201 120, 204 120"
                fill="none"
                stroke="#16a34a"
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Highlight lines on lettuce leaves */}
              <path
                d="M 36 121 C 46 126, 56 116, 66 121 C 76 126, 86 116, 96 121 C 106 126, 116 116, 126 121 C 136 126, 146 116, 156 121 C 166 126, 176 116, 186 121 C 196 126, 201 120, 204 120"
                fill="none"
                stroke="#86efac"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Lettuce veins details */}
              <g stroke="#bbf7d0" strokeWidth="1" strokeLinecap="round" opacity="0.7">
                <path d="M 50 121 L 52 117" />
                <path d="M 80 121 L 82 117" />
                <path d="M 110 121 L 112 117" />
                <path d="M 140 121 L 142 117" />
                <path d="M 170 121 L 172 117" />
              </g>
            </motion.g>

            {/* 3. Bottom Half (Patty + Bottom Bun, remains anchored) */}
            <g>
              {/* Melting cheese slice resting on patty with volumetric drop shadow */}
              <path
                d="M 38 131 L 202 131 L 200 138 L 180 148 Q 165 140 150 148 L 120 136 L 90 148 L 60 137 L 44 144 L 38 134 Z"
                fill="url(#cheeseGrad)"
                stroke="#d97706"
                strokeWidth="1.5"
                filter="url(#cheeseShadow)"
              />
              {/* Cheese highlights for thick melting look */}
              <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.45">
                <path d="M 52 133 L 64 133" />
                <path d="M 104 133 L 116 133" />
                <path d="M 160 133 L 172 133" />
              </g>

              {/* Craggy Hand-Smashed Beef Patty (uses fractal noise texture filter) */}
              <path
                d="M 38 138 
                   C 34 140, 41 149, 47 146 
                   C 54 143, 59 149, 67 145
                   C 74 142, 79 150, 87 146
                   C 95 142, 101 150, 109 146
                   C 117 143, 124 150, 133 146
                   C 141 142, 147 150, 155 146
                   C 164 143, 171 150, 179 146
                   C 187 142, 191 150, 197 146
                   C 203 142, 201 136, 197 138
                   C 191 140, 185 136, 177 138
                   C 169 140, 161 136, 153 138
                   C 145 140, 137 136, 129 138
                   C 121 140, 113 136, 105 138
                   C 97 140, 89 136, 81 138
                   C 73 140, 65 136, 57 138
                   C 49 140, 41 136, 38 138 Z"
                fill="url(#pattyGrad)"
                filter="url(#pattyTexture)"
              />

              {/* Sizzle grill lines and char highlights */}
              <g stroke="#1c0d02" strokeWidth="2.8" strokeLinecap="round" opacity="0.9">
                <path d="M 52 140 L 56 148" />
                <path d="M 76 139 L 80 150" />
                <path d="M 104 138 L 108 150" />
                <path d="M 132 139 L 136 149" />
                <path d="M 160 138 L 164 150" />
                <path d="M 184 140 L 188 148" />
              </g>
              <g stroke="#b45309" strokeWidth="2.2" strokeLinecap="round" opacity="0.6">
                <path d="M 64 144 L 70 145" />
                <path d="M 92 143 L 98 144" />
                <path d="M 120 143 L 126 144" />
                <path d="M 148 144 L 154 145" />
                <path d="M 172 145 L 178 146" />
              </g>

              {/* Bottom Bun brioche style */}
              <path
                d="M 44 149 C 44 176, 196 176, 196 149 Z"
                fill="url(#bottomBunGrad)"
                stroke="#78350f"
                strokeWidth="2.5"
                filter="url(#layerShadow)"
              />
            </g>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
