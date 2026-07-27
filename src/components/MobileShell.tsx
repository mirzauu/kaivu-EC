import type { ReactNode } from "react";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-md bg-white pb-28 overflow-hidden">{children}</main>
    </div>
  );
}
