"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin, ChevronRight, RefreshCw, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useLocation, locationStore } from "@/lib/location-store";

interface HeroCarouselProps {
  mounted: boolean;
}

export function HeroCarousel({ mounted }: HeroCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const locationAddress = useLocation((s) => s.address);
  const locationLoading = useLocation((s) => s.isLoading);
  const locationError = useLocation((s) => s.error);

  /* GSAP Intro Animation */
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });

      gsap.set(["#html-headline", "#html-subtitle", "#html-button"], { y: 25, opacity: 0 });

      // 0.3s: HTML headlines, subtitle & button stagger in from left
      tl.to(["#html-headline", "#html-subtitle", "#html-button"], {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
      }, 0.6);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#111] pt-4 pb-7 shadow-lg min-h-[310px] flex flex-col justify-between select-none"
    >
      {/* Full-Bleed Animated Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <video
          src="/Character_raises_the_spatula_a.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Gradient Overlay Mask for Crisp Text & Location Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 via-40% to-transparent to-60% w-full pointer-events-none z-10" />
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/60 to-transparent w-full pointer-events-none z-10" />
      </div>

      {/* Top Location Bar */}
      <div className="relative z-30 px-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => locationStore.refresh()}
          className="min-w-0 text-left flex-1 group"
          aria-label="Refresh location"
        >
          <div className="flex items-center gap-1 text-[11px] font-medium text-white">
            <span className="font-bold text-white flex items-center gap-1 bg-[rgba(0,0,0,0.55)] px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/20 shadow-md">
              <MapPin className="h-3.5 w-3.5 text-yellow-400" />
              Deliver to <ChevronRight className="h-3 w-3 inline text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
          {!mounted || locationLoading ? (
            <div className="mt-1 h-4 w-36 animate-pulse rounded bg-black/40 backdrop-blur-md" />
          ) : locationError && !locationAddress ? (
            <p className="flex items-center gap-1 truncate text-xs font-medium text-white drop-shadow-sm mt-0.5 pl-0.5">
              Tap to set location <RefreshCw className="h-3 w-3" />
            </p>
          ) : (
            <p className="truncate text-xs font-extrabold text-white drop-shadow-md mt-0.5 pl-0.5">
              {locationAddress || "Malappuram, Kerala 676307"}
            </p>
          )}
        </button>
      </div>

      {/* Real HTML Content (Left Aligned for Headlines & Buttons) */}
      <div className="relative z-30 px-6 pt-3 pb-2 flex flex-col justify-center my-auto min-h-[170px]">
        <div className="flex flex-col items-start text-left max-w-[56%] sm:max-w-[50%]">
          
          {/* HTML Headline */}
          <div id="html-headline">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-[1.05] drop-shadow-md">
              SMASHED
              <br />
              <span className="text-[#FF5500]">TO PERFECTION.</span>
            </h2>
          </div>

          {/* HTML Subtitle */}
          <div id="html-subtitle">
            <p className="text-[11px] font-semibold leading-snug text-white/95 mt-1.5 max-w-[195px] drop-shadow-sm">
              Crafted with real ingredients. Delivered to your door.
            </p>
          </div>

          {/* HTML Interactive Button */}
          <div id="html-button" className="mt-3.5 flex items-center gap-3">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black bg-[#2A0812] text-white shadow-xl hover:bg-[#3D0C1A] active:scale-95 transition-all"
            >
              <span>Order now</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#FF7733] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
