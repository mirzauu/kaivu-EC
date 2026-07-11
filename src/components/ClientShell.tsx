"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { AuthModal } from "./AuthModal";

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const pathname = usePathname();

  // Condition to check if BottomNav should be rendered
  const showNav = pathname !== "/wallet" && pathname !== "/csuite" && !pathname?.startsWith("/csuite/");

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {showNav && <BottomNav />}
      <AuthModal />
    </QueryClientProvider>
  );
}
