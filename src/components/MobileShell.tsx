import type { ReactNode } from "react";

export function MobileShell({ children, className = "bg-background" }: { children: ReactNode, className?: string }) {
  return (
    <div className={`min-h-screen ${className}`}>
      <main className={`mx-auto max-w-md pb-28 ${className}`}>{children}</main>
    </div>
  );
}
