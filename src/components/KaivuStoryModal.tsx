"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles, ChevronRight, Pause, Play, ShoppingBag } from "lucide-react";
import { KaivuStory, markStoryAsViewed } from "@/lib/stories-data";
import { cart } from "@/lib/cart-store";
import { useFlyToCart } from "@/components/FlyToCartProvider";

interface KaivuStoryModalProps {
  stories: KaivuStory[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: any) => void;
  onStoryViewed?: (storyId: string) => void;
}

export function KaivuStoryModal({
  stories,
  initialIndex,
  isOpen,
  onClose,
  onSelectProduct,
  onStoryViewed,
}: KaivuStoryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [addedItemSuccess, setAddedItemSuccess] = useState<string | null>(null);

  const { flyToCart } = useFlyToCart();
  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setIsPaused(false);
  }, [initialIndex, isOpen]);

  const currentStory = stories[currentIndex];

  // Mark story as viewed
  useEffect(() => {
    if (isOpen && currentStory) {
      markStoryAsViewed(currentStory.id);
      if (onStoryViewed) {
        onStoryViewed(currentStory.id);
      }
    }
  }, [isOpen, currentIndex, currentStory, onStoryViewed]);

  // Auto progress timer
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const intervalTime = 50; // update every 50ms
    const step = (intervalTime / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + step >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, isPaused, currentIndex, stories.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  const handleNext = () => {
    setProgress(0);
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    // Left 30% -> Previous story, Right 70% -> Next story
    if (x < width * 0.3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLElement>, item: any) => {
    e.stopPropagation();
    const flyItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: typeof item.image === "string" ? item.image : item.image?.src || "",
    };
    flyToCart(e, flyItem);
    cart.add(flyItem);

    setAddedItemSuccess(item.id);
    setTimeout(() => setAddedItemSuccess(null), 2000);
  };

  if (!isOpen || !currentStory) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-4 select-none"
      >
        {/* Mobile Story Frame */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.4}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100 || info.offset.y < -100) {
              onClose();
            }
          }}
          className="relative w-full max-w-sm h-full max-h-[100dvh] md:max-h-[840px] md:rounded-[36px] overflow-hidden bg-slate-950 text-white flex flex-col justify-between shadow-2xl border border-white/10"
        >
          {/* Top Controls Overlay */}
          <div className="absolute top-0 inset-x-0 z-30 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent space-y-3 pointer-events-auto">
            {/* Story Progress Segment Bars */}
            <div className="flex gap-1.5 w-full">
              {stories.map((story, idx) => {
                let segmentProgress = 0;
                if (idx < currentIndex) segmentProgress = 100;
                else if (idx === currentIndex) segmentProgress = progress;
                else segmentProgress = 0;

                return (
                  <div
                    key={story.id}
                    className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-white transition-all duration-75 ease-linear"
                      style={{ width: `${segmentProgress}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Customer Profile Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src={storyAvatar(currentStory)}
                    alt={currentStory.username}
                    className="h-10 w-10 rounded-full object-cover border-2 border-yellow-400 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs">
                    {currentStory.reactionEmoji}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-white drop-shadow">
                      {currentStory.username}
                    </span>
                    <span className="text-[10px] bg-purple-600/80 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      IRL
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70 font-medium">
                    {currentStory.timestamp}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Pause/Play & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPaused(!isPaused);
                  }}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                  aria-label={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="h-4 w-4 fill-white" /> : <Pause className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors backdrop-blur-sm"
                  aria-label="Close Story"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Story Content Area (Click Left/Right & Hold to Pause) */}
          <div
            onClick={handleScreenClick}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="relative flex-1 w-full h-full cursor-pointer flex items-center justify-center overflow-hidden"
          >
            {/* Background Story Media (Video or Image/GIF) */}
            {currentStory.mediaType === "video" || currentStory.mediaUrl.match(/\.(mp4|webm)($|\?)/i) ? (
              <video
                src={currentStory.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <img
                src={currentStory.mediaUrl}
                alt={`Story by ${currentStory.username}`}
                className="h-full w-full object-cover"
              />
            )}

            {/* Optional Customer Caption Overlay */}
            {currentStory.caption && (
              <div className="absolute top-24 left-4 right-4 z-20 pointer-events-none">
                <div className="inline-block bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs font-medium text-white max-w-[85%] shadow-lg leading-relaxed">
                  "{currentStory.caption}"
                </div>
              </div>
            )}
          </div>

          {/* Bottom Shoppable Product Card Overlay */}
          <div className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-3">
            {/* Tagged Shoppable Product Card */}
            {currentStory.featuredProduct && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                key={currentStory.featuredProduct.id}
                className="rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 p-3 flex items-center justify-between gap-3 shadow-2xl"
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectProduct) {
                      onSelectProduct(currentStory.featuredProduct);
                    }
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
                >
                  <img
                    src={
                      typeof currentStory.featuredProduct.image === "string"
                        ? currentStory.featuredProduct.image
                        : currentStory.featuredProduct.image?.src || ""
                    }
                    alt={currentStory.featuredProduct.name}
                    className="h-12 w-12 rounded-xl object-cover shrink-0 border border-white/20 group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-yellow-300">
                      <Sparkles className="h-3 w-3 text-yellow-300" /> Featured Meal
                    </span>
                    <h5 className="text-xs font-bold text-white truncate group-hover:text-yellow-200 transition-colors">
                      {currentStory.featuredProduct.name}
                    </h5>
                    <p className="text-xs font-extrabold text-white/90">
                      ₹{currentStory.featuredProduct.price.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Direct Add to Cart Button */}
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={(e) => handleAddToCart(e, currentStory.featuredProduct)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                    addedItemSuccess === currentStory.featuredProduct.id
                      ? "bg-green-500 text-white"
                      : "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 hover:from-amber-300 hover:to-yellow-300"
                  }`}
                >
                  {addedItemSuccess === currentStory.featuredProduct.id ? (
                    <span>Added! ✓</span>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 stroke-[3]" />
                      <span>ADD</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* UGC Brand Tag Prompt */}
            <div className="text-center pt-1">
              <p className="text-[10px] font-semibold text-white/60 tracking-wider">
                ♡ Loved your Kaivu? Tag <span className="text-yellow-300 font-bold">@kaivu</span> to get featured!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function storyAvatar(story: KaivuStory): string {
  return story.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80";
}
