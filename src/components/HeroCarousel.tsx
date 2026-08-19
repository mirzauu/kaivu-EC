"use client";

import { useState, useRef } from "react";
import {
  MapPin,
  ChevronDown,
  RefreshCw,
  Star,
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

// Studio themes and their fixed screen background colors for smooth transitions
const cardThemes = [
  {
    gradient: "from-[#4B5563] via-[#374151] to-[#1F2937]", // Slate studio
    bgColor: "#8292A1", // Fixed smooth cool slate background
    accent: "#E5E7EB",
  },
  {
    gradient: "from-[#7F1D1D] via-[#5C1313] to-[#2B0909]", // Deep Crimson
    bgColor: "#B83232", // Fixed smooth rich crimson background
    accent: "#FECACA",
  },
  {
    gradient: "from-[#854D0E] via-[#5E3406] to-[#2A1602]", // Warm Amber
    bgColor: "#C27803", // Fixed smooth warm golden amber background
    accent: "#FEF08A",
  },
  {
    gradient: "from-[#4C1D95] via-[#34116D] to-[#19073B]", // Royal Smoke
    bgColor: "#633B82", // Fixed smooth deep plum / violet background
    accent: "#E9D5FF",
  },
  {
    gradient: "from-[#14532D] via-[#0D381E] to-[#051C0E]", // Forest Emerald
    bgColor: "#2D6A4F", // Fixed smooth emerald forest background
    accent: "#BBF7D0",
  },
  {
    gradient: "from-[#1E3A8A] via-[#172554] to-[#0B132B]", // Midnight Ocean
    bgColor: "#3A5A80", // Fixed smooth steel ocean background
    accent: "#BFDBFE",
  },
];

export function HeroCarousel({
  mounted,
  items,
  onSelectProduct,
  onAddToCart,
}: HeroCarouselProps) {
  const scrollContainerRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { flyToCart } = useFlyToCart();

  const locationAddress = useLocation((s) => s.address);
  const locationLoading = useLocation((s) => s.isLoading);
  const locationError = useLocation((s) => s.error);

  const displayItems = items && items.length > 0 ? items : defaultMenu;

  // Active theme based on currently scrolled/selected card
  const currentTheme = cardThemes[activeIndex % cardThemes.length];

  // Dynamically detect which card is centered while scrolling to update the background color smoothly
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    // Calculate card width + gap (78vw / sm:310px + 14px gap)
    const cardEl = container.firstElementChild as HTMLElement | null;
    const itemWidth = cardEl ? cardEl.offsetWidth + 14 : container.offsetWidth * 0.78 + 14;
    const index = Math.round(scrollLeft / itemWidth);
    const clampedIndex = Math.min(Math.max(0, index), displayItems.length - 1);
    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  };

  const handleCardClick = (item: MenuItem, index: number) => {
    setActiveIndex(index);
    onSelectProduct?.(item);
  };

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: MenuItem) => {
    e.stopPropagation();
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
        backgroundColor: currentTheme.bgColor,
        transition: "background-color 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Top Location Bar (Amazon-style deliver pill from screenshot) */}
      <div className="relative z-30 px-4 pt-2 pb-3">
        <button
          type="button"
          onClick={() => locationStore.refresh()}
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
                const theme = cardThemes[idx % cardThemes.length];

                return (
                  <li
                    key={item.id || idx}
                    className="w-[78vw] sm:w-[310px] max-w-[330px] shrink-0 snap-center"
                  >
                    <div
                      onClick={() => handleCardClick(item, idx)}
                      className={`group relative h-[430px] sm:h-[450px] w-full overflow-hidden rounded-[26px] bg-gradient-to-b ${theme.gradient} p-5 shadow-[0_18px_38px_rgba(0,0,0,0.28)] cursor-pointer flex flex-col justify-between transition-transform duration-300 hover:scale-[1.01]`}
                    >
                      {/* Subtle ambient lighting on card */}
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                      <div className="absolute bottom-10 -left-10 w-44 h-44 bg-black/30 rounded-full blur-2xl pointer-events-none" />

                      {/* TOP TEXT OVERLAY */}
                      <div className="relative z-10 space-y-1">
                        {/* Big Headline */}
                        <h2 className="text-2xl sm:text-[28px] font-black tracking-tight text-white leading-tight capitalize">
                          {item.name}
                        </h2>

                        {/* Subtitle / Product Highlights */}
                        <p className="text-xs font-medium text-white/80 leading-snug line-clamp-2 max-w-[95%]">
                          {item.desc || "Artisanal pressed patty, melted cheese & house glaze"}
                        </p>
                      </div>

                      {/* CENTER PRODUCT IMAGE (Hero Showcase on Studio Base) */}
                      <div className="relative z-10 flex-1 flex items-center justify-center my-auto py-2">
                        {/* Circular Studio Podium / Shadow Effect */}
                        <div className="absolute bottom-2 w-48 sm:w-56 h-14 bg-black/40 rounded-full blur-lg scale-90 pointer-events-none" />
                        <div className="absolute bottom-4 w-44 sm:w-52 h-6 bg-white/10 rounded-full blur-md pointer-events-none" />

                        {/* Main Product Image */}
                        <div className="relative w-44 h-44 sm:w-52 sm:h-52 overflow-hidden rounded-2xl drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500">
                          <img
                            src={item.image?.src || item.image || ""}
                            alt={item.name}
                            loading="lazy"
                            width={768}
                            height={768}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>

                        {/* Floating Rating Pill */}
                        <div className="absolute top-2 right-0 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-amber-300 border border-white/15 shadow-sm">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {item.rating || 4.9}
                        </div>
                      </div>

                      {/* BOTTOM BAR: Buy 2 Offer Price, *T&C Apply, and Add Button */}
                      <div className="relative z-10 flex items-end justify-between pt-2">
                        <div className="flex flex-col">
                          {/* Offer Badge & Strikethrough Original 2x Price */}
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="rounded-sm bg-amber-400 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-xs">
                              OFFER
                            </span>
                            <span className="text-[11px] font-semibold text-white/50 line-through">
                              ₹{(item.price * 2).toFixed(0)}
                            </span>
                          </div>

                          {/* Buy 2 at Price Row */}
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-tight text-amber-200">
                              BUY 2 AT
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-white">
                              ₹{item.price.toFixed(2)}
                            </span>
                          </div>

                          <span className="text-[9.5px] text-white/50 block font-medium mt-0.5">
                            *Limited time deal • T&C Apply
                          </span>
                        </div>

                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={(e) => handleAdd(e, item)}
                          aria-label={`Add ${item.name}`}
                          className="flex items-center gap-1.5 rounded-full bg-white text-slate-950 font-black px-4 py-2 text-xs shadow-lg hover:bg-amber-300 active:scale-95 transition-all shrink-0"
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
