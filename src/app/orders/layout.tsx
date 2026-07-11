import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders · Kaivu",
  description: "Track your live order and revisit past Kaivu orders.",
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
