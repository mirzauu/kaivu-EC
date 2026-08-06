"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, SquareMenu, ShoppingCart, Package, CircleUser, Gift } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { auth, useAuth } from "@/lib/auth-store";
import { usePublicSettings } from "@/lib/public-settings-store";

import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCart } from "./FlyToCartProvider";

const tabs: { to: "/" | "/menu" | "/cart" | "/orders" | "/reward" | "/profile"; label: string; Icon: typeof House }[] = [
  { to: "/", label: "Home", Icon: House },
  { to: "/menu", label: "Menu", Icon: SquareMenu },
  { to: "/cart", label: "Cart", Icon: ShoppingCart },
  { to: "/orders", label: "Orders", Icon: Package },
  { to: "/reward", label: "Reward", Icon: Gift },
  { to: "/profile", label: "Profile", Icon: CircleUser },
];

// Each item is w-16 (64px) with gap-5 (20px) between items
const ITEM_WIDTH = 64;
const GAP = 20;

function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
}

/** Calculate the translateX needed to center item at `index` inside a container of `width` */
function calcTranslate(index: number, containerWidth: number): number {
  const itemCenter = index * (ITEM_WIDTH + GAP) + ITEM_WIDTH / 2;
  return containerWidth / 2 - itemCenter;
}

