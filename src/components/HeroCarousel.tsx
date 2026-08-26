import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  ChevronDown,
  RefreshCw,
  Plus,
  MoreVertical,
  X,
  Home as HomeIcon,
  UtensilsCrossed,
  Gift,
  ShoppingBag,
  PackageCheck,
  Coins,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, locationStore } from "@/lib/location-store";
import { MenuItem, menu as defaultMenu } from "@/lib/menu-data";
import { useFlyToCart } from "@/components/FlyToCartProvider";
import { auth, useAuth } from "@/lib/auth-store";
import { getOptimizedVideoUrl } from "@/lib/cloudinary";

interface HeroCarouselProps {
  mounted: boolean;
  items?: MenuItem[];
  onSelectProduct?: (item: MenuItem) => void;
  onAddToCart?: (e: React.MouseEvent<HTMLButtonElement>, item: MenuItem) => void;
}

// Background colors for the screen section corresponding to each card
const cardBgColors = [
  "#8292A1", // Slate Cool Grey
  "#B83232", // Rich Crimson
  "#C27803", // Golden Amber
  "#633B82", // Plum / Violet
  "#2D6A4F", // Emerald Forest
  "#3A5A80", // Steel Ocean
];

/**
 * Returns the optimized video source only if a video is explicitly attached to the product.
 */
function getCardVideoSrc(item: MenuItem): string | null {
  const url = item.videoUrl || (item as any).video || (item as any).video_url;
  if (url && typeof url === "string" && url.trim().length > 0) {
    return getOptimizedVideoUrl(url.trim());
  }
  return null;
}

/**
 * Standard Video Player Component:
 * Plays the assigned video normally on loop in mute when active and user is idle for 1s.
 */
