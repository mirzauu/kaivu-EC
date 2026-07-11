import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu · Kaivu",
  description: "Browse the full Kaivu menu — smashed burgers, hand-cut fries, shakes and combos.",
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
