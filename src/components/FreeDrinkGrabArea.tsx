"use client";

import { useRef } from "react";
import { Plus, Check, Ticket } from "lucide-react";
import { useMenu } from "@/lib/menu-store";
import { menu as defaultMenu, MenuItem } from "@/lib/menu-data";
import { useFlyToCart } from "@/components/FlyToCartProvider";
import { useCart, getPaidSubtotal, getFreeDrinkItem, getAmountNeededForFreeDrink } from "@/lib/cart-store";
import { motion } from "framer-motion";

interface FreeDrinkGrabAreaProps {
  items?: MenuItem[];
}

export function FreeDrinkGrabArea({ items }: FreeDrinkGrabAreaProps) {
  const storeMenu = useMenu((s) => s.menu);
  const { flyToCart } = useFlyToCart();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cart state for free drink limit and ₹400 minimum threshold
  const cartItems = useCart((s) => s.items);
  const paidSubtotal = getPaidSubtotal(cartItems);
  const freeDrinkItem = getFreeDrinkItem(cartItems);
  const amountNeeded = getAmountNeededForFreeDrink(cartItems, 400);

  // Dynamic drinks from database menu store
  const currentMenu = items && items.length > 0 ? items : storeMenu && storeMenu.length > 0 ? storeMenu : defaultMenu;
  const displayDrinks = currentMenu.filter(
    (item) => item.category?.toLowerCase() === "drinks"
  );

  const handleCardClick = (e: React.MouseEvent<HTMLElement>, drink: MenuItem) => {
    flyToCart(e, {
      id: drink.id,
      name: `${drink.name} (Free)`,
      price: 0,
      image: typeof drink.image === "string" ? drink.image : drink.imageUrl || "",
    });
  };

  return (
    <section className="px-5 pt-2 select-none font-sans">
      {/* Ticket Coupon Container */}
      <div
        id="free-drink-coupon"
        className="relative overflow-hidden rounded-[22px] shadow-[0_12px_30px_rgba(0,0,0,0.18)] border border-[#333] bg-[#1A1A1A]"
      >
        {/* Semicircular Ticket Cutout Notches on Left & Right Sides */}
        <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#1A1A1A] z-30 border-r border-[#333]" />
        <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#1A1A1A] z-30 border-l border-[#333]" />

        <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[78px_1fr] min-h-[220px]">
          {/* Left White Coupon Stub */}
          <div className="relative bg-[#242424] flex flex-col justify-between items-center py-4 px-1 border-r-2 border-dashed border-[#661E28] text-[#FFF8E7] z-20">
            {/* Vertical Sub-Text */}
            <span className="text-[9px] font-black uppercase tracking-widest text-[#A0937D] rotate-180 [writing-mode:vertical-lr] whitespace-nowrap">
              FREE DRINK TICKET
            </span>

            {/* Giant Outlined Typography (100% OFF) */}
            <div className="my-auto rotate-180 [writing-mode:vertical-lr] flex items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black tracking-tighter text-transparent stroke-[#661E28] [-webkit-text-stroke:2px_#661E28] leading-none">
                100%
              </span>
            </div>

            <Ticket className="h-4 w-4 text-[#661E28] shrink-0" />
          </div>

          {/* Main Red Coupon Body */}
          <div className="relative bg-gradient-to-br from-[#661E28] via-[#551A22] to-[#3D1018] p-3.5 sm:p-5 text-[#FFF8E7] flex flex-col justify-between overflow-hidden">
            {/* Background Accent Graphics */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-xl" />

            {/* Coupon Top Header */}
            <div className="relative z-10 mb-2 flex items-center justify-between">
              <div>
                <span className="text-[9px] sm:text-[10px] font-black tracking-widest uppercase text-amber-300 opacity-90 block">
                  KAIVU.COM • SPECIAL COUPON
                </span>
                <h2 className="text-[19px] sm:text-[22px] font-black uppercase tracking-tight text-white drop-shadow-sm leading-none mt-0.5">
                  GRAB YOUR FREE DRINK
                </h2>
              </div>

              {freeDrinkItem && (
                <span className="rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm shrink-0">
                  1 CLAIMED
                </span>
              )}
            </div>



            {/* Horizontal Left-to-Right Scrolling Drink Coupon Cards */}
            <div
              ref={scrollRef}
              className="relative z-10 flex gap-3 overflow-x-auto pb-1 pt-1 px-0.5 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x snap-x snap-mandatory"
            >
              {displayDrinks.map((drink) => {
                const imgSrc =
                  typeof drink.image === "string"
                    ? drink.image
                    : drink.imageUrl || "/images/brand/logo.svg";

                const isSelected =
                  freeDrinkItem &&
                  (freeDrinkItem.id === drink.id ||
                    freeDrinkItem.name.toLowerCase().includes(drink.name.toLowerCase()));

                return (
                  <motion.div
                    key={drink.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => handleCardClick(e, drink)}
                    className={`group relative flex min-w-[125px] w-[125px] sm:min-w-[140px] sm:w-[140px] shrink-0 snap-start flex-col justify-between rounded-[18px] p-2.5 shadow-md backdrop-blur-md transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-slate-900 ring-2 ring-amber-400 shadow-amber-400/30"
                        : "bg-white/95 text-slate-900 border border-white/80 hover:bg-white"
                    }`}
                  >
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-20">
                        <span className="inline-flex items-center rounded-full bg-emerald-600 px-1.5 py-0.5 text-[8px] font-black uppercase text-white shadow-xs">
                          SELECTED
                        </span>
                      </div>
                    )}

                    {/* Drink Image Box */}
                    <div className="relative mb-1.5 h-20 w-full overflow-hidden rounded-[14px] bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-1.5">
                      <img
                        src={imgSrc}
                        alt={drink.name}
                        className="h-full w-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Drink Info & Price */}
                    <div>
                      <h3 className="text-[12px] font-black leading-tight text-slate-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                        {drink.name}
                      </h3>

                      {/* Price: ₹0 Free */}
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-[15px] font-black text-emerald-600 leading-none">
                          ₹0
                        </span>
                        {drink.price > 0 && (
                          <span className="text-[10px] font-bold text-slate-400 line-through">
                            ₹{drink.price}
                          </span>
                        )}
                      </div>

                      {/* Add / Swap / Selected Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(e, drink);
                        }}
                        className={`mt-2 w-full rounded-full text-[10.5px] font-black py-1 px-2.5 flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all ${
                          isSelected
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : freeDrinkItem
                            ? "bg-slate-900 text-white hover:bg-black"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                            <span>ADDED</span>
                          </>
                        ) : freeDrinkItem ? (
                          <span>SWAP</span>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 text-white" strokeWidth={3} />
                            <span>ADD</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