function CardVideoPlayer({
  src,
  isActive,
  isIdle,
}: {
  src: string;
  isActive: boolean;
  isIdle: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && isIdle) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive, isIdle]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      className={`absolute inset-0 h-full w-full object-cover object-center pointer-events-none transition-opacity duration-700 ${
        isActive && isIdle ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

export function HeroCarousel({
  mounted,
  items,
  onSelectProduct,
  onAddToCart,
}: HeroCarouselProps) {
  const scrollContainerRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { flyToCart } = useFlyToCart();

  const locationAddress = useLocation((s) => s.address);
  const locationLoading = useLocation((s) => s.isLoading);
  const locationError = useLocation((s) => s.error);

  const displayItems = items && items.length > 0 ? items : defaultMenu;

  // Active background color based on currently active card
  const currentBgColor = cardBgColors[activeIndex % cardBgColors.length];

  // User activity tracker: resets the 1-second idle timer on any user action
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 1000);
  }, []);

  // Listen for user interactions across touch, scroll, click, and keys
  useEffect(() => {
    // Start initial 1s countdown
    resetIdleTimer();

    const activityEvents = [
      "touchstart",
      "touchmove",
      "scroll",
      "mousedown",
      "mousemove",
      "keydown",
      "wheel",
    ];

    const handleUserActivity = () => {
      resetIdleTimer();
    };

    activityEvents.forEach((ev) => {
      window.addEventListener(ev, handleUserActivity, { passive: true });
    });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      activityEvents.forEach((ev) => {
        window.removeEventListener(ev, handleUserActivity);
      });
    };
  }, [resetIdleTimer]);

  // Auto-scroll carousel every 6 seconds (6000ms)
  useEffect(() => {
    if (!mounted || displayItems.length === 0) return;

    const autoScrollInterval = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const cardEl = container.firstElementChild as HTMLElement | null;
      const itemWidth = cardEl ? cardEl.offsetWidth + 14 : container.offsetWidth * 0.78 + 14;

      const nextIndex = (activeIndex + 1) % displayItems.length;
      container.scrollTo({
        left: nextIndex * itemWidth,
        behavior: "smooth",
      });
      setActiveIndex(nextIndex);
    }, 6000);

    return () => clearInterval(autoScrollInterval);
  }, [activeIndex, displayItems.length, mounted]);

  // Dynamically detect which card is centered while scrolling to update the background color smoothly
  const handleScroll = () => {
    resetIdleTimer();
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardEl = container.firstElementChild as HTMLElement | null;
    const itemWidth = cardEl ? cardEl.offsetWidth + 14 : container.offsetWidth * 0.78 + 14;
    const index = Math.round(scrollLeft / itemWidth);
    const clampedIndex = Math.min(Math.max(0, index), displayItems.length - 1);
    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  };

  const handleCardClick = (item: MenuItem, index: number) => {
    resetIdleTimer();
    setActiveIndex(index);
    onSelectProduct?.(item);
  };

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: MenuItem) => {
    e.stopPropagation();
    resetIdleTimer();
    if (onAddToCart) {
      onAddToCart(e, item);
    } else {
      flyToCart(e, item);
    }
  };

  const [navMenuOpen, setNavMenuOpen] = useState(false);
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  const navLinks = [
    { label: "Home", href: "/", icon: HomeIcon, desc: "Main feed & offers" },
    { label: "Explore Menu", href: "/menu", icon: UtensilsCrossed, desc: "Burgers, sides & drinks" },
    { label: "Party Packs", href: "/menu?category=Combos", icon: Gift, desc: "Feeds 4, 6 & 8 people", badge: "Hot" },
    { label: "My Cart", href: "/cart", icon: ShoppingBag, desc: "Checkout your items" },
    { label: "Order History", href: "/orders", icon: PackageCheck, desc: "Track active & past orders" },
  ];

const topCategories = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Burrito", emoji: "🌯" },
  { name: "Sides", emoji: "🍟" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Combos", emoji: "🎁" },
];

  return (
    <div
      className="relative w-full pt-0 pb-6 select-none"
      style={{
        backgroundColor: currentBgColor,
        transition: "background-color 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Top Location Bar & 3-Dot Menu Button */}
      <div className="relative z-30 px-4 pt-28 pb-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            resetIdleTimer();
            locationStore.refresh();
          }}
          className="flex-1 min-w-0 flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-sm border border-black/10 active:scale-[0.99] transition-all text-left"
          aria-label="Deliver to location"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MapPin className="h-4 w-4 text-slate-800 shrink-0" />
            {!mounted || locationLoading ? (
              <div className="h-3.5 w-44 animate-pulse rounded bg-gray-200" />
            ) : locationError && !locationAddress ? (
              <span className="truncate text-xs font-semibold text-slate-700 flex items-center gap-1">
                Tap to set location <RefreshCw className="h-3 w-3 text-slate-500" />
              </span>
            ) : (
              <span className="truncate text-xs font-bold text-slate-800">
                Deliver to {locationAddress ? locationAddress.split(",")[0] : "Malappuram 676307"}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
        </button>

        {/* 3-Dot Options Button */}
        <button
          type="button"
          onClick={() => {
            resetIdleTimer();
            setNavMenuOpen(!navMenuOpen);
          }}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/90 backdrop-blur-md shadow-sm border border-black/10 active:scale-95 transition-transform text-slate-900 cursor-pointer"
          aria-label="Navigation options"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Options Dropdown / Modal */}
      <AnimatePresence>
        {navMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Slide-down Card / Drawer */}
            <motion.div
              initial={{ y: -40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -40, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto rounded-3xl bg-surface p-5 shadow-2xl border border-border text-foreground"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/images/brand/kaivu-logo-black.png"
                    alt="kaivu."
                    className="h-7 w-auto object-contain rounded-lg"
                  />
                  <div>
                    <h3 className="text-base font-black tracking-tight leading-none">KAIVU MENU</h3>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Where Every Bite Hits Different</p>
                  </div>
                </div>

                <button
                  onClick={() => setNavMenuOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-accent text-foreground hover:bg-muted cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Options List */}
              <div className="mt-3 space-y-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setNavMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl p-3 hover:bg-accent active:bg-accent/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold truncate">{item.label}</span>
                            {item.badge && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-800">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  );
                })}
              </div>

              {/* User Profile / Coins Section */}
              <div className="mt-4 border-t border-border/60 pt-3">
                {isAuthenticated && user ? (
                  <div className="flex items-center justify-between rounded-2xl bg-accent p-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground text-xs font-bold">
                        {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{user.name || user.phone}</p>
                        <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                          <Coins className="h-3 w-3" /> {user.kaivuCoins} Kaivu Coins
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => auth.logout()}
                      aria-label="Logout"
                      className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-surface cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setNavMenuOpen(false);
                      auth.openModal();
                    }}
                    className="w-full grid place-items-center rounded-full bg-brand py-2.5 text-xs font-bold text-brand-foreground shadow-sm cursor-pointer"
                  >
                    Log In / Sign Up
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Big Product Cards Horizontal Carousel with Center Snapping and Side Peeking */}
      <div className="relative z-30">
        <ul
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-3.5 overflow-x-auto px-7 pb-2 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {!mounted
            ? null
            : displayItems.map((item, idx) => {
                const isActive = activeIndex === idx;
                const videoSrc = getCardVideoSrc(item);

                return (
                  <li
                    key={item.id || idx}
                    className="w-[78vw] sm:w-[310px] max-w-[330px] shrink-0 snap-center"
                  >
                    <div
                      onClick={() => handleCardClick(item, idx)}
                      className="group relative h-[430px] sm:h-[450px] w-full overflow-hidden rounded-[26px] bg-slate-900 shadow-[0_18px_38px_rgba(0,0,0,0.35)] cursor-pointer flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]"
                    >
                      {/* FULL-BLEED PRODUCT STATIC IMAGE */}
                      <img
                        src={item.image?.src || item.image || ""}
                        alt={item.name}
                        loading="lazy"
                        width={768}
                        height={768}
                        className="absolute inset-0 h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-700 pointer-events-none"
                      />

                      {/* ACTIVE CARD VIDEO PLAYER (Only plays if explicit video is attached to the product) */}
                      {isActive && videoSrc && (
                        <CardVideoPlayer
                          src={videoSrc}
                          isActive={isActive}
                          isIdle={isIdle}
                        />
                      )}

                      {/* Gradient Overlay for Top & Bottom Text Legibility */}
                      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none z-10" />
                      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-10" />

                      {/* TOP OVERLAY: Headline & Highlights */}
                      <div className="relative z-20 p-5 pb-0">
                        <div className="space-y-1 max-w-[90%]">
                          <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-white leading-tight capitalize drop-shadow-md">
                            {item.name}
                          </h2>
                          <p className="text-xs font-medium text-white/90 leading-snug line-clamp-2 drop-shadow-sm">
                            {item.desc || "Artisanal pressed patty, melted cheese & house glaze"}
                          </p>
                        </div>
                      </div>

                      {/* BOTTOM BAR: Buy 2 Offer Price, and Add Button */}
                      <div className="relative z-20 p-5 pt-0 flex items-end justify-between">
                        {Boolean(item.isComingSoon) || item.tag?.toLowerCase() === "coming soon" ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 drop-shadow-xs">
                              Unreleased
                            </span>
                            <span className="text-base font-extrabold text-white/95 drop-shadow-md">
                              Stay Tuned ✨
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            {/* Strikethrough Original 2x Price with 50% OFF Badge */}
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[11px] font-bold text-white/70 line-through drop-shadow-xs">
                                ₹{(item.price * 2).toFixed(0)}
                              </span>
                              <span className="rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                                50% OFF
                              </span>
                            </div>

                            {/* Buy 2 at Price Row with High-Visibility Yellow Badge */}
                            <div className="flex items-center gap-2">
                              <span className="inline-block px-3 py-1 rounded-lg bg-[#FFE600] text-slate-950 font-black text-sm sm:text-base tracking-wide uppercase shadow-lg">
                                BUY 2 AT
                              </span>
                              <span className="text-lg sm:text-xl font-extrabold text-white drop-shadow-md leading-none">
                                ₹{Math.round(item.price)}
                              </span>
                            </div>
                          </div>
                        )}

                        {Boolean(item.isComingSoon) || item.tag?.toLowerCase() === "coming soon" ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-amber-500 text-slate-950 font-black px-4 py-2 text-xs shadow-xl shrink-0 uppercase tracking-wider select-none">
                            🚀 COMING SOON
                          </span>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={(e) => handleAdd(e, item)}
                            aria-label={`Add ${item.name}`}
                            className="flex items-center gap-1.5 rounded-full bg-white text-slate-950 font-black px-4 py-2 text-xs shadow-xl hover:bg-slate-100 active:scale-95 transition-all shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[3]" />
                            <span>ADD</span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
        </ul>
      </div>
    </div>
  );
}
