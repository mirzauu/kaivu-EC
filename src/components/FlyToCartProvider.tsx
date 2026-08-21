"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cart, useCart } from "@/lib/cart-store";
import { auth } from "@/lib/auth-store";

export type FlyItemOptions = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

type FlyingItemState = {
  id: string;
  key: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  item: FlyItemOptions;
};

type Particle = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
};

type FlyToCartContextType = {
  flyToCart: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>, item: FlyItemOptions) => void;
  isCartBouncing: boolean;
  triggerCartBounce: () => void;
};

const FlyToCartContext = createContext<FlyToCartContextType | null>(null);

export function useFlyToCart() {
  const ctx = useContext(FlyToCartContext);
  if (!ctx) {
    throw new Error("useFlyToCart must be used within a FlyToCartProvider");
  }
  return ctx;
}

type ConfettiPaper = {
  id: string;
  startX: number;
  startY: number;
  midX: number;
  midY: number;
  endX: number;
  endY: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  width: number;
  height: number;
  color: string;
  borderRadius: string;
  duration: number;
  delay: number;
};

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const itemCount = useCart((s) => s.itemCount);
  const [flyingItems, setFlyingItems] = useState<FlyingItemState[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [confettiPapers, setConfettiPapers] = useState<ConfettiPaper[]>([]);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  const triggerCartBounce = useCallback(() => {
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 600);
  }, []);

  const triggerPopperEffect = useCallback(() => {
    const colors = [
      "#FFD166", "#EF233C", "#06D6A0", "#118AB2", 
      "#8338EC", "#FF006E", "#FFB703", "#3A86EF", 
      "#FB5607", "#70E000", "#FF4D6D", "#9D4EDD"
    ];

    const screenWidth = typeof window !== "undefined" ? window.innerWidth : 400;
    const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    const count = 85;
    const newPapers: ConfettiPaper[] = Array.from({ length: count }, (_, i) => {
      const fromLeft = i % 2 === 0;
      const startX = fromLeft
        ? Math.random() * (screenWidth * 0.4)
        : screenWidth * 0.6 + Math.random() * (screenWidth * 0.4);
      const startY = screenHeight + 20;

      const midX = startX + (fromLeft ? Math.random() * 220 + 40 : -(Math.random() * 220 + 40));
      const midY = Math.random() * (screenHeight * 0.4) + 40;

      const endX = midX + (Math.random() * 180 - 90);
      const endY = screenHeight + 120;

      const isRibbon = i % 5 === 0;

      return {
        id: `${Date.now()}-${i}-${Math.random()}`,
        startX,
        startY,
        midX,
        midY,
        endX,
        endY,
        rotateX: Math.random() * 1440 - 720,
        rotateY: Math.random() * 1440 - 720,
        rotateZ: Math.random() * 720 - 360,
        width: isRibbon ? Math.random() * 5 + 4 : Math.random() * 8 + 8,
        height: isRibbon ? Math.random() * 24 + 14 : Math.random() * 10 + 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        borderRadius: i % 4 === 0 ? "50%" : "2px",
        duration: Math.random() * 0.8 + 1.8,
        delay: Math.random() * 0.25,
      };
    });

    setConfettiPapers(newPapers);

    setTimeout(() => {
      setConfettiPapers([]);
    }, 3000);
  }, []);

  const spawnParticles = useCallback((x: number, y: number) => {
    const colors = ["#40271D", "#F2DFB5", "#FFB703", "#FB8500"];
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * (360 / 8) * Math.PI) / 180;
      const speed = Math.random() * 25 + 15;
      return {
        id: `${Date.now()}-${i}-${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 600);
  }, []);

  const flyToCart = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>, item: FlyItemOptions) => {
      const targetBtn = e.currentTarget as HTMLElement;
      const rect = targetBtn.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;

      // Only trigger paper popper on VERY FIRST item added to cart!
      if (itemCount === 0) {
        triggerPopperEffect();
      }

      const cartTarget = document.getElementById("bottom-nav-cart-icon");
      let endX = window.innerWidth / 2;
      let endY = window.innerHeight - 40;

      if (cartTarget) {
        const cartRect = cartTarget.getBoundingClientRect();
        endX = cartRect.left + cartRect.width / 2;
        endY = cartRect.top + cartRect.height / 2;
      }

      const key = `${item.id}-${Date.now()}-${Math.random()}`;

      setFlyingItems((prev) => [
        ...prev,
        {
          id: item.id,
          key,
          startX,
          startY,
          endX,
          endY,
          item,
        },
      ]);
    },
    [itemCount, triggerPopperEffect],
  );

  const handleAnimationComplete = useCallback(
    (key: string, itemData: FlyingItemState) => {
      setFlyingItems((prev) => prev.filter((fi) => fi.key !== key));
      cart.add({
        id: itemData.item.id,
        name: itemData.item.name,
        price: itemData.item.price,
        image: itemData.item.image || "",
      });
      triggerCartBounce();
      spawnParticles(itemData.endX, itemData.endY);
    },
    [spawnParticles, triggerCartBounce],
  );

  return (
    <FlyToCartContext.Provider value={{ flyToCart, isCartBouncing, triggerCartBounce }}>
      {children}

      {/* Floating animation layer */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        <AnimatePresence>
          {flyingItems.map((fi) => {
            const midX = (fi.startX + fi.endX) / 2;
            const midY = Math.min(fi.startY, fi.endY) - 120;

            return (
              <motion.div
                key={fi.key}
                initial={{
                  x: fi.startX - 18,
                  y: fi.startY - 18,
                  scale: 0.4,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  x: [fi.startX - 18, midX - 18, fi.endX - 18],
                  y: [fi.startY - 18, midY - 18, fi.endY - 18],
                  scale: [0.6, 1.2, 0.25],
                  opacity: [0.8, 1, 0.9],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onAnimationComplete={() => handleAnimationComplete(fi.key, fi)}
                className="absolute left-0 top-0 grid h-9 w-9 place-items-center rounded-full bg-brand text-brand-foreground shadow-xl ring-2 ring-background overflow-hidden"
              >
                {fi.item.image ? (
                  <img src={fi.item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-base">🍔</span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Burst particles */}
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: p.x - 3,
                y: p.y - 3,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: p.x + p.vx,
                y: p.y + p.vy,
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
              className="absolute left-0 top-0 h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Success Popper - Colorful Paper Confetti Cannon starting from Bottom of Screen */}
      <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
        <AnimatePresence>
          {confettiPapers.map((paper) => (
            <motion.div
              key={paper.id}
              initial={{
                x: paper.startX,
                y: paper.startY,
                opacity: 1,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                scale: 0.8,
              }}
              animate={{
                x: [paper.startX, paper.midX, paper.endX],
                y: [paper.startY, paper.midY, paper.endY],
                opacity: [1, 1, 1, 0],
                rotateX: paper.rotateX,
                rotateY: paper.rotateY,
                rotateZ: paper.rotateZ,
                scale: [1, 1.1, 0.9],
              }}
              transition={{
                duration: paper.duration,
                delay: paper.delay,
                ease: [0.12, 0, 0.39, 0],
                times: [0, 0.4, 1],
              }}
              style={{
                width: paper.width,
                height: paper.height,
                backgroundColor: paper.color,
                borderRadius: paper.borderRadius,
              }}
              className="absolute left-0 top-0 shadow-sm"
            />
          ))}
        </AnimatePresence>
      </div>
    </FlyToCartContext.Provider>
  );
}
