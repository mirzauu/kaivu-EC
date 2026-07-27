"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cart } from "@/lib/cart-store";
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

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [flyingItems, setFlyingItems] = useState<FlyingItemState[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isCartBouncing, setIsCartBouncing] = useState(false);

  const triggerCartBounce = useCallback(() => {
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 600);
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
      // Check auth first if needed or handle auth modal
      const isAuth = auth.getState().isAuthenticated;
      if (!isAuth) {
        auth.openModal(() => {
          cart.add({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image || "",
          });
        });
        return;
      }

      // Find click origin
      const targetBtn = e.currentTarget as HTMLElement;
      const rect = targetBtn.getBoundingClientRect();
      const startX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height / 2;

      // Find Cart Icon target element
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
    [],
  );

  const handleAnimationComplete = useCallback(
    (key: string, itemData: FlyingItemState) => {
      setFlyingItems((prev) => prev.filter((fi) => fi.key !== key));
      // Trigger cart state update on landing
      cart.add({
        id: itemData.item.id,
        name: itemData.item.name,
        price: itemData.item.price,
        image: itemData.item.image || "",
      });
      // Trigger cart bounce & particles
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
            // Compute parabola midpoint
            const midX = (fi.startX + fi.endX) / 2;
            const midY = Math.min(fi.startY, fi.endY) - 120; // Arc upwards

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
    </FlyToCartContext.Provider>
  );
}