export function BottomNav() {
  const pathname = usePathname() || "/";
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const rewardSectionEnabled = usePublicSettings((s) => s.rewardSectionEnabled);
  const router = useRouter();

  let flyContext: ReturnType<typeof useFlyToCart> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    flyContext = useFlyToCart();
  } catch {
    /* fallback if context not wrapped */
  }

  const containerRef = useRef<HTMLDivElement>(null);

  const visibleTabs = tabs.filter((tab) => {
    if (tab.to === "/cart") {
      return isAuthenticated && count > 0;
    }
    if (tab.to === "/reward") {
      return rewardSectionEnabled;
    }
    return true;
  });

  const activeIndex = visibleTabs.findIndex(({ to }) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to),
  );
  const safeActive = activeIndex !== -1 ? activeIndex : 0;

  const [centeredIndex, setCenteredIndex] = useState(safeActive);
  const [translateX, setTranslateX] = useState(0);
  const [animate, setAnimate] = useState(false);

  const [isShaking, setIsShaking] = useState(false);
  const [showKaivu, setShowKaivu] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  // Animate 'kaivu' text on the active nav icon every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowKaivu(true);
      const timer = setTimeout(() => setShowKaivu(false), 2200);
      return () => clearTimeout(timer);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const shouldBounceCart = (flyContext?.isCartBouncing ?? false) || isShaking;

  const lastVibratedRef = useRef(-1);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  /** Always read live width from DOM — never rely on cached value */
  const getWidth = useCallback(() => containerRef.current?.clientWidth ?? 0, []);

  /** Move strip to center the given index */
  const centerOn = useCallback(
    (index: number, animated: boolean) => {
      const w = getWidth();
      if (w === 0) return;
      setCenteredIndex(index);
      setTranslateX(calcTranslate(index, w));
      setAnimate(animated);
    },
    [getWidth],
  );

  // Set initial position immediately after DOM is ready (no flash on load)
  useLayoutEffect(() => {
    const w = containerRef.current?.clientWidth ?? 0;
    if (w > 0) {
      setTranslateX(calcTranslate(safeActive, w));
    }
  }, [safeActive]);

  // Keep centered whenever route changes (back/forward navigation, etc.)
  useEffect(() => {
    const w = containerRef.current?.clientWidth ?? 0;
    if (w > 0) {
      setTranslateX(calcTranslate(safeActive, w));
      setAnimate(true);
    }
  }, [safeActive]);

  // ── Drag / swipe ────────────────────────────────────────────────────────────
  const drag = useRef<{
    startX: number;
    startTx: number;
    lastX: number;
    lastT: number;
    vel: number;
  } | null>(null);

  const snapTo = useCallback(
    (index: number) => {
      if (index !== lastVibratedRef.current) {
        vibrate(15);
        lastVibratedRef.current = index;
      }
      centerOn(index, true);

      // Navigate immediately for instantaneous response
      const current = visibleTabs.findIndex(({ to }) =>
        to === "/" ? pathnameRef.current === "/" : pathnameRef.current.startsWith(to),
      );
      if (index !== current) {
        const target = visibleTabs[index].to;
        if (target !== "/" && !isAuthenticated) {
          auth.openModal(() => {
            router.push(target);
          });
          centerOn(current, true);
        } else {
          router.push(target);
        }
      }
    },
    [centerOn, router, isAuthenticated, visibleTabs],
  );

  const closestIndex = useCallback(
    (tx: number) => {
      const w = getWidth();
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < visibleTabs.length; i++) {
        const d = Math.abs(tx - calcTranslate(i, w));
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best;
    },
    [getWidth, visibleTabs],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      setAnimate(false);
      drag.current = {
        startX: e.clientX,
        startTx: translateX,
        lastX: e.clientX,
        lastT: Date.now(),
        vel: 0,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [translateX],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.startX;
      const now = Date.now();
      drag.current.vel =
        (e.clientX - drag.current.lastX) / Math.max(1, now - drag.current.lastT);
      drag.current.lastX = e.clientX;
      drag.current.lastT = now;

      const w = getWidth();
      const minTx = calcTranslate(visibleTabs.length - 1, w);
      const maxTx = calcTranslate(0, w);
      const raw = drag.current.startTx + dx;
      const clamped = Math.max(minTx, Math.min(maxTx, raw));
      setTranslateX(clamped);

      const idx = closestIndex(clamped);
      if (idx !== centeredIndex) {
        setCenteredIndex(idx);
        vibrate(8);
      }
    },
    [centeredIndex, closestIndex, getWidth, visibleTabs],
  );

  const onPointerUp = useCallback(() => {
    if (!drag.current) return;
    const idx = closestIndex(translateX);
    drag.current = null;
    snapTo(idx);
  }, [closestIndex, snapTo, translateX]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-transparent pt-6 pb-2 lg:hidden">
      <div
        className="mx-auto max-w-md px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] overflow-hidden"
      >
        <div
          ref={containerRef}
          className="relative h-20 pt-4 pb-1 touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ul
            style={{
              transform: `translateX(${translateX}px)`,
              transition: animate
                ? "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                : "none",
              willChange: "transform",
            }}
            className="absolute flex items-end gap-5 left-0 top-0 h-full pt-4 pb-1"
          >
            {visibleTabs.map(({ to, label, Icon }, i) => {
              const isCenter = i === centeredIndex;
              const isCart = to === "/cart";

              return (
                <li
                  key={to}
                  className="flex-shrink-0 w-16 flex justify-center items-end h-16"
                >
                  <motion.div
                    animate={
                      isCart && shouldBounceCart
                        ? {
                            scale: [1, 1.35, 0.85, 1.15, 1],
                            rotate: [0, -14, 10, -5, 0],
                          }
                        : isCenter && showKaivu
                        ? {
                            x: [0, -6, 6, -5, 5, -3, 3, 0],
                            rotate: [0, -9, 9, -6, 6, -3, 3, 0],
                            scale: [1, 1.12, 1.05, 1.1, 1],
                          }
                        : { scale: 1, rotate: 0, x: 0 }
                    }
                    transition={
                      isCenter && showKaivu
                        ? { duration: 0.6, ease: "easeInOut" }
                        : { duration: 0.55, ease: "easeInOut" }
                    }
                    className="relative"
                  >
                    <Link
                      id={isCart ? "bottom-nav-cart-icon" : undefined}
                      href={to}
                      aria-label={label}
                      onClick={(e) => {
                        e.preventDefault();
                        snapTo(i);
                      }}
                      className={cn(
                        "group relative grid place-items-center rounded-full transition-all duration-300 ease-out",
                        isCenter
                          ? "h-16 w-16 bg-primary text-primary-foreground shadow-lg translate-y-[-10px]"
                          : "h-11 w-11 bg-surface text-primary shadow-sm hover:bg-secondary/50",
                      )}
                    >
                      {isCenter ? (
                        <AnimatePresence mode="wait">
                          {showKaivu ? (
                            <motion.span
                              key="kaivu-brand"
                              initial={{ rotateY: -90, opacity: 0, scale: 0.7 }}
                              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                              exit={{ rotateY: 90, opacity: 0, scale: 0.7 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="text-[11px] font-black uppercase tracking-wider text-primary-foreground font-display drop-shadow-sm select-none"
                            >
                              kaivu
                            </motion.span>
                          ) : (
                            <motion.div
                              key="active-icon"
                              initial={{ rotateY: 90, opacity: 0, scale: 0.7 }}
                              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                              exit={{ rotateY: -90, opacity: 0, scale: 0.7 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                            >
                              <Icon
                                className="h-7 w-7 transition-all duration-300 ease-out group-active:rotate-[18deg]"
                                strokeWidth={2.25}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      ) : (
                        <Icon
                          className="h-[22px] w-[22px] transition-all duration-300 ease-out group-active:-translate-y-0.5 group-active:scale-110"
                          strokeWidth={2}
                        />
                      )}
                      {isCart && count > 0 && (
                        <motion.span
                          key={count}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: [0.5, 1.4, 1], opacity: 1 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className={cn(
                            "absolute grid place-items-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background transition-all duration-300",
                            isCenter
                              ? "-right-0.5 -top-0.5 h-5 min-w-5"
                              : "-right-1 -top-1 h-4 min-w-4",
                          )}
                        >
                          {count}
                        </motion.span>
                      )}
                    </Link>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}
