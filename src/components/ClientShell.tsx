"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { AuthModal } from "./AuthModal";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();
  const [splashState, setSplashState] = useState<"visible" | "fading" | "hidden">("visible");

  useEffect(() => {
    const timer1 = setTimeout(() => setSplashState("fading"), 1500);
    const timer2 = setTimeout(() => setSplashState("hidden"), 2000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Condition to check if BottomNav should be rendered
  const showNav = pathname !== "/wallet" && pathname !== "/csuite" && !pathname?.startsWith("/csuite/");

  return (
    <QueryClientProvider client={queryClient}>
      {splashState !== "hidden" && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-500 ${
            splashState === "fading" ? "opacity-0" : "opacity-100"
          }`}
        >
          <h1 className="text-6xl font-display font-extrabold text-brand tracking-tight animate-pulse">
            Kaivu
          </h1>
        </div>
      )}
      {children}
      {showNav && <BottomNav />}
      <AuthModal />
    </QueryClientProvider>
  );
}
