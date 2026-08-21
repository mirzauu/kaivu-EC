import type { ReactNode } from "react";
import { StoreStatusAlert } from "./StoreStatusAlert";

export function MobileShell({ children, className = "bg-background", noPadding = false }: { children: ReactNode, className?: string, noPadding?: boolean }) {
  return (
    <div className={`min-h-screen ${className}`}>
      <main className={`mx-auto max-w-md ${noPadding ? "" : "pb-28"} ${className}`}>
        <StoreStatusAlert />
        {children}
      </main>
    </div>
  );
}

