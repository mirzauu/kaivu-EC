"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthModal } from "./AuthModal";
import { Toaster } from "sonner";
import { BottomNav } from "./BottomNav";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { tracker } from "@/lib/tracking/tracker";

import { InstallPrompt } from "./InstallPrompt";

const queryClient = new QueryClient();

// Tracker watcher component to log page views
function TrackingWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    tracker.track("PAGE_VIEW", {
      path: pathname,
      query: searchParams.toString(),
    });
  }, [pathname, searchParams]);

  return null;
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavRoutes = ["/profile/addresses/new"];
  const shouldHideNav = hideNavRoutes.includes(pathname);

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
