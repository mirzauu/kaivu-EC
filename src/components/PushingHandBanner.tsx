"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Flame } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import hero from "@/assets/hero-burger.jpg";

export function PushingHandBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Motion Values for position tracking
  const rawX = useSpring(0, { damping: 30, stiffness: 220, mass: 0.6 });
  const rawY = useSpring(0, { damping: 30, stiffness: 220, mass: 0.6 });

  // Spring Settings for physical reactions
  const springConfig = { damping: 20, stiffness: 180 };
  const cardScale = useSpring(1, springConfig);
  const cardRotateX = useSpring(0, springConfig);
  const cardRotateY = useSpring(0, springConfig);
  const cardSkewX = useSpring(0, springConfig);
  const cardSkewY = useSpring(0, springConfig);

  // Burger push reaction springs
  const burgerX = useSpring(0, { damping: 15, stiffness: 100 });
  const burgerY = useSpring(0, { damping: 15, stiffness: 100 });
  const burgerScaleX = useSpring(1, { damping: 15, stiffness: 100 });
  const burgerScaleY = useSpring(1, { damping: 15, stiffness: 100 });
  const burgerRotate = useSpring(0, { damping: 15, stiffness: 100 });

  // Text content parallax
  const textX = useSpring(0, springConfig);
  const textY = useSpring(0, springConfig);

  // Idle hint animation on mount using GSAP
  useEffect(() => {
    if (!burgerRef.current) return;

    // A subtle hint animation (burger wiggle + banner nudge) to prompt interaction
    const tl = gsap.timeline({ delay: 1.5 });
    tl.to(burgerRef.current, {
      x: -10,
      rotation: -5,
      duration: 0.4,
      ease: "power2.out",
    })
    .to(burgerRef.current, {
      x: 5,
      rotation: 3,
      duration: 0.3,
      ease: "power2.inOut",
    })
    .to(burgerRef.current, {
      x: 0,
      rotation: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.5)",
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xVal = e.clientX - rect.left;
    const yVal = e.clientY - rect.top;

    rawX.set(xVal);
    rawY.set(yVal);

    // 1. Rubber-band background distortion parameters
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const relX = (xVal - centerX) / centerX; // -1 to 1
    const relY = (yVal - centerY) / centerY; // -1 to 1

    cardRotateX.set(relY * -5);
    cardRotateY.set(relX * 5);
    cardSkewX.set(relX * 1.5);
    cardSkewY.set(relY * 0.8);

    // Text parallax
    textX.set(relX * -8);
    textY.set(relY * -6);

    // 2. Smashed Cheeseburger pushing reaction physics
    // Burger center estimation: 75% width, 50% height
    const burgerCenterX = rect.width * 0.75;
    const burgerCenterY = rect.height * 0.5;

    const dx = xVal - burgerCenterX;
    const dy = yVal - burgerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const pushThreshold = 130;

    if (distance < pushThreshold) {
      const force = (pushThreshold - distance) / pushThreshold; // 0 to 1
      
      // Push direction (opposite of cursor direction relative to burger center)
      const forceDirectionX = dx / (distance || 1);
      const forceDirectionY = dy / (distance || 1);

      burgerX.set(forceDirectionX * force * 35);
      burgerY.set(forceDirectionY * force * 25);
      
      // Squash & stretch: shrink in direction of force, stretch perpendicularly
      burgerScaleX.set(1 - force * 0.18);
      burgerScaleY.set(1 + force * 0.1);
      burgerRotate.set(forceDirectionX * force * -15);
    } else {
      burgerX.set(0);
      burgerY.set(0);
      burgerScaleX.set(1);
      burgerScaleY.set(1);
      burgerRotate.set(0);
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsHovered(true);

    const rect = containerRef.current.getBoundingClientRect();
    const xVal = e.clientX - rect.left;
    const yVal = e.clientY - rect.top;

    // Immediately position spring targets
    rawX.set(xVal);
    rawY.set(yVal);

    cardScale.set(1.02);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setIsPressed(false);

    // Reset banner spring values
    cardScale.set(1);
    cardRotateX.set(0);
    cardRotateY.set(0);
    cardSkewX.set(0);
    cardSkewY.set(0);
    textX.set(0);
    textY.set(0);

    // Reset burger physics
    burgerX.set(0);
    burgerY.set(0);
    burgerScaleX.set(1);
    burgerScaleY.set(1);
    burgerRotate.set(0);
  };

  const handlePointerDown = () => {
    setIsPressed(true);
    cardScale.set(0.97);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    if (isHovered) {
      cardScale.set(1.02);
    } else {
      cardScale.set(1);
    }
  };

  return (
    <section className="px-5 pt-5 select-none">
      <motion.div
        ref={containerRef}
        id="pushing-hand-banner"
        className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lg cursor-pointer touch-none"
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{
          scale: cardScale,
          rotateX: cardRotateX,
          rotateY: cardRotateY,
          skewX: cardSkewX,
          skewY: cardSkewY,
          transformStyle: "preserve-3d",
          perspective: 1000,
        }}
      >
        {/* Content Layout */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5 relative z-10 pointer-events-none">
          {/* Text details (Parallax movement) */}
          <motion.div
            style={{ x: textX, y: textY }}
            className="min-w-0"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground shadow-sm">
              <Flame className="h-3 w-3 fill-brand-foreground" /> Today only
            </span>
            <h2 className="mt-2 text-xl font-bold leading-tight">
              Double Smash <br />
              Combo · 30% off
            </h2>
            <Link
              href="/menu"
              className="mt-3 inline-flex items-center rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground shadow-sm hover:brightness-105 transition-all pointer-events-auto"
            >
              Order now
            </Link>
          </motion.div>

          {/* Smashed Cheeseburger Image with pushing physics */}
          <motion.div
            ref={burgerRef}
            style={{
              x: burgerX,
              y: burgerY,
              scaleX: burgerScaleX,
              scaleY: burgerScaleY,
              rotate: burgerRotate,
            }}
            className="shrink-0"
          >
            <img
              src={hero.src}
              alt="Kaivu signature smashed cheeseburger"
              width={512}
              height={512}
              className="h-32 w-32 shrink-0 rounded-2xl object-cover shadow-md pointer-events-none"
            />
          </motion.div>
        </div>

        {/* Ambient background glow to create depth */}
        <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />
      </motion.div>
    </section>
  );
}
