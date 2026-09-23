import type { ReactNode } from "react";
import { StoreStatusAlert } from "./StoreStatusAlert";

export function MobileShell({
  children,
  className = "",
  noPadding = false,
  theme = "dark",
}: {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  theme?: "dark" | "light";
}) {
  const bgClass = theme === "light" ? "bg-[#FFF8F0] text-[#1A1A1A]" : "bg-background";
  return (
    <div className={`min-h-screen ${bgClass} ${className}`}>
      <main className={`mx-auto max-w-md ${noPadding ? "" : "pb-28"} ${bgClass} ${className}`}>
        <StoreStatusAlert />
        {children}
      </main>
    </div>
  );
}
