"use client";

import { motion } from "framer-motion";
import { KaivuAnimatedLogo } from "./KaivuAnimatedLogo";

interface KaivuLoadingScreenProps {
  fullScreen?: boolean;
}

export function KaivuLoadingScreen({ fullScreen = true }: KaivuLoadingScreenProps) {
  return (
    <div
      className={`${
        fullScreen ? "fixed inset-0 z-[9999]" : "w-full h-full min-h-[300px]"
      } flex items-center justify-center bg-white px-6 text-center select-none overflow-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <KaivuAnimatedLogo />
      </motion.div>
    </div>
  );
}

