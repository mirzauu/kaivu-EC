import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kaivu Credits · Kaivu",
  description: "View your Kaivu Credits balance and transactions.",
};

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  return children;
}
