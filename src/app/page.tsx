"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Plus,
  RefreshCw,
  Mic,
  Menu,
  ChevronRight,
  Percent,
  Truck,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useMenu } from "@/lib/menu-store";
import { useAuth } from "@/lib/auth-store";
import { PushingHandBanner } from "@/components/PushingHandBanner";
import { useLocation, locationStore } from "@/lib/location-store";
import { motion } from "framer-motion";
import { useFlyToCart } from "@/components/FlyToCartProvider";

const categories = [
  { key: "Burgers", emoji: "🍔" },
  { key: "Sides", emoji: "🍟" },
  { key: "Drinks", emoji: "🥤" },
  { key: "Desserts", emoji: "🍰" },
  { key: "Combos", emoji: "🎁" },
];

export default function Home() {
  const menu = useMenu((s) => s.menu);
  const popular = menu.filter((m) => m.category === "Burgers");
  const recommended = menu.slice(0, 4);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const { flyToCart } = useFlyToCart();

  const locationAddress = useLocation((s) => s.address);
  const locationLoading = useLocation((s) => s.isLoading);
  const locationError = useLocation((s) => s.error);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: any) => {
    flyToCart(e, item);
  };

  return (
    <MobileShell>
      {/* Top Hero Section Container */}
      <div className="relative z-0 bg-[#2B0642] text-white px-5 pt-5 pb-10 space-y-4">
        {/* Top Header Location & Menu Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => locationStore.refresh()}
            className="min-w-0 text-left flex-1"
            aria-label="Refresh location"
          >
            <div className="flex items-center gap-1 text-[11px] font-medium text-white/70">
              <span className="font-bold text-white flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-yellow-300" />
                Deliver to <ChevronRight className="h-3 w-3 inline" />
              </span>
            </div>
            {!mounted || locationLoading ? (
              <div className="mt-0.5 h-4 w-36 animate-pulse rounded bg-white/20" />
            ) : locationError && !locationAddress ? (
              <p className="flex items-center gap-1 truncate text-xs font-medium text-white/80">
                Tap to set location <RefreshCw className="h-3 w-3" />
              </p>
            ) : (
              <p className="truncate text-xs font-bold text-white">
                {locationAddress || "Malappuram, Kerala 676307"}
              </p>
            )}
          </button>

          <button
            aria-label="Menu"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 shadow-xl text-gray-900 cursor-text">
            <Search className="h-5 w-5 text-purple-600 shrink-0" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium placeholder:text-gray-400 focus:outline-none"
              placeholder="Search for 'Sweets, Burgers, Fries'…"
            />
            <div className="h-4 w-[1px] bg-gray-200" />
            <Mic className="h-5 w-5 text-purple-600 shrink-0" />
          </label>
        </div>

        {/* Hero Interactive Banner */}
        <div className="-mx-5 px-0">
          <PushingHandBanner />
        </div>

        {/* Sub-Offer Cards inside Hero */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-800 to-purple-950 p-3.5 border border-white/10 shadow-lg flex flex-col justify-between h-28">
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

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-800 to-purple-950 p-3.5 border border-white/10 shadow-lg flex flex-col justify-between h-28">
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
      </div>

      {/* Sliding Rounded White Content Sheet (Pure White #FFFFFF) */}
      <div className="relative z-20 -mt-6 rounded-t-[32px] bg-white pt-5 pb-36 shadow-[0_-20px_50px_rgba(0,0,0,0.35)] min-h-screen border-t border-gray-100/60">
        {/* Pull Handle Indicator */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/25 mb-4" />

        {/* Promo Deal Banners inside White Sheet */}
        <div className="px-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Main Discount Card */}
            <div className="rounded-2xl bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 p-4 border border-sky-200/70 shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-block text-[11px] font-extrabold text-sky-700 tracking-wide">FLAT ₹100 OFF</span>
                <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-2">
                  No minimum order value on any meal, big or small!
                </p>
                <button
                  type="button"
                  className="mt-2.5 rounded-full bg-orange-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow hover:bg-orange-700 transition-colors"
                >
                  CLAIM DEAL
                </button>
              </div>
              <div className="h-16 w-16 shrink-0 rounded-2xl bg-sky-200/50 flex items-center justify-center text-3xl shadow-inner">
                🍔
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl bg-surface p-3 border border-border shadow-sm flex items-center gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 font-bold text-sm">
                  <Percent className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">OFFER ZONE</p>
                  <p className="text-[10px] text-muted-foreground">Up to 60% OFF</p>
                </div>
              </div>

              <div className="rounded-2xl bg-surface p-3 border border-border shadow-sm flex items-center gap-2.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700 font-bold text-sm">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">EXPRESS</p>
                  <p className="text-[10px] text-muted-foreground">Fast Delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories ("What's on your mind?") */}
        <section className="pt-6">
          <div className="flex items-center justify-between px-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-brand" /> What's on your mind?
            </h3>
            <Link href="/menu" className="text-xs font-semibold text-brand hover:underline">
              See all
            </Link>
          </div>
          <ul className="mt-3.5 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((c) => (
              <li key={c.key} className="shrink-0">
                <Link
                  href="/menu"
                  className="flex w-20 flex-col items-center gap-2 rounded-2xl bg-surface px-3 py-3 shadow-sm border border-border/50 hover:scale-105 transition-transform"
                >
                  <span className="text-2xl">{c.emoji}</span>
                  <span className="text-[11px] font-semibold text-foreground">{c.key}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Popular burgers */}
        <section className="pt-6">
          <div className="flex items-center justify-between px-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" /> Popular burgers
            </h3>
            <Link href="/menu" className="text-xs font-semibold text-brand hover:underline">
              See all
            </Link>
          </div>
          <ul className="mt-3 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {!mounted
              ? null
              : popular.map((item) => (
                  <li key={item.id} className="w-56 shrink-0">
                    <article className="overflow-hidden rounded-3xl bg-surface shadow-sm border border-border/60">
                      <div className="relative h-36 w-full bg-accent">
                        <img
                          src={item.image?.src || item.image || ""}
                          alt={item.name}
                          loading="lazy"
                          width={768}
                          height={768}
                          className="h-full w-full object-cover"
                        />
                        {item.tag && (
                          <span className="absolute left-3 top-3 rounded-full bg-foreground/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="truncate text-sm font-bold text-foreground">{item.name}</h4>
                          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-foreground">
                            <Star className="h-3 w-3 fill-brand text-brand" /> {item.rating}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{item.desc}</p>
                        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                          <span className="text-base font-bold text-foreground">₹{item.price.toFixed(2)}</span>
                          <motion.button
                            whileTap={{ scale: 0.75, rotate: 90 }}
                            onClick={(e) =>
                              handleAdd(e, {
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                image: item.image?.src || item.image,
                              })
                            }
                            aria-label={`Add ${item.name}`}
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground shadow-sm hover:scale-105 transition-transform"
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
          <h3 className="text-base font-bold text-foreground">Recommended for you</h3>
          <ul className="mt-3 space-y-3">
            {!mounted
              ? null
              : recommended.map((item) => (
                  <li key={item.id}>
                    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm border border-border/50">
                      <img
                        src={item.image?.src || item.image || ""}
                        alt={item.name}
                        loading="lazy"
                        width={768}
                        height={768}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-foreground">{item.name}</h4>
                        <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.desc}</p>
                        <span className="mt-1 inline-block text-sm font-bold text-foreground">
                          ₹{item.price.toFixed(2)}
                        </span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.75, rotate: 90 }}
                        onClick={(e) =>
                          handleAdd(e, {
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image: item.image?.src || item.image,
                          })
                        }
                        aria-label={`Add ${item.name}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform"
                      >
                        <Plus className="h-4 w-4" strokeWidth={3} />
                      </motion.button>
                    </article>
                  </li>
                ))}
          </ul>
        </section>
      </div>
    </MobileShell>
  );
}
