import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart · Kaivu",
  description: "Review your Kaivu order and check out.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
