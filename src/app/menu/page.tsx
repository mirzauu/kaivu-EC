"use client";

import { useState } from "react";
import { Search, Star, Plus, SlidersHorizontal, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { categories } from "@/lib/menu-data";
import { useMenu } from "@/lib/menu-store";
import { cart } from "@/lib/cart-store";
import { auth, useAuth } from "@/lib/auth-store";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCart } from "@/components/FlyToCartProvider";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const PROMO_CYCLES = [
  { icon: "🎁", title: "BOGO 1+1 FREE", sub: "1ST ORDER ONLY" },
  { icon: "🍔", title: "BUY 1 GET 1", sub: "SMASH BURGERS" },
  { icon: "✨", title: "COMBO SPECIALS", sub: "PARTY PACKS" },
  { icon: "🛵", title: "FREE DELIVERY", sub: "ALL ORDERS" },
];

function MenuContent() {
  const menu = useMenu((s) => s.menu);
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get("category") || "All";
  const [active, setActive] = useState<(typeof categories)[number]>(
    (categories.includes(defaultCategory as any) ? defaultCategory : "All") as any
  );
  const [promoIdx, setPromoIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromoIdx((prev) => (prev + 1) % PROMO_CYCLES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const rawCat = searchParams.get("category");
    if (rawCat) {
      const match = categories.find(
        (c) =>
          c.toLowerCase() === rawCat.toLowerCase() ||
          c.toLowerCase().startsWith(rawCat.toLowerCase()) ||
          rawCat.toLowerCase().startsWith(c.toLowerCase())
      );
      if (match) setActive(match);
    }
  }, [searchParams]);

  const [q, setQ] = useState("");
  const filtered = menu.filter((m) => {
    const isCategoryMatch =
      active === "All" ||
      m.category?.toLowerCase() === active.toLowerCase() ||
      (active === "Combos" && (m.category?.toLowerCase() === "combos" || m.category?.toLowerCase() === "combo")) ||
      (active === "Burrito" && (m.category?.toLowerCase() === "burrito" || m.category?.toLowerCase() === "burritos" || m.category?.toLowerCase() === "burito"));
    const isQueryMatch = m.name.toLowerCase().includes(q.toLowerCase());
    return isCategoryMatch && isQueryMatch;
  });
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const user = useAuth((s) => s.user);
  const isBogoEligible = user?.orderCount === undefined || user?.orderCount === 0;
  const { flyToCart } = useFlyToCart();

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: any) => {
    flyToCart(e, item);
  };

  const currentPromo = PROMO_CYCLES[promoIdx];

  return (
    <MobileShell>
      <header className="px-5 pt-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Menu</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Pick your craving.</p>
          </div>

          {/* Kinetic Changing Animation on the other end (Right) */}
          <div className="relative h-10 overflow-hidden flex items-center shrink-0">
            <AnimatePresence mode="wait">
              <motion.button
                key={promoIdx}
                initial={{ y: 14, opacity: 0, scale: 0.94 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -14, opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => {
                  setActive("Burgers");
                  toast.success("BOGO 1+1 Free is active on your 1st order! 🍔🎉");
                }}
                className="flex items-center gap-2 text-right cursor-pointer focus:outline-none select-none py-1 group"
              >
                <div className="flex flex-col items-end justify-center">
                  <span className="text-[11.5px] font-black tracking-tight text-[#661E28] uppercase leading-tight group-hover:text-black transition-colors">
                    {currentPromo.title}
                  </span>
                  <span className="text-[8.5px] font-extrabold tracking-widest text-[#8C4B33] uppercase leading-none opacity-90">
                    {currentPromo.sub}
                  </span>
                </div>
                <motion.span 
                  className="text-lg select-none"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {currentPromo.icon}
                </motion.span>
              </motion.button>
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-5 pt-4">
        <label className="flex min-w-0 items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            placeholder="Search the menu"
          />
        </label>
        <button
          aria-label="Filters"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-black text-white"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      <ul className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const isActive = c === active;
          return (
            <li key={c} className="shrink-0">
              <button
                onClick={() => setActive(c)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  isActive ? "bg-black text-white" : "bg-surface text-foreground"
                }`}
              >
                {c}
              </button>
            </li>
          );
        })}
      </ul>

      <section className="px-5 pt-5">
        <ul className="grid grid-cols-2 gap-3">
          {filtered.map((item) => {
            const isCombo =
              item.category?.toLowerCase() === "combos" ||
              item.category?.toLowerCase() === "combo";
            const isComingSoon = Boolean(item.isComingSoon) || item.tag?.toLowerCase() === "coming soon";

            if (isCombo) {
              return (
                <li key={item.id} className="col-span-2">
                  <article className="flex flex-col overflow-hidden rounded-3xl bg-surface shadow-md border border-amber-300/40 relative">
                    <div className="relative h-44 w-full bg-accent overflow-hidden">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        loading="lazy"
                        width={768}
                        height={768}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {isComingSoon ? (
                        <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-md border border-amber-300">
                          🚀 COMING SOON
                        </span>
                      ) : item.tag ? (
                        <span className="absolute left-3 top-3 rounded-full bg-[#FFB703] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#661E28] shadow-md border border-amber-300">
                          🎁 {item.tag}
                        </span>
                      ) : null}

                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {item.rating}
                      </span>

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h4 className="text-lg font-black tracking-tight drop-shadow-sm">{item.name}</h4>
                      </div>
                    </div>

                    <div className="flex flex-col p-4">
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {item.desc}
                      </p>

                      <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-3">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">
                            {isComingSoon ? "STATUS" : "PARTY PACK PRICE"}
                          </span>
                          {isComingSoon ? (
                            <span className="text-sm font-extrabold text-amber-600">Unreleased</span>
                          ) : (
                            <span className="text-xl font-extrabold text-brand">₹{item.price.toFixed(2)}</span>
                          )}
                        </div>

                        {isComingSoon ? (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 select-none">
                            🚀 Launching Soon
                          </span>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) =>
                              handleAdd(e, {
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                image: getImageUrl(item.image),
                              })
                            }
                            aria-label={`Add ${item.name}`}
                            className="flex items-center gap-1.5 rounded-full bg-black px-4 py-2.5 text-xs font-extrabold text-white shadow-md cursor-pointer active:scale-95 transition-transform"
                          >
                            <span>Add Combo</span>
                            <Plus className="h-4 w-4" strokeWidth={3} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface shadow-sm">
                  <div className="relative h-28 w-full bg-accent">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      loading="lazy"
                      width={768}
                      height={768}
                      className="h-full w-full object-cover"
                    />
                    {isComingSoon ? (
                      <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-950 shadow-xs">
                        🚀 Coming Soon
                      </span>
                    ) : item.tag ? (
                      <span className="absolute left-2 top-2 rounded-full bg-foreground/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-background">
                        {item.tag}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="min-w-0 truncate text-sm font-bold">{item.name}</h4>
                      <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold">
                        <Star className="h-3 w-3 fill-brand text-brand" /> {item.rating}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{item.desc}</p>
                    <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pt-3">
                      {isComingSoon ? (
                        <span className="text-xs font-bold text-amber-600">Stay Tuned ✨</span>
                      ) : (
                        <span className="text-base font-bold">₹{item.price.toFixed(2)}</span>
                      )}
                      {isComingSoon ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold text-[10px] whitespace-nowrap select-none">
                          Coming Soon
                        </span>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.75, rotate: 90 }}
                          onClick={(e) =>
                            handleAdd(e, {
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              image: getImageUrl(item.image),
                            })
                          }
                          aria-label={`Add ${item.name}`}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black text-white shadow-sm cursor-pointer"
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
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">Nothing here. Try another category.</p>
        )}
      </section>
    </MobileShell>
  );
}

export default function Menu() {
  return (
    <Suspense fallback={<div className="p-5 text-center">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
