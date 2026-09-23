"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Plus, Minus, ShoppingBag } from "lucide-react";
import { useFlyToCart } from "./FlyToCartProvider";

type ProductItem = {
  id: string;
  name: string;
  desc?: string;
  description?: string;
  price: number;
  image?: any;
  imageUrl?: string;
  rating?: number;
  tag?: string;
  isComingSoon?: boolean;
};

type Props = {
  item: ProductItem | null;
  onClose: () => void;
};

export function ProductDetailModal({ item, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);

  const { flyToCart } = useFlyToCart();

  useEffect(() => {
    if (item) {
      setQuantity(1);
    }
  }, [item]);

  if (!item) return null;

  const isComingSoon = Boolean(item.isComingSoon) || item.tag?.toLowerCase() === "coming soon";
  const imageSrc = item.image?.src || item.image || item.imageUrl || "";
  const descriptionText =
    item.desc ||
    item.description ||
    "Crafted with 100% fresh ingredients, grilled to perfection on a high-heat flat top for signature crispy edges and juicy savory flavor.";

  const totalPrice = item.price * quantity;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    flyToCart(e, {
      id: item.id,
      name: item.name,
      price: item.price,
      image: imageSrc,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Sliding Bottom Sheet Drawer */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.2 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              onClose();
            }
          }}
          className="relative z-10 w-full max-w-md bg-[#1A1A1A] rounded-t-[32px] shadow-2xl flex flex-col h-[75vh] max-h-[640px]"
        >
          {/* Header Drag Handle */}
          <div className="pt-3 pb-2 flex flex-col items-center shrink-0">
            <div className="h-1.5 w-12 rounded-full bg-[#333]" />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail view"
            className="absolute top-4 right-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-[#1A1A1A]/80 backdrop-blur-md text-[#FFF8E7] hover:bg-[#333] transition-colors shadow-md cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Hero Image View */}
            <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-[#242424] shadow-md">
              {isComingSoon ? (
                <div className="h-full w-full bg-maroon-stripes flex items-center justify-center">
                  <span className="text-[#FFF8E7] text-sm font-black uppercase tracking-wider font-display text-center px-3">
                    Photo Coming Soon
                  </span>
                </div>
              ) : (
                <img
                  src={imageSrc}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              )}
              {!isComingSoon && item.tag ? (
                <span className="absolute top-3 left-3 rounded-full bg-[#661E28] px-3 py-1 text-xs font-bold text-[#FFF8E7] uppercase tracking-wider shadow-sm">
                  {item.tag}
                </span>
              ) : null}
            </div>

            {/* Title & Rating Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-[#FFF8E7] leading-tight font-display uppercase tracking-wide">
                  {item.name}
                </h2>
                <div className="flex items-center gap-1 rounded-full bg-[#2A2A2A] px-2.5 py-1 text-xs font-bold text-amber-400 border border-[#333] shrink-0">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating || 4.8}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-[#A0937D] font-medium leading-relaxed">
                {descriptionText}
              </p>
            </div>

            {isComingSoon ? (
              <div className="p-4 rounded-2xl bg-[#661E28]/20 border border-[#661E28]/30 text-center space-y-1">
                <p className="text-xs font-extrabold text-[#FFF8E7] uppercase tracking-wider">
                  🚀 Launching Soon
                </p>
                <p className="text-[11px] text-[#A0937D]">
                  This item is not yet available for ordering. Stay tuned for the official launch!
                </p>
              </div>
            ) : (
              /* Quantity Selector */
              <div className="flex items-center justify-between rounded-2xl bg-[#242424] p-3.5 border border-[#333]">
                <span className="text-xs font-bold text-[#FFF8E7]">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#333] text-[#FFF8E7] hover:bg-[#444] cursor-pointer transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-extrabold text-[#FFF8E7] w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-[#661E28] text-[#FFF8E7] hover:bg-[#7a2432] cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-[#242424] border-t border-[#333] p-4 shadow-lg flex items-center gap-3 rounded-b-none">
            {isComingSoon ? (
              <div className="w-full flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#A0937D] uppercase tracking-wider">Status</span>
                  <p className="text-sm font-extrabold text-amber-400 leading-none mt-0.5">
                    Unreleased ✨
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#661E28]/20 border border-[#661E28]/30 px-5 py-3.5 text-xs font-bold text-[#A0937D] select-none cursor-not-allowed"
                >
                  <span>🚀 Coming Soon</span>
                </button>
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-[#A0937D] uppercase tracking-wider">Total</span>
                  <p className="text-lg font-extrabold text-[#FFF8E7] leading-none">
                    ₹{totalPrice.toFixed(2)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#661E28] px-5 py-3.5 text-xs font-bold text-[#FFF8E7] shadow-lg hover:bg-[#7a2432] transition-colors cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Order</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
