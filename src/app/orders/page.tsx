"use client";

import { useEffect, useRef, useState } from "react";
import { Package, CheckCircle2, Clock, ChefHat, Bike } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useOrders } from "@/lib/orders-store";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

const stages = ["Confirmed", "Cooking", "On the way", "Delivered"];

const ConfirmedAnimation = () => {
  const [animationEnded, setAnimationEnded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Transition to confirmed checkmark state after playing the 3D fist-bump animation once
    const timer = setTimeout(() => {
      setAnimationEnded(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return <div className="flex-1 w-full min-h-[380px]" />;
  }

  return (
    <div className="relative flex-1 w-full min-h-[380px] flex flex-col items-center justify-center overflow-hidden">
      {!animationEnded ? (
        <svg viewBox="0 0 520 360" className="w-full max-w-[380px] h-auto mx-auto my-auto">
          <defs>
            {/* Claymorphism 3D specular highlight and drop shadow filter */}
            <filter id="clay-3d" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
              <feOffset in="blur" dx="2" dy="5" result="offset" />
              <feFlood floodColor="#40271D" floodOpacity={0.18} result="shadowColor" />
              <feComposite in2="offset" operator="in" result="dropShadow" />
              
              {/* Specular lighting for 3D clay glow */}
              <feSpecularLighting in="SourceAlpha" surfaceScale={6} specularConstant={1.5} specularExponent={20} lightingColor="#ffffff" result="specOut">
                <fePointLight x="-100" y="-120" z="220" />
              </feSpecularLighting>
              <feComposite in2="SourceAlpha" operator="in" result="specular" />
              
              <feMerge>
                <feMergeNode in="dropShadow" />
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="specular" />
              </feMerge>
            </filter>

            {/* Left Arm 3D Coral Gradient */}
            <linearGradient id="left-arm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA494" />
              <stop offset="60%" stopColor="#FF6E54" />
              <stop offset="100%" stopColor="#E63F28" />
            </linearGradient>

            {/* Right Arm 3D Rose Gradient */}
            <linearGradient id="right-arm-grad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF94B8" />
              <stop offset="60%" stopColor="#FF5488" />
              <stop offset="100%" stopColor="#D8285C" />
            </linearGradient>

            {/* Ambient Shadow under the collision */}
            <radialGradient id="amb-shadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#40271D" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#40271D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Shadow */}
          <ellipse cx="260" cy="300" rx="140" ry="12" fill="url(#amb-shadow)" />

          {/* --- LEFT HAND --- */}
          <motion.g
            initial={{ x: -180, rotate: -15 }}
            animate={{
              x: [-180, -200, 10, -5, 0],
              rotate: [-15, -25, 6, -2, 0],
            }}
            transition={{
              duration: 2.2,
              ease: "easeInOut",
              times: [0, 0.4, 0.65, 0.8, 1],
            }}
            style={{ originX: "60px", originY: "180px" }}
          >
            {/* Left Arm sleeve & body */}
            <path
              d="M -60,135 C 10,130 90,125 150,140 C 180,147 195,160 195,180 C 195,200 180,213 150,220 C 90,230 10,225 -60,220 Z"
              fill="url(#left-arm-grad)"
              filter="url(#clay-3d)"
            />
            {/* Fingers (Curled fist knuckles) */}
            <g transform="translate(170, 138)" filter="url(#clay-3d)">
              <rect x="15" y="4" width="28" height="16" rx="8" fill="#FFA494" />
              <rect x="20" y="18" width="30" height="16" rx="8" fill="#FF826C" />
              <rect x="18" y="32" width="30" height="16" rx="8" fill="#FF5D43" />
              <rect x="12" y="46" width="26" height="16" rx="8" fill="#E63F28" />
              {/* Thumb */}
              <path
                d="M -2,8 C 15,3 32,10 32,25 C 32,35 15,35 3,30 Z"
                fill="#FFA494"
              />
            </g>
          </motion.g>

          {/* --- RIGHT HAND --- */}
          <motion.g
            initial={{ x: 180, rotate: 15 }}
            animate={{
              x: [180, 200, -10, 5, 0],
              rotate: [15, 25, -6, 2, 0],
            }}
            transition={{
              duration: 2.2,
              ease: "easeInOut",
              times: [0, 0.4, 0.65, 0.8, 1],
            }}
            style={{ originX: "460px", originY: "180px" }}
          >
            {/* Right Arm sleeve & body */}
            <path
              d="M 580,135 C 510,130 430,125 370,140 C 340,147 325,160 325,180 C 325,200 340,213 370,220 C 430,230 510,225 580,220 Z"
              fill="url(#right-arm-grad)"
              filter="url(#clay-3d)"
            />
            {/* Fingers (Curled fist knuckles) */}
            <g transform="translate(290, 138)" filter="url(#clay-3d)">
              <rect x="10" y="4" width="28" height="16" rx="8" fill="#FF94B8" />
              <rect x="5" y="18" width="30" height="16" rx="8" fill="#FF72A0" />
              <rect x="7" y="32" width="30" height="16" rx="8" fill="#FF4E83" />
              <rect x="14" y="46" width="26" height="16" rx="8" fill="#D8285C" />
              {/* Thumb */}
              <path
                d="M 32,8 C 15,3 -2,10 -2,25 C -2,35 15,35 27,30 Z"
                fill="#FF94B8"
              />
            </g>
          </motion.g>

          {/* --- COLLISION EFFECTS (Triggers at t=1.4s (0.65 of 2.2s)) --- */}
          {/* Shockwave circle */}
          <motion.circle
            cx="260"
            cy="178"
            r="45"
            fill="none"
            stroke="#F2DFB5"
            strokeWidth="4"
            animate={{
              scale: [0, 0, 1.5, 2.2, 0],
              opacity: [0, 0, 0.9, 0, 0],
            }}
            transition={{
              duration: 2.2,
              ease: "easeOut",
              times: [0, 0.62, 0.65, 0.85, 1],
            }}
          />

          {/* Sparkles burst */}
          <g transform="translate(260, 178)">
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <motion.g
                key={i}
                animate={{
                  scale: [0, 0, 1.4, 0],
                  opacity: [0, 0, 1, 0],
                  x: [0, 0, Math.cos((angle * Math.PI) / 180) * 45, Math.cos((angle * Math.PI) / 180) * 60],
                  y: [0, 0, Math.sin((angle * Math.PI) / 180) * 45, Math.sin((angle * Math.PI) / 180) * 60],
                }}
                transition={{
                  duration: 2.2,
                  ease: "easeOut",
                  times: [0, 0.62, 0.72, 1],
                }}
              >
                <circle cx="0" cy="0" r="4.5" fill={i % 2 === 0 ? "#F2DFB5" : "#40271D"} />
              </motion.g>
            ))}
          </g>
        </svg>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="flex flex-col items-center justify-center text-center p-6"
        >
          {/* Animated checkmark circle */}
          <div className="relative w-24 h-24 bg-brand/10 rounded-full flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="w-16 h-16 bg-brand rounded-full flex items-center justify-center shadow-lg shadow-brand/20"
            >
              <CheckCircle2 className="w-9 h-9 text-brand-foreground" strokeWidth={3} />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 border-2 border-brand rounded-full"
            />
          </div>

          <motion.h3 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-foreground mb-2"
          >
            Order Confirmed!
          </motion.h3>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground max-w-[260px]"
          >
            Your order is confirmed and is being sent to the kitchen.
          </motion.p>
        </motion.div>
      )}
    </div>
  );
};

