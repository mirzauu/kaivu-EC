"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Plus,
  RefreshCw,
  ChevronRight,
  Percent,
  Truck,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { CookingAnimation } from "@/components/CookingAnimation";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useMenu } from "@/lib/menu-store";
import { useAuth } from "@/lib/auth-store";
import { PushingHandBanner } from "@/components/PushingHandBanner";
import { useLocation, locationStore } from "@/lib/location-store";
import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCart } from "@/components/FlyToCartProvider";
import { KaivuIRLSection } from "@/components/KaivuIRLSection";
import { KaivuStoryModal } from "@/components/KaivuStoryModal";
import { getStories, isStoriesEnabled, KaivuStory } from "@/lib/stories-data";

import { HeroCarousel } from "@/components/HeroCarousel";

import { menu as defaultMenu } from "@/lib/menu-data";

const categories = [
  { key: "Burgers", emoji: "🍔" },
  { key: "Sides", emoji: "🍟" },
  { key: "Drinks", emoji: "🥤" },
  { key: "Desserts", emoji: "🍰" },
  { key: "Combos", emoji: "🎁" },
];

export default function Home() {
  const storeMenu = useMenu((s) => s.menu);
  const allItems = storeMenu && storeMenu.length > 0 ? storeMenu : defaultMenu;

  const popular = allItems.filter(
    (m) => !m.category || m.category.toLowerCase() === "burgers"
  );
  const displayPopular = popular.length > 0 ? popular : allItems;
  const recommended = allItems.slice(0, 4);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const { flyToCart } = useFlyToCart();

  const locationAddress = useLocation((s) => s.address);
  const locationLoading = useLocation((s) => s.isLoading);
  const locationError = useLocation((s) => s.error);

  const [mounted, setMounted] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [stories, setStories] = useState<KaivuStory[]>([]);
  const [storiesEnabled, setStoriesEnabled] = useState(true);

  const categorySentinelRef = useRef<HTMLDivElement>(null);
  const [isCategoriesSticky, setIsCategoriesSticky] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStories(getStories());
    setStoriesEnabled(isStoriesEnabled());
  }, []);

  useEffect(() => {
    const sentinel = categorySentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCategoriesSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: any) => {
    e.stopPropagation();
    flyToCart(e, item);
  };

  return (
    <MobileShell>
      {/* Top Hero Carousel Screen with Full-Bleed Background Images */}
      <HeroCarousel mounted={mounted} />

      {/* Floating White Content Sheet */}
      <div className="relative z-10 -mt-6 rounded-t-[32px] bg-white pt-5 pb-28 shadow-[0_-10px_25px_rgba(0,0,0,0.12)] min-h-screen">
        {/* Pull Handle Indicator */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200 mb-4" />

        {/* Interactive Hero Banner inside Floating White Screen */}
        <div className="mb-5">
          <PushingHandBanner />
        </div>

        {/* Promo Deal Banners & Sub-Offer Cards */}
        <div className="px-5 space-y-3">
          {/* Sub-Offer Twin Cards */}
          <div className="grid grid-cols-2 gap-3 pb-1">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-800 to-purple-950 p-3.5 border border-white/10 shadow-md text-white flex flex-col justify-between h-28">
              <div className="z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">Offer</span>
                <h4 className="text-xs font-bold leading-snug mt-0.5">Flat ₹200 OFF & More</h4>
              </div>
              <div className="z-10 flex items-center justify-between mt-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-purple-900 shadow-md">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="absolute right-1 bottom-1 text-4xl opacity-20 pointer-events-none">
                💰
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-800 to-purple-950 p-3.5 border border-white/10 shadow-md text-white flex flex-col justify-between h-28">
              <div className="z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">Party</span>
                <h4 className="text-xs font-bold leading-snug mt-0.5">Large Orders & Combos</h4>
              </div>
              <div className="z-10 flex items-center justify-between mt-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-purple-900 shadow-md">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="absolute right-1 bottom-1 text-4xl opacity-20 pointer-events-none">
                🎁
              </div>
            </div>
          </div>

          {/* Kaivu IRL Shoppable Customer Stories (Only shown if ON and stories exist) */}
          {storiesEnabled && mounted && stories.length > 0 && (
            <KaivuIRLSection
              stories={stories}
              onOpenStory={(index) => setActiveStoryIndex(index)}
            />
          )}
        </div>

        {/* Sentinel element to detect when Categories section locks sticky to header */}
        <div ref={categorySentinelRef} className="h-0 w-full pointer-events-none" />

        {/* Categories ("What's on your mind?") - Sticky Header on Scroll */}
        <motion.section
          layout
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className={
            isCategoriesSticky
              ? "sticky top-0 z-30 bg-white/95 backdrop-blur-md py-2 border-b border-gray-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out"
              : "pt-6 pb-2 transition-all duration-300 ease-out"
          }
        >
          <AnimatePresence mode="wait">
            {!isCategoriesSticky && (
              <motion.div
                key="categories-header-title"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                className="flex items-center justify-between px-5 mb-3 overflow-hidden"
              >
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-purple-600" /> What's on your mind?
                </h3>
                <Link href="/menu" className="text-xs font-semibold text-purple-700 hover:underline">
                  See all
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.ul
            layout
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={
              isCategoriesSticky
                ? "flex gap-2 overflow-x-auto px-4 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : "flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            }
          >
            {categories.map((c) => (
              <motion.li key={c.key} layout className="shrink-0">
                <Link
                  href="/menu"
                  className={
                    isCategoriesSticky
                      ? "flex items-center gap-1.5 rounded-full bg-slate-100/90 px-3 py-1.5 border border-gray-200/80 hover:bg-slate-200 transition-all text-xs font-semibold text-slate-800 shadow-2xs"
                      : "flex w-20 flex-col items-center gap-2 rounded-2xl bg-white px-3 py-3 border border-gray-200 hover:scale-105 transition-all shadow-xs"
                  }
                >
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={isCategoriesSticky ? "text-sm" : "text-2xl"}
                  >
                    {c.emoji}
                  </motion.span>
                  <motion.span
                    layout
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={isCategoriesSticky ? "text-xs font-bold text-slate-800" : "text-[11px] font-semibold text-slate-800"}
                  >
                    {c.key}
                  </motion.span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </motion.section>

        {/* Popular burgers */}
        <section className="pt-6">
          <div className="flex items-center justify-between px-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" /> Popular burgers
            </h3>
            <Link href="/menu" className="text-xs font-semibold text-purple-700 hover:underline">
              See all
            </Link>
          </div>
          <ul className="mt-3 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {!mounted
              ? null
              : displayPopular.map((item) => (
                  <li key={item.id} className="w-56 shrink-0">
                    <article
                      onClick={() => setSelectedDetailItem(item)}
                      className="overflow-hidden rounded-3xl bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-36 w-full bg-gray-100">
                        <img
                          src={item.image?.src || item.image || ""}
                          alt={item.name}
                          loading="lazy"
                          width={768}
                          height={768}
                          className="h-full w-full object-cover"
                        />
                        {item.tag && (
                          <span className="absolute left-3 top-3 rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate text-sm font-bold text-slate-900">{item.name}</h4>
                          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-slate-800">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {item.rating}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">{item.desc}</p>
                        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                          <span className="text-base font-bold text-slate-900">₹{item.price.toFixed(2)}</span>
                          <motion.button
                            whileTap={{ scale: 0.75, rotate: 90 }}
                            onClick={(e) => handleAdd(e, item)}
                            aria-label={`Add ${item.name}`}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-white hover:scale-105 transition-transform"
                          >
                            <Plus className="h-4 w-4" strokeWidth={3} />
                          </motion.button>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
          </ul>
        </section>

        {/* Recommended for you */}
        <section className="px-5 pt-6">
          <h3 className="text-base font-bold text-slate-900">Recommended for you</h3>
          <ul className="mt-3 space-y-3">
            {!mounted
              ? null
              : recommended.map((item) => (
                  <li key={item.id}>
                    <article
                      onClick={() => setSelectedDetailItem(item)}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white p-3 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <img
                        src={item.image?.src || item.image || ""}
                        alt={item.name}
                        loading="lazy"
                        width={768}
                        height={768}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-slate-900">{item.name}</h4>
                        <p className="line-clamp-1 text-[11px] text-slate-500">{item.desc}</p>
                        <span className="mt-1 inline-block text-sm font-bold text-slate-900">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.75, rotate: 90 }}
                        onClick={(e) => handleAdd(e, item)}
                        aria-label={`Add ${item.name}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-white hover:scale-105 transition-transform"
                      >
                        <Plus className="h-4 w-4" strokeWidth={3} />
                      </motion.button>
                    </article>
                  </li>
                ))}
          </ul>
        </section>
      </div>

      {/* Interactive Product Detail Bottom Sheet (3/4 height snap -> 4/4 screen on scroll up) */}
      <ProductDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />

      {/* Kaivu IRL Shoppable UGC Story Modal */}
      <KaivuStoryModal
        stories={stories.length > 0 ? stories : getStories()}
        initialIndex={activeStoryIndex ?? 0}
        isOpen={activeStoryIndex !== null}
        onClose={() => setActiveStoryIndex(null)}
        onSelectProduct={(product) => setSelectedDetailItem(product)}
      />
    </MobileShell>
  );
}
