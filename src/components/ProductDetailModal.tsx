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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Sliding Bottom Sheet Drawer (Fixed Half-Page Modal) */}
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
          className="relative z-10 w-full max-w-md bg-white rounded-t-[32px] shadow-2xl flex flex-col h-[75vh] max-h-[640px]"
        >
          {/* Header Drag Handle */}
          <div className="pt-3 pb-2 flex flex-col items-center shrink-0">
            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail view"
            className="absolute top-4 right-4 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors shadow-md cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* Hero Image View */}
            <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-gray-100 shadow-md">
              <img
                src={imageSrc}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              {isComingSoon ? (
                <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-slate-950 uppercase tracking-wider shadow-md">
                  🚀 Coming Soon
                </span>
              ) : item.tag ? (
                <span className="absolute top-3 left-3 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                  {item.tag}
                </span>
              ) : null}
            </div>

            {/* Title & Rating Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {item.name}
                </h2>
                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200/60 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating || 4.8}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600 font-medium leading-relaxed">
                {descriptionText}
              </p>
            </div>

            {isComingSoon ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                <p className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  🚀 Launching Soon
                </p>
                <p className="text-[11px] text-amber-800/80">
                  This item is not yet available for ordering. Stay tuned for the official launch!
                </p>
              </div>
            ) : (
              /* Quantity Selector */
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-xs font-bold text-slate-900">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid h-8 w-8 place-items-center rounded-full bg-white text-slate-800 shadow-sm border border-slate-200 hover:bg-slate-100 cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-extrabold text-slate-900 w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200 p-4 shadow-lg flex items-center gap-3 rounded-b-none">
            {isComingSoon ? (
              <div className="w-full flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  <p className="text-sm font-extrabold text-amber-600 leading-none mt-0.5">
                    Unreleased ✨
                  </p>
                </div>
                <button
                  type="button"
                  disabled
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-500/20 border border-amber-500/30 px-5 py-3.5 text-xs font-bold text-amber-800 select-none cursor-not-allowed"
                >
                  <span>🚀 Coming Soon</span>
                </button>
              </div>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                  <p className="text-lg font-extrabold text-slate-900 leading-none">
                    ₹{totalPrice.toFixed(2)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
