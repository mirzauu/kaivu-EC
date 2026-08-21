"use client";

import { useEffect, useState } from "react";
import { Package, CheckCircle2, Clock } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useOrders } from "@/lib/orders-store";
import { getImageUrl } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

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
            <div className="overflow-hidden rounded-3xl bg-surface border border-border text-foreground shadow-sm">
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
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> ETA {live.eta}
                </p>
              </div>
            </div>
            <div className="relative bg-surface px-4 pb-4 pt-2 border-t border-border/50">
              <div className="relative">
                {/* Inactive line connecting all stages */}
                <div className="absolute top-[12px] left-[12.5%] right-[12.5%] h-0.5 -translate-y-1/2 bg-border" />
                
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
                            background: done ? "var(--color-brand)" : "rgba(0,0,0,0.06)",
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
                          style={{ color: done ? "var(--color-brand)" : "var(--color-muted-foreground)" }}
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
