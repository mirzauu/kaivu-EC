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
  ShoppingBag,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useMenu } from "@/lib/menu-store";
import { useAuth } from "@/lib/auth-store";
import { useCart } from "@/lib/cart-store";
import { PushingHandBanner } from "@/components/PushingHandBanner";
import { useLocation, locationStore } from "@/lib/location-store";
import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCart } from "@/components/FlyToCartProvider";
import { KaivuBrandLogo } from "@/components/KaivuBrandLogo";

import { HeroCarousel } from "@/components/HeroCarousel";

import { menu as defaultMenu, MenuItem } from "@/lib/menu-data";

const topCategories = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Burrito", emoji: "🌯" },
  { name: "Sides", emoji: "🍟" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Combos", emoji: "🎁" },
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

  const loadedItem = allItems.find(
    (m) => m.name?.toLowerCase().includes("loaded") || m.id?.toLowerCase().includes("loaded")
  );
  const heroBurgers = allItems.filter(
    (m) => !m.category || m.category.toLowerCase() === "burgers"
  );
  const featuredInHero = allItems.filter((m) => Boolean(m.isFeatured));
  const heroItems = featuredInHero.length > 0
    ? featuredInHero
    : loadedItem
    ? [...heroBurgers.slice(0, 2), loadedItem, ...heroBurgers.slice(2)]
    : heroBurgers.length > 0
    ? heroBurgers
    : allItems;
  const displayCombos = allItems.filter(
    (m) => m.category?.toLowerCase() === "combos" || m.name?.toLowerCase().includes("combo") || m.name?.toLowerCase().includes("party")
  );
  if (displayCombos.length === 0) displayCombos.push(...allItems.slice(0, 5));
  const recommended = allItems.slice(0, 4);
  const user = useAuth((s) => s.user);
  const isBogoEligible = user?.orderCount === undefined || user?.orderCount === 0;
  const { flyToCart } = useFlyToCart();

  const locationAddress = useLocation((s) => s.address);
  const locationLoading = useLocation((s) => s.isLoading);
  const itemCount = useCart((s) => s.itemCount);
  const items = useCart((s) => s.items);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [showCartBar, setShowCartBar] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let idleTimer: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShowCartBar(false);
      } else if (currentScrollY < lastScrollY) {
        setShowCartBar(true);
      }
      
      lastScrollY = currentScrollY;

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setShowCartBar(true);
      }, 1500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(idleTimer);
    };
  }, []);


  const [bogoToastVisible, setBogoToastVisible] = useState(false);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: MenuItem) => {
    e.stopPropagation();
    flyToCart(e, item);
    
    if (item.category === "Burgers" || !item.category) {
      setBogoToastVisible(true);
      setTimeout(() => {
        setBogoToastVisible(false);
      }, 4000);
    }
  };

  return (
    <MobileShell noPadding>
      {/* Page-level Sticky Top Categories Header (Horizontal Scroll with See All at End) */}
      <header
        className={`sticky top-0 z-50 pt-2.5 pb-2 px-4 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm"
            : "bg-transparent border-b border-transparent pointer-events-none"
        }`}
      >
        <ul className="flex gap-2.5 overflow-x-auto px-1 py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-w-md mx-auto pointer-events-auto">
          {topCategories.map((cat) => (
            <li key={cat.name} className="shrink-0">
              <Link
                href={`/menu?category=${encodeURIComponent(cat.name)}`}
                className={`flex w-16 h-16 flex-col items-center justify-center rounded-2xl p-2 text-center active:scale-95 transition-all shadow-sm group ${
                  isScrolled
                    ? "bg-slate-100 border border-slate-200/90 hover:bg-slate-200 text-slate-900"
                    : "bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 text-white"
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <span className={`text-[9.5px] font-extrabold tracking-wider uppercase mt-1 leading-none truncate max-w-full ${
                  isScrolled ? "text-slate-800" : "text-white"
                }`}>
                  {cat.name}
                </span>
              </Link>
            </li>
          ))}

          {/* See All Box Card at the end of scroll */}
          <li className="shrink-0">
            <Link
              href="/menu"
              className={`flex w-16 h-16 flex-col items-center justify-center rounded-2xl p-2 text-center active:scale-95 transition-all shadow-sm group ${
                isScrolled
                  ? "bg-slate-100 border border-slate-200/90 hover:bg-slate-200 text-slate-900"
                  : "bg-white/20 backdrop-blur-md border border-white/20 hover:bg-white/30 text-white"
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">✨</span>
              <span className={`text-[9.5px] font-extrabold tracking-wider uppercase mt-1 leading-none ${
                isScrolled ? "text-slate-800" : "text-white"
              }`}>
                See All
              </span>
            </Link>
          </li>
        </ul>
      </header>

      {/* Top Hero Screen with Big Scrollable Product Cards */}
      <div id="hero-carousel" className="-mt-[96px] scroll-mt-24">
        <HeroCarousel
          mounted={mounted}
          items={heroItems}
          onSelectProduct={(item) => setSelectedDetailItem(item)}
          onAddToCart={(e, item) => handleAdd(e, item)}
        />
      </div>

          {/* Floating White Content Sheet */}
          <div className="relative z-10 -mt-6 rounded-t-[32px] bg-background pt-5 pb-4 shadow-[0_-10px_25px_rgba(0,0,0,0.12)] min-h-screen">
            {/* Pull Handle Indicator */}
            <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-200 mb-4" />


            {/* Interactive Hero Banner inside Floating White Screen */}
            <div className="mb-5">
              <PushingHandBanner isBogoEligible={isBogoEligible} />
            </div>

            {/* Promo Deal Banners & Sub-Offer Cards */}
            <div className="px-5 space-y-3">
              {/* Sub-Offer Twin Cards */}
              <div className="grid grid-cols-2 gap-3 pb-1">
                {/* First Order Offer Card */}
                <Link href="/menu?category=Burgers" className="relative overflow-hidden rounded-[20px] bg-[#FEF3D6] p-3.5 shadow-sm flex flex-col justify-between h-[105px] cursor-pointer hover:shadow-md transition-all group block">
                  {/* Subtle Background Radial Highlights */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-24 bg-amber-300/30 blur-xl rounded-full pointer-events-none" />
                  
                  <div className="z-10 max-w-[60%]">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#661E28] block">
                      {isBogoEligible ? "FIRST ORDER OFFER" : "CRAFT BURGERS"}
                    </span>
                    <h4 className="text-[16px] font-black tracking-tight text-[#661E28] leading-tight mt-1">
                      {isBogoEligible ? "BUY 1 GET 1" : "SMASH SPECIALS"}
                    </h4>
                  </div>
                  
                  {/* Vector SVG Gift Box Icon */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[72px] h-[72px] pointer-events-none z-10 group-hover:scale-108 transition-transform duration-300">
                    <GiftBoxSVG />
                  </div>

                  {/* Maroon Right Arrow Circle */}
                  <div className="absolute right-2.5 bottom-2.5 z-20 grid h-6 w-6 place-items-center rounded-full bg-[#661E28] text-white shadow-md group-hover:scale-110 transition-transform">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>

                {/* Party Packs Card */}
                <Link href="/menu?category=Combos" className="relative overflow-hidden rounded-[20px] bg-[#FDE7E1] p-3.5 shadow-sm flex flex-col justify-between h-[105px] cursor-pointer hover:shadow-md transition-all group block">
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
                </Link>
              </div>
            </div>







        {/* Special combos */}
        <section className="pt-2 pb-4">
          <div className="flex items-center justify-between px-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary" /> Special Combos
            </h3>
            <Link href="/menu?category=Combos" className="text-xs font-semibold text-primary hover:underline">
              See all
            </Link>
          </div>
          <ul className="mt-3 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {!mounted
              ? null
              : displayCombos.map((item) => {
                  const isComingSoon = Boolean(item.isComingSoon) || item.tag?.toLowerCase() === "coming soon";
                  return (
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
                        {isComingSoon ? (
                          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-md">
                            🚀 Coming Soon
                          </span>
                        ) : item.tag ? (
                          <span className="absolute left-3 top-3 rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            {item.tag}
                          </span>
                        ) : null}
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
                          {isComingSoon ? (
                            <span className="text-xs font-bold text-amber-600">Stay Tuned ✨</span>
                          ) : (
                            <span className="text-base font-bold text-slate-900">₹{item.price.toFixed(2)}</span>
                          )}
                          {isComingSoon ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 font-bold text-[10px] whitespace-nowrap">
                              Coming Soon
                            </span>
                          ) : (
                            <motion.button
                              whileTap={{ scale: 0.75, rotate: 90 }}
                              onClick={(e) => handleAdd(e, item)}
                              aria-label={`Add ${item.name}`}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-900 text-white hover:scale-105 transition-transform"
                            >
                              <Plus className="h-4 w-4" strokeWidth={3} />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </article>
                  </li>
                  );
                })}
          </ul>
        </section>


        {/* Recommended for you */}
        <section className="px-5 pt-6">
          <h3 className="text-base font-bold text-slate-900">Recommended for you</h3>
          <ul className="mt-3 space-y-3">
            {!mounted
              ? null
              : recommended.map((item) => {
                  const isComingSoon = Boolean(item.isComingSoon) || item.tag?.toLowerCase() === "coming soon";
                  return (
                  <li key={item.id}>
                    <article
                      onClick={() => setSelectedDetailItem(item)}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-white p-3 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={item.image?.src || item.image || ""}
                          alt={item.name}
                          loading="lazy"
                          width={768}
                          height={768}
                          className="h-full w-full object-cover"
                        />
                        {isComingSoon && (
                          <span className="absolute inset-x-0 bottom-0 bg-amber-500/90 text-slate-950 font-black text-[7.5px] uppercase text-center py-0.2 tracking-wider">
                            Soon
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="truncate text-sm font-bold text-slate-900">{item.name}</h4>
                          {isComingSoon && (
                            <span className="rounded-full bg-amber-500/15 text-amber-700 px-1.5 py-0.2 text-[8.5px] font-bold">
                              🚀 Soon
                            </span>
                          )}
                        </div>
                        <p className="line-clamp-1 text-[11px] text-slate-500">{item.desc}</p>
                        {isComingSoon ? (
                          <span className="mt-1 inline-block text-xs font-bold text-amber-600">
                            Stay Tuned ✨
                          </span>
                        ) : (
                          <span className="mt-1 inline-block text-sm font-bold text-slate-900">
                            ₹{item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {isComingSoon ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 font-bold text-[10px] whitespace-nowrap">
                          Soon
                        </span>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.75, rotate: 90 }}
                          onClick={(e) => handleAdd(e, item)}
                          aria-label={`Add ${item.name}`}
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-900 text-white hover:scale-105 transition-transform"
                        >
                          <Plus className="h-4 w-4" strokeWidth={3} />
                        </motion.button>
                      )}
                    </article>
                  </li>
                  );
                })}
          </ul>
        </section>

        {/* Bottom Brand Footer */}
        <div className="flex flex-col items-center justify-center gap-2 pt-6 pb-1 mb-0 select-none border-t border-border/40 mt-6 text-center">
          <p className="text-[11px] font-extrabold tracking-[0.25em] opacity-40 uppercase text-foreground">
            Made with love
          </p>
          <KaivuBrandLogo
            className="w-56 sm:w-72 max-w-[85%] text-foreground opacity-40 hover:opacity-75 transition-opacity"
            showTagline={true}
          />
        </div>
      </div>

      {/* Interactive Product Detail Bottom Sheet (3/4 height snap -> 4/4 screen on scroll up) */}
      <ProductDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />



      <AnimatePresence>
        {itemCount > 0 && mounted && showCartBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-5 right-5 z-50 max-w-md mx-auto"
          >
            <div className="relative">
              {/* BOGO Tag pill above cart bar (only when BOGO eligible) */}
              {isBogoEligible && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#FFB703] px-3.5 py-0.5 text-[9.5px] font-black uppercase text-[#661E28] shadow-md whitespace-nowrap tracking-wider flex items-center gap-1 border border-amber-300 z-10">
                  <span>🎁</span>
                  <span>Buy 1 Get 1 FREE Offer</span>
                </div>
              )}

              <Link
                href="/cart"
                className="flex items-center justify-between rounded-full bg-slate-900 px-5 py-3.5 text-white shadow-xl active:scale-95 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-bold">
                    {itemCount}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {isBogoEligible
                        ? (itemCount === 1 ? "Add 2nd item for FREE!" : "Buy 1 Get 1 Active")
                        : "Items in Cart"}
                    </span>
                    <span className="text-xs font-bold leading-tight truncate max-w-[150px] opacity-90">
                      {items.length === 1 ? items[0].name : `${itemCount} items in cart`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-bold text-sm">
                  View Cart <ShoppingBag className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileShell>
  );
}
