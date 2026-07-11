import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile · Kaivu",
  description: "Manage your Kaivu addresses, payment methods, favorites and account settings.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
