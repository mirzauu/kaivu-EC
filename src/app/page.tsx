"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  MapPin,
  Star,
  Plus,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
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

import { menu as defaultMenu, MenuItem } from "@/lib/menu-data";

const categories = [
  { key: "Burgers", emoji: "🍔" },
  { key: "Burrito", emoji: "🌯" },
  { key: "Pasta", emoji: "🍝" },
  { key: "Side", emoji: "🍟" },
  { key: "Drink", emoji: "🥤" },
  { key: "Combo", emoji: "🎁" },
];

const emptySubscribe = () => () => {};

function GiftBoxSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="giftGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB703" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFB703" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="boxFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E63946" />
          <stop offset="100%" stopColor="#9D0208" />
        </linearGradient>
        <linearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D90429" />
          <stop offset="100%" stopColor="#6A040F" />
        </linearGradient>
        <linearGradient id="ribbonYellow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD166" />
          <stop offset="100%" stopColor="#FFB703" />
        </linearGradient>
      </defs>
      
      {/* Background Soft Rays / Glow */}
      <circle cx="50" cy="50" r="45" fill="url(#giftGlow)" />
      
      {/* Sparkles */}
      <circle cx="20" cy="25" r="2" fill="#FFB703" opacity="0.8" />
      <circle cx="80" cy="20" r="2.5" fill="#FFB703" opacity="0.9" />
      <circle cx="85" cy="70" r="1.5" fill="#FFB703" opacity="0.7" />

      {/* Gift Box Base Lid */}
      <path d="M22 45 L50 32 L78 45 L50 58 Z" fill="#EF233C" />
      
      {/* Gift Box Front Left */}
      <path d="M22 45 L50 58 L50 88 L22 75 Z" fill="url(#boxFront)" />
      
      {/* Gift Box Front Right */}
      <path d="M50 58 L78 45 L78 75 L50 88 Z" fill="url(#boxSide)" />

      {/* Ribbon Vertical */}
      <path d="M44 34.5 L56 29 L56 85.5 L44 91 Z" fill="url(#ribbonYellow)" opacity="0.95" />
      {/* Ribbon Horizontal */}
      <path d="M22 45 L78 45 L78 52 L22 52 Z" fill="url(#ribbonYellow)" opacity="0.9" />

      {/* Ribbon Bow Top Left */}
      <path d="M50 32 C35 12, 18 28, 48 33 Z" fill="url(#ribbonYellow)" />
      {/* Ribbon Bow Top Right */}
      <path d="M50 32 C65 12, 82 28, 52 33 Z" fill="url(#ribbonYellow)" />
      {/* Bow Knot */}
      <circle cx="50" cy="32" r="5" fill="#FFC300" />
    </svg>
  );
}

function PartyPackSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="partyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FB8500" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FB8500" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cardboardOuter" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D4A373" />
          <stop offset="100%" stopColor="#A37146" />
        </linearGradient>
        <linearGradient id="bunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F4A261" />
          <stop offset="100%" stopColor="#E76F51" />
        </linearGradient>
      </defs>

      {/* Background Glow */}
      <circle cx="50" cy="55" r="45" fill="url(#partyGlow)" />

      {/* Fries sticking out behind box */}
      <rect x="35" y="18" width="5" height="25" rx="2" fill="#FFB703" transform="rotate(-12 35 18)" />
      <rect x="42" y="15" width="5" height="28" rx="2" fill="#FFD166" transform="rotate(-4 42 15)" />
      <rect x="58" y="15" width="5" height="26" rx="2" fill="#FFB703" transform="rotate(8 58 15)" />
      <rect x="65" y="20" width="5" height="22" rx="2" fill="#FFD166" transform="rotate(15 65 20)" />

      {/* Burger 1 inside box (Left) */}
      <g transform="translate(26, 26)">
        {/* Top Bun */}
        <path d="M4 18 C4 8, 26 8, 26 18 Z" fill="url(#bunGrad)" />
        {/* Lettuce & Cheese */}
        <rect x="2" y="18" width="26" height="3" rx="1.5" fill="#2A9D8F" />
        <path d="M6 21 L12 25 L18 21 L24 25" stroke="#E9C46A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Meat Patty */}
        <rect x="3" y="23" width="24" height="4" rx="2" fill="#6A040F" />
      </g>

      {/* Burger 2 inside box (Right) */}
      <g transform="translate(48, 28)">
        {/* Top Bun */}
        <path d="M4 18 C4 8, 26 8, 26 18 Z" fill="url(#bunGrad)" />
        {/* Lettuce & Cheese */}
        <rect x="2" y="18" width="26" height="3" rx="1.5" fill="#2A9D8F" />
        <path d="M8 21 L14 25 L20 21" stroke="#E9C46A" strokeWidth="2.5" strokeLinecap="round" />
        {/* Meat Patty */}
        <rect x="3" y="23" width="24" height="4" rx="2" fill="#6A040F" />
      </g>

      {/* Cardboard Box Open Flaps */}
      <path d="M15 48 L28 35 L50 46 L25 58 Z" fill="#E9C46A" opacity="0.8" />
      <path d="M85 48 L72 35 L50 46 L75 58 Z" fill="#E9C46A" opacity="0.8" />

      {/* Cardboard Box Front Body */}
      <path d="M15 48 L50 60 L85 48 L85 82 L50 94 L15 82 Z" fill="url(#cardboardOuter)" stroke="#8B5E34" strokeWidth="1.5" strokeLinejoin="round" />

      {/* Center Box Line */}
      <line x1="50" y1="60" x2="50" y2="94" stroke="#8B5E34" strokeWidth="1.5" />
    </svg>
  );
}

