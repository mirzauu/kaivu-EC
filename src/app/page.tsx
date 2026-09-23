"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Plus,
  ShoppingBag,
  X,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { useMenu } from "@/lib/menu-store";
import { useAuth } from "@/lib/auth-store";
import { useCart, getPaidSubtotal, getFreeDrinkItem, getAmountNeededForFreeDrink } from "@/lib/cart-store";
import { FreeDrinkGrabArea } from "@/components/FreeDrinkGrabArea";
import { ActiveOrderFloatingBanner } from "@/components/ActiveOrderFloatingBanner";
import { useLocation, locationStore } from "@/lib/location-store";
import { motion, AnimatePresence } from "framer-motion";
import { useFlyToCart } from "@/components/FlyToCartProvider";
import { KaivuBrandLogo } from "@/components/KaivuBrandLogo";
import { getImageUrl } from "@/lib/utils";

import { menu as defaultMenu, MenuItem } from "@/lib/menu-data";

const topCategories = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Burrito", emoji: "🌯" },
  { name: "Sides", emoji: "🍟" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Combos", emoji: "🎁" },
];

const emptySubscribe = () => () => {};

export default function Home() {
  const storeMenu = useMenu((s) => s.menu);
  const allItems = storeMenu && storeMenu.length > 0 ? storeMenu : defaultMenu;

  const user = useAuth((s) => s.user);
  const { flyToCart } = useFlyToCart();

  const itemCount = useCart((s) => s.itemCount);
  const items = useCart((s) => s.items);
  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [isScrolling, setIsScrolling] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);
  const [showCartBar, setShowCartBar] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let idleTimer: NodeJS.Timeout;
    let scrollIdleTimer: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolling(true);
      clearTimeout(scrollIdleTimer);
      scrollIdleTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);

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
      clearTimeout(scrollIdleTimer);
    };
  }, []);

  const [showAddedToast, setShowAddedToast] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>, item: MenuItem) => {
    e.stopPropagation();
    flyToCart(e, item);

    // Show "Added to cart" notification pill like in reference
    setShowAddedToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowAddedToast(false);
    }, 2500);
  };

  // Group items by category
  const categoryGroups = topCategories.map((cat) => {
    const categoryItems = allItems.filter((m) => {
      if (cat.name === "Burgers") return !m.category || m.category.toLowerCase() === "burgers";
      if (cat.name === "Burrito") return m.category?.toLowerCase() === "burrito" || m.category?.toLowerCase() === "burritos" || m.category?.toLowerCase() === "burito";
      return m.category?.toLowerCase() === cat.name.toLowerCase();
    });
    return { ...cat, items: categoryItems };
  });

  const scrollToCategory = (name: string) => {
    setActiveCategory(name);
    const el = document.getElementById(`section-${name}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#111111] text-[#FFF8E7] pb-20">
      <main className="mx-auto max-w-md bg-[#111111] overflow-hidden min-h-screen">
        {/* Top Header Bar */}
        <div className="sticky top-0 z-50 bg-[#161616]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10">
          <span className="text-base font-bold text-white tracking-wide font-display uppercase">
            Kaivu — Order Online
          </span>

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

        {/* Hero Section with Dot Matrix Background & 'See the menu' button card */}
        <section className="bg-dot-pattern px-4 pt-4 pb-5 border-b border-black">
          <Link
            href="/menu"
            className="inline-block rounded-none bg-[#FFF8E7] px-6 py-2.5 shadow-sm active:scale-95 transition-transform"
          >
            <span className="text-sm font-extrabold text-[#5C0B17] font-display uppercase tracking-wide">
              See the menu
            </span>
          </Link>
        </section>

        {/* Category Navigation Bar — Full-width White strip with circular icons */}
        <nav className="bg-white py-2.5 px-3">
          <ul className="flex items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topCategories.map((cat) => {
              const isSelected = (activeCategory === cat.name) || (!activeCategory && cat.name === "Burrito");
              return (
                <li key={cat.name} className="flex-1 flex flex-col items-center min-w-[58px]">
                  <button
                    onClick={() => scrollToCategory(cat.name)}
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

        {/* Food Categories & Product Grid */}
        <div className="px-3.5 pt-6 space-y-8">
          {categoryGroups.map((group) => (
            <section key={group.name} id={`section-${group.name}`} className="scroll-mt-14">
              {/* Section Header (e.g. BURGERS / BURRITO) */}
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
                  {mounted &&
                    group.items.map((item) => {
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

                            {/* Floating Red/Maroon Add Button in Bottom-Right of the image */}
                            <motion.button
                              whileTap={{ scale: 0.85 }}
                              onClick={(e) => handleAdd(e, item)}
                              aria-label={`Add ${item.name}`}
                              className="absolute right-2 bottom-2 grid h-7 w-7 place-items-center rounded-full bg-[#66101F] text-white shadow-md hover:bg-[#7A1424] transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5 stroke-[3]" />
                            </motion.button>
                          </div>

                          {/* Bottom Card: Cream Info Label Box */}
                          <div className="bg-[#FFF8E7] p-3 flex flex-col justify-between min-h-[145px]">
                            <div>
                              {/* Product Title */}
                              <h3 className="text-xs font-extrabold text-[#66101F] font-display uppercase tracking-wide leading-tight line-clamp-1">
                                {item.name}
                              </h3>

                              {/* Meat / Sub-Category (CHICKEN / BEEF) */}
                              <span className="text-[9px] font-bold text-[#8A7865] uppercase tracking-wider block mt-0.5">
                                {item.tag ||
                                  (item.name.toLowerCase().includes("chicken")
                                    ? "CHICKEN"
                                    : "BEEF")}
                              </span>

                              {/* Description */}
                              <p className="text-[10px] text-[#444444] font-medium leading-snug line-clamp-2 mt-1">
                                {item.desc}
                              </p>

                              {/* More details link */}
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

                            {/* Price / Market Price */}
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
        </div>

        {/* Free Drink Grab Area */}
        <div className="px-3.5 mt-8 mb-6">
          <FreeDrinkGrabArea />
        </div>

        {/* Footer Brand Credit */}
        <div className="flex flex-col items-center justify-center gap-2 pt-6 pb-8 border-t border-white/10 mt-6 text-center">
          <p className="text-[10px] font-extrabold tracking-[0.25em] opacity-40 uppercase text-[#FFF8E7]">
            Made with love
          </p>
          <KaivuBrandLogo
            className="w-48 max-w-[80%] text-[#FFF8E7] opacity-40 hover:opacity-75 transition-opacity"
            showTagline={true}
          />
        </div>
      </main>

      {/* "Added to cart" Toast Pill Notification (matching reference UI) */}
      <AnimatePresence>
        {showAddedToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-[#1A1A1A] text-[#FFF8E7] px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/10 tracking-wide pointer-events-auto">
              Added to cart
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Active Order Status Banner */}
      <ActiveOrderFloatingBanner isVisible={!isScrolling} />

      {/* Interactive Product Detail Bottom Sheet */}
      <ProductDetailModal
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />
    </div>
  );
}
