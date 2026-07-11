import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rewards · Kaivu",
  description: "View your rewards and points.",
};

export default function RewardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