export default function Home() {
  const storeMenu = useMenu((s) => s.menu);
  const allItems = storeMenu && storeMenu.length > 0 ? storeMenu : defaultMenu;

  const popular = allItems.filter(
    (m) => !m.category || m.category.toLowerCase() === "burgers"
  );
  const displayPopular = popular.length > 0 ? popular : allItems;
  const recommended = allItems.slice(0, 4);
  useAuth((s) => s.isAuthenticated);
  const { flyToCart } = useFlyToCart();

  const locationAddress = useLocation((s) => s.address);
  const locationLoading = useLocation((s) => s.isLoading);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [stories] = useState<KaivuStory[]>(() => getStories());
  const [storiesEnabled] = useState<boolean>(() => isStoriesEnabled());



  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: MenuItem) => {
    e.stopPropagation();
    flyToCart(e, item);
  };

  return (
    <MobileShell>
      {/* Top Hero Screen with Big Scrollable Product Cards */}
      <HeroCarousel
        mounted={mounted}
        items={displayPopular}
        onSelectProduct={(item) => setSelectedDetailItem(item)}
        onAddToCart={(e, item) => handleAdd(e, item)}
      />

          {/* Floating White Content Sheet */}
          <div className="relative z-10 -mt-6 rounded-t-[32px] bg-background pt-5 pb-28 shadow-[0_-10px_25px_rgba(0,0,0,0.12)] min-h-screen">
            {/* Pull Handle Indicator */}
            <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200 mb-4" />

            {/* Popular burgers */}
            <section className="pt-2 pb-4">
              <div className="flex items-center justify-between px-5">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-primary" /> Popular burgers
                </h3>
                <Link href="/menu" className="text-xs font-semibold text-primary hover:underline">
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

            {/* Interactive Hero Banner inside Floating White Screen */}
            <div className="mb-5">
              <PushingHandBanner />
            </div>

            {/* Promo Deal Banners & Sub-Offer Cards */}
            <div className="px-5 space-y-3">
              {/* Sub-Offer Twin Cards */}
              <div className="grid grid-cols-2 gap-3 pb-1">
                {/* First Order Offer Card */}
                <div className="relative overflow-hidden rounded-[20px] bg-[#FEF3D6] p-3.5 shadow-sm flex flex-col justify-between h-[105px] cursor-pointer hover:shadow-md transition-all group">
                  {/* Subtle Background Radial Highlights */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 bg-amber-300/30 blur-xl rounded-full pointer-events-none" />
                  
                  <div className="z-10 max-w-[60%]">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#661E28] block">FIRST ORDER OFFER</span>
                    <h4 className="text-[20px] font-black tracking-tight text-[#661E28] leading-none mt-1">₹200 OFF</h4>
                    <p className="text-[9px] font-semibold text-[#661E28]/80 mt-1.5 leading-tight">On orders above ₹499</p>
                  </div>
                  
                  {/* Vector SVG Gift Box Icon */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[72px] h-[72px] pointer-events-none z-10 group-hover:scale-108 transition-transform duration-300">
                    <GiftBoxSVG />
                  </div>

                  {/* Maroon Right Arrow Circle */}
                  <div className="absolute right-2.5 bottom-2.5 z-20 grid h-6 w-6 place-items-center rounded-full bg-[#661E28] text-white shadow-md group-hover:scale-110 transition-transform">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Party Packs Card */}
                <div className="relative overflow-hidden rounded-[20px] bg-[#FDE7E1] p-3.5 shadow-sm flex flex-col justify-between h-[105px] cursor-pointer hover:shadow-md transition-all group">
                  {/* Subtle Background Radial Highlights */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 bg-orange-300/25 blur-xl rounded-full pointer-events-none" />

                  <div className="z-10 max-w-[60%]">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#661E28] block">PARTY PACKS</span>
                    <h4 className="text-[13.5px] font-black leading-snug text-[#661E28] mt-1">Feeds 4–6 People</h4>
                    <p className="text-[9px] font-semibold text-[#661E28]/80 mt-1.5 leading-tight">Starting at ₹799</p>
                  </div>

                  {/* Vector SVG Party Box Icon */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[74px] h-[74px] pointer-events-none z-10 group-hover:scale-108 transition-transform duration-300">
                    <PartyPackSVG />
                  </div>

                  {/* Maroon Right Arrow Circle */}
                  <div className="absolute right-2.5 bottom-2.5 z-20 grid h-6 w-6 place-items-center rounded-full bg-[#661E28] text-white shadow-md group-hover:scale-110 transition-transform">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
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



        {/* Sticky Categories Bar ("What's on your mind?") */}
        <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-md pt-3 pb-3 border-b border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition-all">
          <div className="flex items-center justify-between px-5 mb-2.5 overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> What&apos;s on your mind?
            </h3>
            <Link href="/menu" className="text-xs font-semibold text-primary hover:underline">
              See all
            </Link>
          </div>
          <ul className="flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((c) => (
              <li key={c.key} className="shrink-0">
                <Link
                  href="/menu"
                  className="flex w-20 flex-col items-center gap-2 rounded-2xl bg-white px-3 py-3 border border-gray-200 hover:scale-105 active:scale-95 transition-all shadow-xs"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-[11px] font-semibold text-slate-800">{c.key}</span>
                </Link>
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
