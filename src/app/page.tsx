"use client";

import Link from "next/link";
import { Search, MapPin, Bell, Star, Plus, Flame } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useMenu } from "@/lib/menu-store";
import { cart } from "@/lib/cart-store";
import { auth, useAuth } from "@/lib/auth-store";
import hero from "@/assets/hero-burger.jpg";

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

  const handleAdd = (item: any) => {
    if (!isAuthenticated) {
      auth.openModal(() => {
        cart.add(item);
      });
    } else {
      cart.add(item);
    }
  };

  return (
    <MobileShell>
      {/* Top bar */}
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Deliver to
          </p>
          <p className="truncate text-sm font-semibold text-foreground">
            221B Baker Street · 12 min
          </p>
        </div>
        <button
          aria-label="Notifications"
          className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface shadow-sm"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand" />
        </button>
      </header>

      {/* Greeting */}
      <section className="px-5 pt-5">
        <h1 className="text-[28px] font-bold leading-[1.1] text-foreground">
          Hungry, Alex? <br />
          <span className="text-brand">Let's fix that.</span>
        </h1>
      </section>

      {/* Search */}
      <div className="px-5 pt-4">
        <label className="flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            placeholder="Search burgers, fries, shakes…"
          />
        </label>
      </div>

      {/* Hero offer */}
      <section className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">
                <Flame className="h-3 w-3" /> Today only
              </span>
              <h2 className="mt-2 text-xl font-bold leading-tight">
                Double Smash <br />
                Combo · 30% off
              </h2>
              <Link
                href="/menu"
                className="mt-3 inline-flex items-center rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground"
              >
                Order now
              </Link>
            </div>
            <img
              src={hero.src}
              alt="Kaivu signature smashed cheeseburger"
              width={1024}
              height={1024}
              className="h-32 w-32 shrink-0 rounded-2xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pt-6">
        <div className="flex items-center justify-between px-5">
          <h3 className="text-base font-bold">Categories</h3>
          <Link href="/menu" className="text-xs font-semibold text-brand">See all</Link>
        </div>
        <ul className="mt-3 flex gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <li key={c.key} className="shrink-0">
              <Link
                href="/menu"
                className="flex w-20 flex-col items-center gap-2 rounded-2xl bg-surface px-3 py-3 shadow-sm"
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-[11px] font-semibold">{c.key}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Popular */}
      <section className="pt-6">
        <div className="flex items-center justify-between px-5">
          <h3 className="text-base font-bold">Popular burgers</h3>
          <Link href="/menu" className="text-xs font-semibold text-brand">See all</Link>
        </div>
        <ul className="mt-3 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {popular.map((item) => (
            <li key={item.id} className="w-56 shrink-0">
              <article className="overflow-hidden rounded-3xl bg-surface shadow-sm">
                <div className="relative h-36 w-full bg-accent">
                  <img
                    src={item.image.src || item.image}
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
                    <h4 className="truncate text-sm font-bold">{item.name}</h4>
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold">
                      <Star className="h-3 w-3 fill-brand text-brand" /> {item.rating}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{item.desc}</p>
                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                    <span className="text-base font-bold">₹{item.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAdd({ id: item.id, name: item.name, price: item.price, image: item.image.src || item.image })}
                      aria-label={`Add ${item.name}`}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground"
                    >
                      <Plus className="h-4 w-4" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* Recommended */}
      <section className="px-5 pt-6">
        <h3 className="text-base font-bold">Recommended for you</h3>
        <ul className="mt-3 space-y-3">
          {recommended.map((item) => (
            <li key={item.id}>
              <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm">
                <img
                  src={item.image.src || item.image}
                  alt={item.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold">{item.name}</h4>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.desc}</p>
                  <span className="mt-1 inline-block text-sm font-bold">₹{item.price.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => handleAdd({ id: item.id, name: item.name, price: item.price, image: item.image.src || item.image })}
                  aria-label={`Add ${item.name}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
                >
                  <Plus className="h-4 w-4" strokeWidth={3} />
                </button>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </MobileShell>
  );
}
