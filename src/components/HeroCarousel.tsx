"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MapPin,
  ChevronDown,
  RefreshCw,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, locationStore } from "@/lib/location-store";
import { MenuItem, menu as defaultMenu } from "@/lib/menu-data";
import { useFlyToCart } from "@/components/FlyToCartProvider";

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

// Video assets for different item types
const VIDEO_BURGER_1 = "/video/A_professional_second_e_comm (1)_gwr_video_mvp.mp4";
const VIDEO_BURGER_2 = "/video/A_professional_second_e_comm (2)_gwr_video_mvp.mp4";
const VIDEO_LOADED = "/video/A_professional_second_e_comm (4)_gwr_video_mvp.mp4";

/**
 * Returns the matching video source based on item name and category
 */
function getCardVideoSrc(item: MenuItem, idx: number): string {
  const name = (item.name || "").toLowerCase();
  const id = (item.id || "").toLowerCase();

  // Loaded items get the loaded video (Video 4)
  if (name.includes("loaded") || id.includes("loaded")) {
    return VIDEO_LOADED;
  }

  // Chicken / cluck / spicy burgers get Video 2
  if (name.includes("cluck") || name.includes("chicken") || name.includes("rooster") || idx % 2 === 1) {
    return VIDEO_BURGER_2;
  }

  // Classic beef smash burgers get Video 1
  return VIDEO_BURGER_1;
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

  return (
    <div
      className="relative w-full overflow-hidden pt-2 pb-6 select-none"
      style={{
        backgroundColor: currentBgColor,
        transition: "background-color 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Top Location Bar (Amazon-style deliver pill from screenshot) */}
      <div className="relative z-30 px-4 pt-2 pb-3">
        <button
          type="button"
          onClick={() => {
            resetIdleTimer();
            locationStore.refresh();
          }}
          className="w-full flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md shadow-sm border border-black/10 active:scale-[0.99] transition-all text-left"
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
      </div>

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
                const videoSrc = getCardVideoSrc(item, idx);

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

                      {/* ACTIVE CARD VIDEO PLAYER (Plays matching video on loop in mute when idle) */}
                      {isActive && (
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
