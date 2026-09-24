import type { Metadata } from "next";

import { AdminGuard } from "./AdminGuard";

export const metadata: Metadata = {
  title: "Kaivu C-Suite · Admin Console",
  description: "Kaivu C-Suite admin console for managing orders, products, and analytics.",
};

export default function CSuiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[oklch(0.18_0.02_50)] min-h-screen">
      <AdminGuard>{children}</AdminGuard>
    </div>
  );
}
