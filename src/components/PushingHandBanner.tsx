"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import { useFlyToCart } from "@/components/FlyToCartProvider";

type PushingHandBannerProps = {
  isBogoEligible?: boolean;
};

export function PushingHandBanner({ isBogoEligible = true }: PushingHandBannerProps) {
  const OFFERS = [
    {
      id: "free-delivery",
      shape: "●",
      badge: "FREE DELIVERY",
      badgeColor: "bg-[#E2B714] text-[#111111] border-[#E2B714]",
      accentColor: "#E2B714",
      titleMain: "FREE DELIVERY",
      titleSub: "ON ALL ORDERS ACROSS THE CITY",
      btnText: "ORDER NOW",
      link: "/menu",
      imageSrc: "/images/banners/doodle_delivery.png",
      alt: "Minimal cute doodle delivery rider with scooter",
      cartItem: {
        id: "the-smashed",
        name: "The Smashed",
        price: 330,
      },
    },
    isBogoEligible
      ? {
          id: "bogo-deal",
          shape: "▲",
          badge: "BUY 1 GET 1 FREE",
          badgeColor: "bg-[#1E40AF] text-white border-[#1E40AF]",
          accentColor: "#DC2626",
          titleMain: "BUY 1 GET 1",
          titleSub: "FOR YOUR FIRST ORDER ONLY",
          btnText: "CLAIM OFFER",
          link: "#hero-carousel",
          imageSrc: "/images/banners/doodle_bogo_burgers.png",
          alt: "Minimal cute doodle twin smash burgers",
          cartItem: {
            id: "the-smashed",
            name: "The Smashed",
            price: 330,
          },
        }
      : {
          id: "combo-deal",
          shape: "▲",
          badge: "POPULAR SPECIAL",
          badgeColor: "bg-[#1E40AF] text-white border-[#1E40AF]",
          accentColor: "#DC2626",
          titleMain: "BUY 1 GET 1",
          titleSub: "FOR YOUR FIRST ORDER ONLY",
          btnText: "EXPLORE MENU",
          link: "#hero-carousel",
          imageSrc: "/images/banners/doodle_bogo_burgers.png",
          alt: "Minimal cute doodle twin smash burgers",
          cartItem: {
            id: "the-smashed",
            name: "The Smashed",
            price: 330,
          },
        },
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement>(null);
  const innerItemRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isItemRemoved, setIsItemRemoved] = useState(false);

  const { flyToCart } = useFlyToCart();

  // Motion Values for position tracking
  const rawX = useSpring(0, { damping: 30, stiffness: 220, mass: 0.6 });
  const rawY = useSpring(0, { damping: 30, stiffness: 220, mass: 0.6 });

  // Spring Settings for physical reactions
  const springConfig = { damping: 20, stiffness: 180 };
  const cardScale = useSpring(1, springConfig);
  const cardRotateX = useSpring(0, springConfig);
  const cardRotateY = useSpring(0, springConfig);
  const cardSkewX = useSpring(0, springConfig);
  const cardSkewY = useSpring(0, springConfig);

  // Interactive 3D image push reaction springs
  const itemX = useSpring(0, { damping: 15, stiffness: 100 });
  const itemY = useSpring(0, { damping: 15, stiffness: 100 });
  const itemScaleX = useSpring(1, { damping: 15, stiffness: 100 });
  const itemScaleY = useSpring(1, { damping: 15, stiffness: 100 });
  const itemRotate = useSpring(0, { damping: 15, stiffness: 100 });

  // Text content parallax
  const textX = useSpring(0, springConfig);
  const textY = useSpring(0, springConfig);

  // Cycle offers every 4.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % OFFERS.length);
    }, 4800);
    return () => clearInterval(timer);
  }, []);

  // Wiggle the graphic whenever the offer cycles
  useEffect(() => {
    if (!innerItemRef.current) return;
    if (isHovered) return;

    const tl = gsap.timeline();
    tl.to(innerItemRef.current, {
      x: -10,
      y: -3,
      rotate: -7,
      duration: 0.09,
    })
      .to(innerItemRef.current, {
        x: 8,
        y: 3,
        rotate: 6,
        duration: 0.09,
      })
      .to(innerItemRef.current, {
        x: -6,
        y: -2,
        rotate: -4,
        duration: 0.09,
      })
      .to(innerItemRef.current, {
        x: 4,
        y: 2,
        rotate: 3,
        duration: 0.09,
      })
      .to(innerItemRef.current, {
        x: 0,
        y: 0,
        rotate: 0,
        duration: 0.45,
        ease: "elastic.out(1.2, 0.4)",
      });

    return () => {
      tl.kill();
    };
  }, [currentIndex, isHovered]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xVal = e.clientX - rect.left;
    const yVal = e.clientY - rect.top;

    rawX.set(xVal);
    rawY.set(yVal);

    // Rubber-band background distortion parameters
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const relX = (xVal - centerX) / centerX;
    const relY = (yVal - centerY) / centerY;

    cardRotateX.set(relY * -5);
    cardRotateY.set(relX * 5);
    cardSkewX.set(relX * 1.5);
    cardSkewY.set(relY * 0.8);

    // Text parallax
    textX.set(relX * -8);
    textY.set(relY * -6);

    // Item pushing reaction physics
    const itemCenterX = rect.width * 0.72;
    const itemCenterY = rect.height * 0.5;

    const dx = xVal - itemCenterX;
    const dy = yVal - itemCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const pushThreshold = 140;

    if (distance < pushThreshold) {
      const force = (pushThreshold - distance) / pushThreshold;
      const forceDirectionX = dx / (distance || 1);
      const forceDirectionY = dy / (distance || 1);

      itemX.set(forceDirectionX * force * 38);
      itemY.set(forceDirectionY * force * 28);

      itemScaleX.set(1 - force * 0.16);
      itemScaleY.set(1 + force * 0.12);
      itemRotate.set(forceDirectionX * force * -16);
    } else {
      itemX.set(0);
      itemY.set(0);
      itemScaleX.set(1);
      itemScaleY.set(1);
      itemRotate.set(0);
    }
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsHovered(true);

    const rect = containerRef.current.getBoundingClientRect();
    const xVal = e.clientX - rect.left;
    const yVal = e.clientY - rect.top;

    rawX.set(xVal);
    rawY.set(yVal);

    cardScale.set(1.02);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setIsPressed(false);

    cardScale.set(1);
    cardRotateX.set(0);
    cardRotateY.set(0);
    cardSkewX.set(0);
    cardSkewY.set(0);
    textX.set(0);
    textY.set(0);

    itemX.set(0);
    itemY.set(0);
    itemScaleX.set(1);
    itemScaleY.set(1);
    itemRotate.set(0);
  };

  const handlePointerDown = () => {
    setIsPressed(true);
    cardScale.set(0.97);
  };

  const handlePointerUp = () => {
    setIsPressed(false);
    cardScale.set(isHovered ? 1.02 : 1);
  };

  const currentOffer = OFFERS[currentIndex];

  return (
    <section className="px-5 pt-5 select-none font-sans">
      <motion.div
        ref={containerRef}
        id="pushing-hand-banner"
        className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#5C1E20] via-[#501B1D] to-[#3B1315] text-white shadow-[0_12px_30px_rgba(80,27,29,0.32)] border border-[#7E292E]/60 cursor-pointer touch-none"
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{
          scale: cardScale,
          rotateX: cardRotateX,
          rotateY: cardRotateY,
          skewX: cardSkewX,
          skewY: cardSkewY,
          transformStyle: "preserve-3d",
          perspective: 1200,
        }}
      >
        {/* Content Layout */}
        <div className="grid grid-cols-[minmax(0,1fr)_140px] sm:grid-cols-[minmax(0,1fr)_165px] items-center gap-2 p-5 sm:p-6 relative z-10 pointer-events-none">

          {/* Left Text & Geometric Details */}
          <motion.div
            style={{ x: textX, y: textY, z: 20 }}
            className="min-w-0 h-[145px] relative flex flex-col justify-between overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none"
              >

                {/* Bold Typography Stack */}
                <div className="my-auto">
                  <h2 className="text-[23px] sm:text-[25px] font-black tracking-tight leading-none text-white uppercase font-sans drop-shadow-sm">
                    {currentOffer.titleMain}
                  </h2>
                  <p className="text-[11px] sm:text-[12px] font-extrabold text-[#FCD34D] tracking-wide uppercase mt-1.5 opacity-95 drop-shadow-xs">
                    {currentOffer.titleSub}
                  </p>
                </div>

                {/* Action CTA */}
                <div className="flex items-center gap-3">
                  <Link
                    href={currentOffer.link}
                    className="group inline-flex items-center gap-1.5 rounded-full bg-[#FFE600] text-slate-950 px-4 py-2 text-[11px] font-black uppercase tracking-wider hover:bg-white hover:text-[#501B1D] hover:scale-105 active:scale-95 transition-all shadow-md pointer-events-auto"
                  >
                    <span>{currentOffer.btnText}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={3} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right Floating Artwork with Interactive Physics */}
          {!isItemRemoved && (
            <motion.div
              ref={itemRef}
              style={{
                x: itemX,
                y: itemY,
                scaleX: itemScaleX,
                scaleY: itemScaleY,
                rotate: itemRotate,
                z: 35,
              }}
              className="shrink-0 pointer-events-auto cursor-default relative h-36 w-36 sm:h-40 sm:w-40 flex items-center justify-center -mr-2"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentOffer.id}
                  ref={innerItemRef}
                  initial={{ opacity: 0, scale: 0.84, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.84, rotate: 6 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full h-full flex items-center justify-center pointer-events-none"
                >
                  <img
                    src={currentOffer.imageSrc}
                    alt={currentOffer.alt}
                    width={512}
                    height={512}
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] select-none pointer-events-none transition-transform hover:scale-105"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
