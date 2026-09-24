"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, SquareMenu, ShoppingCart, Package, CircleUser, Gift } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { auth, useAuth } from "@/lib/auth-store";
import { usePublicSettings } from "@/lib/public-settings-store";
import { motion } from "framer-motion";
import { useFlyToCart } from "./FlyToCartProvider";

const tabs = [
  { to: "/", label: "Home", Icon: House },
  { to: "/cart", label: "Cart", Icon: ShoppingCart },
  { to: "/orders", label: "Orders", Icon: Package },
  { to: "/reward", label: "Reward", Icon: Gift },
  { to: "/profile", label: "Profile", Icon: CircleUser },
] as const;

function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
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

  const shouldBounceCart = flyContext?.isCartBouncing ?? false;

  const visibleTabs = tabs.filter((tab) => {
    if (tab.to === "/reward") {
      return rewardSectionEnabled;
    }
    return true;
  });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    vibrate(10);
    const publicRoutes = ["/", "/menu", "/cart"];
    if (!publicRoutes.includes(target) && !isAuthenticated) {
      e.preventDefault();
      auth.openModal(() => {
        router.push(target);
      });
    }
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] lg:hidden">
      <div className="mx-auto max-w-md px-2">
        <ul className="flex items-center justify-around">
          {visibleTabs.map(({ to, label, Icon }) => {
            const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
            const isCart = to === "/cart";

            return (
              <li key={to} className="flex-1 flex justify-center">
                <Link
                  id={isCart ? "bottom-nav-cart-icon" : undefined}
                  href={to}
                  onClick={(e) => handleNavClick(e, to)}
                  className={cn(
                    "relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 group active:scale-90 select-none min-w-[52px]",
                    isActive ? "text-[#FFF8E7]" : "text-[#888888] hover:text-[#CCCCCC]"
                  )}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-[#66101F] rounded-2xl -z-10 shadow-md shadow-[#66101F]/40"
                    />
                  )}

                  {/* Icon Container */}
                  <motion.div
                    animate={
                      isCart && shouldBounceCart
                        ? {
                            scale: [1, 1.4, 0.85, 1.15, 1],
                            rotate: [0, -14, 10, -5, 0],
                          }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        isActive ? "scale-105 stroke-[2.4]" : "stroke-[1.8]"
                      )}
                    />

                    {/* Cart Counter Badge */}
                    {isCart && count > 0 && (
                      <motion.span
                        key={count}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: [0.5, 1.3, 1], opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#FFF8E7] px-1 text-[9px] font-black text-[#66101F] shadow-sm leading-none"
                      >
                        {count}
                      </motion.span>
                    )}
                  </motion.div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-[10px] tracking-tight mt-0.5 leading-none transition-all font-display uppercase",
                      isActive ? "font-black text-[#FFF8E7]" : "font-semibold text-[#888888]"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
