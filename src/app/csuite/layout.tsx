import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kaivu C-Suite · Admin Console",
  description: "Kaivu C-Suite admin console for managing orders, products, and analytics.",
};

export default function CSuiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
