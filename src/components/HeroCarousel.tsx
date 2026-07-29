"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { MapPin, ChevronRight, RefreshCw, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useLocation, locationStore } from "@/lib/location-store";

/* ─────────────────────────────────────────────
   SVG ELEMENTS
───────────────────────────────────────────── */

// 1. Vector Sparks & Stars SVG
function SparksSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full fill-[#FF5500]">
      <path d="M20 10 L23 17 L30 20 L23 23 L20 30 L17 23 L10 20 L17 17 Z" opacity="0.9" />
      <path d="M80 15 L82.5 21 L89 23.5 L82.5 26 L80 32 L77.5 26 L71 23.5 L77.5 21 Z" opacity="0.85" fill="#FFAA00" />
      <path d="M85 70 L87 75 L92 77 L87 79 L85 84 L83 79 L78 77 L83 75 Z" opacity="0.8" />
    </svg>
  );
}

// 2. Vector Hearts & Doodles SVG
function HeartsSVG() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M20 35 C20 25, 32 20, 40 28 C48 20, 60 25, 60 35 C60 48, 40 60, 40 62 C40 60, 20 48, 20 35 Z"
        fill="none"
        stroke="#FF5500"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M70 70 C70 65, 76 62, 80 66 C84 62, 90 65, 90 70 C90 77, 80 84, 80 85 C80 84, 70 77, 70 70 Z"
        fill="#FF5A52"
        opacity="0.8"
      />
    </svg>
  );
}

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

      gsap.set(["#svg-sparks", "#svg-hearts"], { scale: 0, opacity: 0 });
      gsap.set(["#html-badge", "#html-headline", "#html-subtitle", "#html-button"], { y: 25, opacity: 0 });

      // 0.3s: SVG Sparks & Hearts burst open
      tl.to(["#svg-sparks", "#svg-hearts"], {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "back.out(2)",
      }, 0.3);

      // 0.6s: HTML headlines, badge pill, subtitle & button stagger in from left
      tl.to(["#html-badge", "#html-headline", "#html-subtitle", "#html-button"], {
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
      className="relative w-full overflow-hidden bg-[#FFF0EB] pt-4 pb-7 shadow-lg min-h-[310px] flex flex-col justify-between select-none"
    >
      {/* Full-Bleed Animated Video Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        <video
          src="/Character_raises_the_spatula_a.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Gradient Overlay Mask for Crisp Text & Location Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFF0EB] via-[#FFF0EB]/85 to-transparent w-full sm:w-2/3 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

        {/* Top-Left Pink Organic Background Blob SVG */}
        <svg className="absolute -top-8 -left-8 w-52 h-52 opacity-80 pointer-events-none" viewBox="0 0 200 200" fill="none">
          <path d="M30,20 C90,-10 170,30 160,110 C150,190 70,180 20,130 C-30,80 -10,30 30,20 Z" fill="#FF9A85" opacity="0.65" />
        </svg>

        {/* SVG Hearts Doodle */}
        <div id="svg-hearts" className="absolute top-[18%] left-[32%] w-16 h-16 pointer-events-none">
          <HeartsSVG />
        </div>

        {/* SVG Sparks & Stars Doodle */}
        <div id="svg-sparks" className="absolute top-[10%] right-[32%] w-16 h-16 pointer-events-none">
          <SparksSVG />
        </div>
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
            <p className="flex items-center gap-1 truncate text-xs font-medium text-slate-900 drop-shadow-sm mt-0.5 pl-0.5">
              Tap to set location <RefreshCw className="h-3 w-3" />
            </p>
          ) : (
            <p className="truncate text-xs font-extrabold text-slate-950 drop-shadow-md mt-0.5 pl-0.5">
              {locationAddress || "Malappuram, Kerala 676307"}
            </p>
          )}
        </button>
      </div>

      {/* Real HTML Content (Left Aligned for Headlines & Buttons) */}
      <div className="relative z-30 px-6 pt-3 pb-2 flex flex-col justify-center my-auto min-h-[170px]">
        <div className="flex flex-col items-start text-left max-w-[56%] sm:max-w-[50%]">
          {/* HTML Badge Pill */}
          <div id="html-badge">
            <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[rgba(255,85,0,0.12)] text-[#FF5500] border border-[rgba(255,85,0,0.25)] mb-2 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
              MADE FRESH. DELIVERED HOT.
            </span>
          </div>

          {/* HTML Headline */}
          <div id="html-headline">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#3A141A] leading-[1.05]">
              SMASHED
              <br />
              <span className="text-[#FF5500]">TO PERFECTION.</span>
            </h2>
          </div>

          {/* HTML Subtitle */}
          <div id="html-subtitle">
            <p className="text-[11px] font-semibold leading-snug text-[#4A242B] mt-1.5 max-w-[195px]">
              Crafted with real ingredients. Delivered to your door.
            </p>
          </div>

          {/* HTML Interactive Button */}
          <div id="html-button" className="mt-3.5">
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