const OrderAnimation = ({ stage }: { stage: number }) => {
  if (stage === 0) {
    return <ConfirmedAnimation />;
  }
  if (stage === 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-6 w-full overflow-hidden">
        {/* ===== COOKING ANIMATION: exact recreation of the reference illustration ===== */}
        <svg viewBox="0 0 560 430" className="w-full max-w-[340px] h-auto mx-auto my-auto">
          <defs>
            <clipPath id="blob-clip">
              <path d="M175,60 C210,20 380,10 460,60 C530,100 570,200 550,300 C530,390 450,400 360,390 C270,380 200,390 160,350 C110,300 90,200 120,120 Z" />
            </clipPath>
          </defs>

          {/* ── BACKGROUND ── */}
          {/* Peach-pink blob background */}
          <path
            d="M175,60 C210,20 380,10 460,60 C530,100 570,200 550,300 C530,390 450,400 360,390 C270,380 200,390 160,350 C110,300 90,200 120,120 Z"
            fill="#F5C9B6"
          />

          {/* White ovals / highlights inside blob */}
          <ellipse cx="348" cy="102" rx="20" ry="12" fill="white" opacity="0.65" transform="rotate(-20,348,102)" />
          <ellipse cx="498" cy="178" rx="16" ry="10" fill="white" opacity="0.65" transform="rotate(10,498,178)" />
          <ellipse cx="250" cy="290" rx="12" ry="8"  fill="white" opacity="0.55" transform="rotate(-5,250,290)" />

          {/* ── SUN (bottom-left) ── */}
          <g transform="translate(95,290)">
            {/* Rays */}
            {[0,45,90,135,180,225,270,315].map((a,i) => (
              <line key={i}
                x1={Math.cos(a*Math.PI/180)*36} y1={Math.sin(a*Math.PI/180)*36}
                x2={Math.cos(a*Math.PI/180)*50} y2={Math.sin(a*Math.PI/180)*50}
                stroke="#F6C96E" strokeWidth="4" strokeLinecap="round"
              />
            ))}
            <circle cx="0" cy="0" r="30" fill="#F9D97A" />
            {/* Inner highlight */}
            <circle cx="-8" cy="-8" r="10" fill="white" opacity="0.25" />
          </g>

          {/* ── LEFT LEAVES (dark monstera-style) ── */}
          <g opacity="0.9">
            {/* Big dark left leaf */}
            <path d="M30,420 C10,340 60,240 100,220 C80,260 70,320 90,380 Z" fill="#C9974A" opacity="0.55" />
            <path d="M55,420 C40,330 100,230 130,210 C100,260 90,340 110,390 Z" fill="#C9974A" opacity="0.45" />
            {/* Lighter overlapping leaf */}
            <path d="M60,420 C80,350 160,280 170,250 C155,280 140,350 150,400 Z" fill="#E8C07A" opacity="0.70" />
            <path d="M85,420 C100,360 175,300 180,270 C165,300 150,370 160,410 Z" fill="#E8C07A" opacity="0.60" />
            {/* Leaf veins */}
            <path d="M80,400 Q110,340 140,260" stroke="#D4AB65" strokeWidth="1.5" fill="none" opacity="0.7"/>
          </g>

          {/* ── RIGHT LEAVES ── */}
          <g transform="translate(390, 220)" opacity="0.85">
            {/* tall thin golden leaf */}
            <path d="M30,200 C20,140 60,70 80,40 C85,70 75,140 60,200 Z" fill="#E8C07A" />
            <path d="M55,200 C50,145 80,80 95,55 C100,85 90,150 75,200 Z" fill="#D4AB65" opacity="0.7"/>
            <path d="M42,175 Q62,130 72,70" stroke="#C99A50" strokeWidth="1.5" fill="none" />
            {/* Small sprout */}
            <path d="M20,210 C10,185 30,165 40,175 C30,175 22,192 28,205 Z" fill="#E8C07A" opacity="0.8" />
            {/* Right-side bigger pink-peach abstract leaf */}
            <path d="M75,220 C100,140 160,80 175,50 C175,100 145,170 115,220 Z" fill="#F0BAA0" opacity="0.75" transform="translate(20,0)" />
          </g>

          {/* ── FLOOR ELLIPSE ── */}
          <ellipse cx="270" cy="415" rx="220" ry="16" fill="#C8D3EE" opacity="0.75" />

          {/* ── STOVE ── */}
          {/* Stove block */}
          <rect x="370" y="285" width="120" height="130" rx="3" fill="#C08C82" />
          <rect x="370" y="318" width="120" height="7"  fill="#A87060" />
          <rect x="370" y="348" width="120" height="7"  fill="#A87060" />
          <rect x="370" y="378" width="120" height="7"  fill="#A87060" />
          {/* Stove top (burner) */}
          <rect x="368" y="272" width="124" height="16" rx="3" fill="#3E1F1A" />

          {/* ── FLAMES ── */}
          <motion.path
            d="M395,272 C390,252 400,240 406,252 C412,240 422,252 416,272 Z"
            fill="#F07860"
            animate={{ scaleY:[1,1.35,0.9,1.2,1], scaleX:[1,0.88,1.1,0.94,1] }}
            transition={{ repeat:Infinity, duration:0.65, ease:"easeInOut" }}
            style={{ originX:"406px", originY:"272px" }}
          />
          <motion.path
            d="M416,272 C410,245 422,230 430,246 C438,230 448,245 442,272 Z"
            fill="#F07860"
            animate={{ scaleY:[1,1.45,0.82,1.3,1], scaleX:[1,0.85,1.15,0.9,1] }}
            transition={{ repeat:Infinity, duration:0.5, ease:"easeInOut", delay:0.12 }}
            style={{ originX:"430px", originY:"272px" }}
          />
          <motion.path
            d="M443,272 C438,254 448,243 453,254 C458,243 468,254 463,272 Z"
            fill="#F07860"
            animate={{ scaleY:[1,1.28,0.92,1.18,1], scaleX:[1,0.94,1.06,0.9,1] }}
            transition={{ repeat:Infinity, duration:0.72, ease:"easeInOut", delay:0.22 }}
            style={{ originX:"453px", originY:"272px" }}
          />

          {/* ── CHEF CHARACTER ── */}

          {/* Back leg (left, angled back) */}
          <path d="M190,260 L250,260 L215,375 L148,335 Z" fill="#6B4A47" />
          {/* Back calf skin */}
          <path d="M156,330 L200,368 Q178,392 150,370 Z" fill="#E8907E" />
          {/* Back slipper */}
          <g transform="translate(118,357) rotate(30)">
            <rect x="0" y="0" width="64" height="9" rx="4" fill="#EEDDD8" />
            <path d="M12,-1 C12,-11 44,-11 48,-1" stroke="#EEDDD8" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>

          {/* Front leg (right, straight down) */}
          <path d="M248,260 L328,260 L328,390 L248,390 Z" fill="#6B4A47" />
          {/* Front ankle skin */}
          <rect x="258" y="390" width="58" height="18" rx="4" fill="#E8907E" />
          {/* Front slipper */}
          <rect x="248" y="407" width="80" height="10" rx="4" fill="#EEDDD8" />
          <path d="M262,407 C262,397 318,397 318,407" stroke="#EEDDD8" strokeWidth="5" fill="none" strokeLinecap="round" />

          {/* Entire upper body animates with gentle sway */}
          <motion.g
            animate={{ y:[0,-6,2,-4,0], rotate:[0,-1.2,1,-.7,0] }}
            transition={{ repeat:Infinity, duration:1.8, ease:"easeInOut" }}
            style={{ originX:"270px", originY:"265px" }}
          >
            {/* ─ BODY / TUNIC ─ */}
            {/* The large light-blue/lavender apron/tunic */}
            <path
              d="M215,125
                 C250,112 308,118 326,155
                 C342,190 336,255 328,285
                 C308,302 238,302 210,285
                 C198,250 196,178 215,125 Z"
              fill="#C8CCEC"
            />
            {/* Brown sleeve patches on shoulders */}
            <path d="M215,130 C205,140 200,165 210,180 C220,160 235,140 250,130 Z" fill="#6B4A47" />
            <path d="M326,155 C336,163 340,188 330,200 C320,182 310,162 300,145 Z" fill="#6B4A47" />

            {/* ─ NECK ─ */}
            <rect x="262" y="98" width="22" height="32" rx="8" fill="#E8907E" />

            {/* ─ HEAD ─ */}
            {/* Hair (back of head) */}
            <path d="M258,68 C242,68 236,86 238,100 C240,116 256,122 272,115 Z" fill="#352018" />
            {/* Face circle */}
            <circle cx="278" cy="88" r="18" fill="#E8907E" />
            {/* Eye */}
            <circle cx="285" cy="86" r="2" fill="#352018" />
            {/* Nose */}
            <path d="M285,92 Q288,93 287,97" stroke="#C06A5A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            {/* Smile */}
            <path d="M280,100 Q285,104 289,100" stroke="#C06A5A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* Ponytail – swings opposite to body sway */}
            <motion.g
              animate={{ rotate:[0,12,-14,10,0] }}
              transition={{ repeat:Infinity, duration:1.8, ease:"easeInOut" }}
              style={{ originX:"256px", originY:"73px" }}
            >
              <path d="M256,73 Q238,50 244,115" stroke="#352018" strokeWidth="12" strokeLinecap="round" fill="none" />
              {/* Tail tip */}
              <circle cx="243" cy="116" r="6" fill="#352018" />
            </motion.g>

            {/* ─ LEFT ARM + PAN (pan held horizontally over stove) ─ */}
            <motion.g
              animate={{ y:[0,-8,3,-5,0], rotate:[0,-3,2,-2,0] }}
              transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut" }}
              style={{ originX:"240px", originY:"200px" }}
            >
              {/* Upper arm sleeve */}
              <path d="M248,155 Q230,195 218,210" stroke="#6B4A47" strokeWidth="30" strokeLinecap="round" fill="none" />
              {/* Forearm skin */}
              <path d="M218,207 Q240,255 360,218" stroke="#E8907E" strokeWidth="22" strokeLinecap="round" fill="none" />
              {/* Hand */}
              <circle cx="360" cy="218" r="11" fill="#E8907E" />

              {/* Pan handle + pan body */}
              <line x1="360" y1="218" x2="420" y2="214" stroke="#3E1F1A" strokeWidth="10" strokeLinecap="round" />
              {/* Pan flat body */}
              <rect x="420" y="200" width="88" height="20" rx="3" fill="#3E1F1A" />
              {/* Pan interior highlight */}
              <rect x="424" y="203" width="80" height="10" rx="2" fill="#5A2E28" opacity="0.6" />

              {/* Steam wisps from pan */}
              <motion.path d="M448,200 C444,186 456,175 450,160" stroke="#DDD" strokeWidth="2.5" strokeLinecap="round" fill="none"
                animate={{ opacity:[0,0.7,0], y:[0,-14] }} transition={{ repeat:Infinity, duration:1.1, ease:"linear" }} />
              <motion.path d="M468,200 C464,183 478,172 472,155" stroke="#DDD" strokeWidth="2.5" strokeLinecap="round" fill="none"
                animate={{ opacity:[0,0.7,0], y:[0,-18] }} transition={{ repeat:Infinity, duration:0.9, ease:"linear", delay:0.3 }} />
            </motion.g>

            {/* ─ RIGHT ARM + SPATULA (raised high) ─ */}
            <motion.g
              animate={{ rotate:[0,-22,10,-15,5,0] }}
              transition={{ repeat:Infinity, duration:1.4, ease:"easeInOut" }}
              style={{ originX:"310px", originY:"158px" }}
            >
              {/* Upper arm sleeve */}
              <path d="M315,158 Q338,188 352,200" stroke="#6B4A47" strokeWidth="28" strokeLinecap="round" fill="none" />
              {/* Forearm skin */}
              <path d="M348,196 Q375,228 404,192" stroke="#E8907E" strokeWidth="22" strokeLinecap="round" fill="none" />
              {/* Hand */}
              <circle cx="404" cy="192" r="11" fill="#E8907E" />

              {/* Spatula handle */}
              <line x1="404" y1="192" x2="426" y2="148" stroke="#3E1F1A" strokeWidth="7" strokeLinecap="round" />
              {/* Spatula head */}
              <path d="M420,150 L432,120 L446,126 L434,155 Z" fill="#7D5540" />
              {/* Spatula slots */}
              <line x1="428" y1="136" x2="436" y2="144" stroke="#3E1F1A" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="432" y1="130" x2="440" y2="138" stroke="#3E1F1A" strokeWidth="1.5" strokeLinecap="round" />
            </motion.g>
          </motion.g>
        </svg>


      </div>
    );
  }
  if (stage === 2) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-6 w-full overflow-hidden">
        <svg viewBox="0 0 600 450" className="w-full max-w-[340px] h-auto mx-auto my-auto">
          {/* Ground */}
          <ellipse cx="300" cy="380" rx="240" ry="10" fill="#D1D9F9" opacity="0.6" />
          
          {/* Road dashes moving left */}
          <motion.line
            x1="100"
            y1="375"
            x2="500"
            y2="375"
            stroke="#BAC9E5"
            strokeWidth="6"
            strokeDasharray="20 15"
            animate={{ strokeDashoffset: [0, -70] }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />

          {/* Background clouds moving left */}
          <g opacity="0.5">
            <motion.path
              d="M 550 120 C 530 100, 490 100, 480 120 C 470 120, 460 130, 465 140 C 470 150, 550 150, 550 120 Z"
              fill="#E1F5FE"
              animate={{ x: [100, -600] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            <motion.path
              d="M 650 160 C 635 145, 600 145, 590 160 C 580 160, 570 170, 575 180 C 580 190, 650 190, 650 160 Z"
              fill="#E1F5FE"
              animate={{ x: [100, -600] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear", delay: 3 }}
            />
          </g>

          {/* Wind lines (Speed lines) */}
          <g stroke="#BAC9E5" strokeWidth="3" strokeLinecap="round" opacity="0.6">
            <motion.line
              x1="500" y1="180" x2="550" y2="180"
              animate={{ x: [100, -600] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
            <motion.line
              x1="480" y1="280" x2="520" y2="280"
              animate={{ x: [100, -600] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear", delay: 0.4 }}
            />
            <motion.line
              x1="520" y1="230" x2="570" y2="230"
              animate={{ x: [100, -600] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "linear", delay: 0.8 }}
            />
          </g>

          {/* Bike & Rider Group (bobs up and down) */}
          <motion.g
            animate={{ y: [0, -3, 0, -1, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
          >
            {/* Wheels (rotating) */}
            {/* Back Wheel */}
            <g transform="translate(190, 320)">
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <circle cx="0" cy="0" r="45" stroke="#3E2723" strokeWidth="10" fill="none" />
                <circle cx="0" cy="0" r="38" stroke="#ECEFF1" strokeWidth="2" fill="none" />
                {/* Spokes */}
                <line x1="-38" y1="0" x2="38" y2="0" stroke="#CFD8DC" strokeWidth="2" />
                <line x1="0" y1="-38" x2="0" y2="38" stroke="#CFD8DC" strokeWidth="2" />
                <line x1="-27" y1="-27" x2="27" y2="27" stroke="#CFD8DC" strokeWidth="2" />
                <line x1="-27" y1="27" x2="27" y2="-27" stroke="#CFD8DC" strokeWidth="2" />
              </motion.g>
              <circle cx="0" cy="0" r="8" fill="#546E7A" />
            </g>

            {/* Front Wheel */}
            <g transform="translate(390, 320)">
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <circle cx="0" cy="0" r="45" stroke="#3E2723" strokeWidth="10" fill="none" />
                <circle cx="0" cy="0" r="38" stroke="#ECEFF1" strokeWidth="2" fill="none" />
                {/* Spokes */}
                <line x1="-38" y1="0" x2="38" y2="0" stroke="#CFD8DC" strokeWidth="2" />
                <line x1="0" y1="-38" x2="0" y2="38" stroke="#CFD8DC" strokeWidth="2" />
                <line x1="-27" y1="-27" x2="27" y2="27" stroke="#CFD8DC" strokeWidth="2" />
                <line x1="-27" y1="27" x2="27" y2="-27" stroke="#CFD8DC" strokeWidth="2" />
              </motion.g>
              <circle cx="0" cy="0" r="8" fill="#546E7A" />
            </g>

            {/* Bike Frame */}
            {/* Chain ring */}
            <circle cx="280" cy="320" r="16" fill="none" stroke="#78909C" strokeWidth="4" />
            
            {/* Main Tubes */}
            <path
              d="M 190 320 L 270 240 L 370 240 L 390 320 L 280 320 L 270 240 M 190 320 L 280 320"
              stroke="#263238"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Seat Post */}
            <line x1="260" y1="250" x2="275" y2="200" stroke="#263238" strokeWidth="6" />
            <rect x="255" y="195" width="30" height="8" rx="2" fill="#37474F" />

            {/* Handlebar Post */}
            <line x1="370" y1="240" x2="360" y2="170" stroke="#263238" strokeWidth="6" />
            {/* Handlebars */}
            <path d="M 345 175 L 360 170 L 380 180" stroke="#37474F" strokeWidth="6" strokeLinecap="round" fill="none" />

            {/* Mudguards */}
            <path d="M 140 320 A 48 48 0 0 1 230 295" stroke="#78909C" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 350 295 A 48 48 0 0 1 430 310" stroke="#78909C" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* Delivery Box */}
            <rect x="145" y="190" width="70" height="70" rx="6" fill="var(--color-brand)" />
            <circle cx="180" cy="225" r="15" fill="#FFFFFF" opacity="0.9" />
            <path d="M 172 225 L 188 225 M 180 217 L 180 233" stroke="var(--color-brand)" strokeWidth="3" strokeLinecap="round" />

            {/* Rider Back Leg */}
            <path d="M 270 200 L 290 260 L 270 320" stroke="#546E7A" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
            
            {/* Rider Torso */}
            <path d="M 270 200 L 330 150" stroke="#FF7043" strokeWidth="22" strokeLinecap="round" fill="none" />
            
            {/* Rider Front Leg (animated pedaling) */}
            <motion.path
              d="M 270 200 L 300 250 L 290 320"
              stroke="#FF7043"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              animate={{ 
                d: [
                  "M 270 200 L 300 250 L 290 320",
                  "M 270 200 L 280 260 L 265 304",
                  "M 270 200 L 295 240 L 290 320"
                ] 
              }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            />
            
            {/* Rider Head & Helmet */}
            <circle cx="345" cy="115" r="16" fill="#E5A699" />
            <path d="M 330 115 C 330 95, 365 95, 365 115 Z" fill="#0288D1" />
            <path d="M 340 118 Q 345 125 352 118" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="352" cy="112" r="2" fill="#3E2723" />
            
            {/* Rider Arm */}
            <path d="M 320 160 L 360 172" stroke="#FF7043" strokeWidth="10" strokeLinecap="round" fill="none" />
          </motion.g>
        </svg>

      </div>
    );
  }
  return null;
};

export default function Orders() {
  const orders = useOrders((s) => s.orders);
  
  const activeOrders = orders.filter((o) => o.status === "active");
  const pastOrders = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");
  const live = activeOrders[0];

  return (
    <MobileShell>
      <header className="px-5 pt-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">Live tracking & history.</p>
      </header>

      {/* Live order */}
      {live && (
        <section className="pt-5 flex flex-col" style={{ minHeight: 'calc(100vh - 140px)' }}>
          <div className="px-5">
            <div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-sm">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4">
              <img
                src={getImageUrl(live.image)}
                alt={live.item}
                loading="lazy"
                width={768}
                height={768}
                className="h-14 w-14 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Order {live.id}</p>
                <h3 className="truncate text-sm font-bold">{live.item}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-primary-foreground/70">
                  <Clock className="h-3 w-3" /> ETA {live.eta}
                </p>
              </div>
            </div>
            <div className="relative bg-primary/95 px-4 pb-4 pt-2">
              <div className="relative">
                {/* Inactive line connecting all stages */}
                <div className="absolute top-[12px] left-[12.5%] right-[12.5%] h-0.5 -translate-y-1/2 bg-white/12" />
                
                {/* Active line showing progress */}
                <div 
                  className="absolute top-[12px] left-[12.5%] h-0.5 -translate-y-1/2 bg-brand transition-all duration-500 ease-out" 
                  style={{ width: `${Math.max(0, live.stage) * 25}%` }}
                />

                <ol className="grid grid-cols-4 gap-1">
                  {stages.map((s, idx) => {
                    const done = idx <= live.stage;
                    const current = idx === live.stage;
                    return (
                      <li key={s} className="relative z-10 flex flex-col items-center gap-1.5">
                        <span
                          className="relative grid h-6 w-6 place-items-center rounded-full"
                          style={{
                            background: done ? "var(--color-brand)" : "rgba(255,255,255,0.12)",
                          }}
                        >
                          {/* Live ping animation for the current active step */}
                          {current && (
                            <span className="absolute inset-0 rounded-full bg-brand opacity-75 animate-ping" />
                          )}
                          {done && !current ? (
                            <CheckCircle2 className="relative z-10 h-4 w-4 text-brand-foreground" strokeWidth={2.5} />
                          ) : (
                            <span className="relative z-10 h-2 w-2 rounded-full bg-current opacity-90" />
                          )}
                        </span>
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: done ? "var(--color-brand-foreground)" : "rgba(255,255,255,0.55)" }}
                        >
                          {s}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
          </div>
          <div className="flex-1 flex flex-col mt-6">
            <OrderAnimation stage={live.stage} />
          </div>
        </section>
      )}

      {/* History */}
      {!live && (
        <section className="px-5 pt-7">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">Past orders</h3>
            <span className="text-xs text-muted-foreground">{pastOrders.length} total</span>
          </div>
          <ul className="mt-3 space-y-3">
            {pastOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/orders/${o.id}`}>
                  <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm hover:bg-surface/80 transition-colors">
                    <img
                      src={getImageUrl(o.image)}
                      alt={o.item}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold">{o.item}</h4>
                      <p className="text-[11px] text-muted-foreground">{o.date} · {o.id}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        o.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-brand/10 text-brand"
                      }`}>
                        {o.status}
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
          {pastOrders.length === 0 && (
            <div className="mt-6 grid place-items-center gap-2 rounded-3xl bg-surface p-10 text-center">
              <Package className="h-6 w-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No past orders yet.</p>
            </div>
          )}
        </section>
      )}
    </MobileShell>
  );
}
