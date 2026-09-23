"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ShoppingBag } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { categories } from "@/lib/menu-data";
import { useMenu } from "@/lib/menu-store";
import { cart, useCart } from "@/lib/cart-store";
import { auth, useAuth } from "@/lib/auth-store";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { ProductDetailModal } from "@/components/ProductDetailModal";

import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCart } from "@/components/FlyToCartProvider";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

const topCategories = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Burrito", emoji: "🌯" },
  { name: "Sides", emoji: "🍟" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Combos", emoji: "🎁" },
];

function MenuContent() {
  const menu = useMenu((s) => s.menu);
  const searchParams = useSearchParams();
  const defaultCategory = searchParams.get("category") || "All";
  const [active, setActive] = useState<(typeof categories)[number]>(
    (categories.includes(defaultCategory as any) ? defaultCategory : "All") as any
  );
  const [selectedDetailItem, setSelectedDetailItem] = useState<any>(null);

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

  const filtered = menu.filter((m) => {
    const isCategoryMatch =
      active === "All" ||
      m.category?.toLowerCase() === active.toLowerCase() ||
      (active === "Combos" && (m.category?.toLowerCase() === "combos" || m.category?.toLowerCase() === "combo")) ||
      (active === "Burrito" && (m.category?.toLowerCase() === "burrito" || m.category?.toLowerCase() === "burritos" || m.category?.toLowerCase() === "burito"));
    return isCategoryMatch;
  });

  // Group filtered items by category for section display
  const groupedByCategory = topCategories.map((cat) => {
    const items = filtered.filter((m) => {
      if (cat.name === "Burgers") return !m.category || m.category.toLowerCase() === "burgers";
      if (cat.name === "Burrito") return m.category?.toLowerCase() === "burrito" || m.category?.toLowerCase() === "burritos" || m.category?.toLowerCase() === "burito";
      return m.category?.toLowerCase() === cat.name.toLowerCase();
    });
    return { ...cat, items };
  }).filter((g) => active === "All" || g.name === active);

  const { flyToCart } = useFlyToCart();

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: any) => {
    e.stopPropagation();
    flyToCart(e, item);
  };

  const itemCount = useCart((s) => s.itemCount);

  return (
    <div className="min-h-screen bg-[#111111] text-[#FFF8E7] pb-24">
      <main className="mx-auto max-w-md bg-[#111111] overflow-hidden min-h-screen">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-50 bg-[#161616]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10">
          <Link href="/" className="text-base font-bold text-white tracking-wide font-display uppercase hover:opacity-90">
            Kaivu — Order Online
          </Link>

          <Link
            href="/cart"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[#FFF8E7] hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            aria-label="View Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#7A1424] px-1 text-[10px] font-black text-white shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

        {/* Category Navigation Bar — Full-width White strip with circular icons */}
        <nav className="bg-white py-2.5 px-3">
          <ul className="flex items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topCategories.map((cat) => {
              const isSelected = active === cat.name || (active === "All" && cat.name === "Burgers");
              return (
                <li key={cat.name} className="flex-1 flex flex-col items-center min-w-[58px]">
                  <button
                    onClick={() => setActive(cat.name as any)}
                    className="group flex flex-col items-center cursor-pointer transition-transform active:scale-95"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-[#1A1A1A] ring-2 ring-[#7A1424] ring-offset-1 ring-offset-white scale-105"
                          : "bg-[#7A8288] hover:bg-[#687076]"
                      }`}
                    >
                      <span className="text-xl leading-none select-none drop-shadow-xs">
                        {cat.emoji}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] mt-1 tracking-tight select-none ${
                        isSelected
                          ? "font-extrabold text-[#111111]"
                          : "font-medium text-[#777777]"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quote Banner — Full Width Rich Maroon */}
        <div className="bg-[#66101F] px-5 py-4 border-y border-[#4A0A15]">
          <p className="text-[#FFF8E7] text-base sm:text-lg font-bold font-display uppercase leading-tight tracking-wider">
            &ldquo;FOOD CAN BE MORE THAN SOMETHING YOU CONSUME.&rdquo;
          </p>
        </div>

        {/* Category Sections & 2-Col Product Cards */}
        <div className="px-3.5 pt-6 space-y-8">
          {groupedByCategory.map((group) => (
            <section key={group.name} id={`section-${group.name}`} className="scroll-mt-14">
              <h2 className="text-2xl font-black text-white font-display uppercase tracking-wider mb-3.5">
                {group.name}
              </h2>

              {group.items.length === 0 ? (
                <div className="rounded-none bg-[#FFF8E7] p-4 text-[#111111]">
                  <p className="text-xs font-semibold">
                    More {group.name.toLowerCase()} are coming soon.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {group.items.map((item) => {
                    const isComingSoon =
                      Boolean(item.isComingSoon) ||
                      item.tag?.toLowerCase() === "coming soon" ||
                      !item.image;
                    const imageSrc = getImageUrl(item.image);

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedDetailItem(item)}
                        className="flex flex-col cursor-pointer group select-none"
                      >
                        {/* Top Card: Photo or Striped Photo Coming Soon */}
                        <div className="relative aspect-square w-full bg-[#1A1A1A] overflow-hidden">
                          {isComingSoon ? (
                            <div className="h-full w-full bg-maroon-stripes flex items-center justify-center p-3 text-center">
                              <span className="text-[#FFF8E7] text-xs font-black uppercase tracking-wider font-display leading-tight drop-shadow-md">
                                PHOTO COMING SOON
                              </span>
                            </div>
                          ) : (
                            <img
                              src={imageSrc}
                              alt={item.name}
                              loading="lazy"
                              width={600}
                              height={600}
                              className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          )}

                          {/* Floating Red/Maroon Add Button in Bottom-Right */}
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={(e) =>
                              handleAdd(e, {
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                image: imageSrc,
                              })
                            }
                            aria-label={`Add ${item.name}`}
                            className="absolute right-2 bottom-2 grid h-7 w-7 place-items-center rounded-full bg-[#66101F] text-white shadow-md hover:bg-[#7A1424] transition-colors cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[3]" />
                          </motion.button>
                        </div>

                        {/* Bottom Card: Cream Info Label Box */}
                        <div className="bg-[#FFF8E7] p-3 flex flex-col justify-between min-h-[145px]">
                          <div>
                            <h3 className="text-xs font-extrabold text-[#66101F] font-display uppercase tracking-wide leading-tight line-clamp-1">
                              {item.name}
                            </h3>
                            <span className="text-[9px] font-bold text-[#8A7865] uppercase tracking-wider block mt-0.5">
                              {item.tag ||
                                (item.name.toLowerCase().includes("chicken")
                                  ? "CHICKEN"
                                  : "BEEF")}
                            </span>
                            <p className="text-[10px] text-[#444444] font-medium leading-snug line-clamp-2 mt-1">
                              {item.desc}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDetailItem(item);
                              }}
                              className="text-[10px] font-bold text-[#66101F] underline decoration-[#66101F] mt-1.5 block cursor-pointer"
                            >
                              More details
                            </button>
                          </div>
                          <div className="mt-2 pt-1">
                            {isComingSoon || item.price === 0 ? (
                              <span className="text-xs font-black text-[#111111] font-display uppercase tracking-wider">
                                MARKET PRICE
                              </span>
                            ) : (
                              <span className="text-xs font-black text-[#111111] font-display uppercase tracking-wider">
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-none bg-[#FFF8E7] p-5 text-[#111111] text-center">
              <p className="text-xs font-bold">Nothing found in this category.</p>
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />
    </div>
  );
}

export default function Menu() {
  return (
    <Suspense fallback={<div className="p-5 text-center text-[#FFF8E7]">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
