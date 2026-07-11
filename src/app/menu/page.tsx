"use client";

import { useState } from "react";
import { Search, Star, Plus, SlidersHorizontal } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { categories } from "@/lib/menu-data";
import { useMenu } from "@/lib/menu-store";
import { cart } from "@/lib/cart-store";
import { auth, useAuth } from "@/lib/auth-store";
import { getImageUrl } from "@/lib/utils";

export default function Menu() {
  const menu = useMenu((s) => s.menu);
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const [q, setQ] = useState("");
  const filtered = menu.filter(
    (m) => (active === "All" || m.category === active) && m.name.toLowerCase().includes(q.toLowerCase()),
  );
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
      <header className="px-5 pt-6">
        <h1 className="text-2xl font-bold">Menu</h1>
        <p className="text-sm text-muted-foreground">Pick your craving.</p>
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
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"
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
                className="rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                style={{
                  background: isActive ? "var(--color-brand)" : "var(--color-surface)",
                  color: isActive ? "var(--color-brand-foreground)" : "var(--color-foreground)",
                }}
              >
                {c}
              </button>
            </li>
          );
        })}
      </ul>

      <section className="px-5 pt-5">
        <ul className="grid grid-cols-2 gap-3">
          {filtered.map((item) => (
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
                  {item.tag && (
                    <span className="absolute left-2 top-2 rounded-full bg-foreground/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-background">
                      {item.tag}
                    </span>
                  )}
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
                    <span className="text-base font-bold">₹{item.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAdd({ id: item.id, name: item.name, price: item.price, image: getImageUrl(item.image) })}
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
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">Nothing here. Try another category.</p>
        )}
      </section>
    </MobileShell>
  );
}
