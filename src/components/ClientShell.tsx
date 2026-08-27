"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthModal } from "./AuthModal";
import { Toaster } from "sonner";
import { BottomNav } from "./BottomNav";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { tracker } from "@/lib/tracking/tracker";
import { trackNewVisitor } from "@/lib/tracking/visitor-tracker";
import { LocationPermissionModal } from "./LocationPermissionModal";
import { InstallPrompt } from "./InstallPrompt";
import { FlyToCartProvider } from "./FlyToCartProvider";
import { KaivuLoadingScreen } from "./KaivuLoadingScreen";
import { AnimatePresence, motion } from "framer-motion";

import { NotificationBannerManager } from "./banners/NotificationBannerManager";

const queryClient = new QueryClient();

// Tracker watcher component to log page views & detect first-time visitors
function TrackingWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Zero-latency first-time visitor check & background alert
    trackNewVisitor(pathname);

    tracker.track("PAGE_VIEW", {
      path: pathname,
      query: searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavRoutes = ["/", "/profile/addresses/new"];
  const shouldHideNav = hideNavRoutes.includes(pathname) || pathname?.startsWith("/csuite");
  
  const isHomePage = pathname === "/";
  const [isInitialLoading, setIsInitialLoading] = useState(isHomePage);

  useEffect(() => {
    if (!isHomePage) return;
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [isHomePage]);

  return (
    <QueryClientProvider client={queryClient}>
      <FlyToCartProvider>
        <AnimatePresence>
          {isHomePage && isInitialLoading && (
            <motion.div
              key="reload-splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="fixed inset-0 z-[9999]"
            >
              <KaivuLoadingScreen fullScreen={true} />
            </motion.div>
          )}
        </AnimatePresence>
        <Suspense fallback={null}>
          <TrackingWatcher />
        </Suspense>
        <Toaster position="top-center" />
        {children}
        {!shouldHideNav && <BottomNav />}
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
        <InstallPrompt />
        <LocationPermissionModal />
        <NotificationBannerManager />
      </FlyToCartProvider>
    </QueryClientProvider>
  );
}

