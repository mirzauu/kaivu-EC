"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MenuPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-[#FFF8E7] gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-[#66101F]" />
      <p className="text-xs font-semibold text-[#888888] font-display uppercase tracking-wider">
        Redirecting to Home...
      </p>
    </div>
  );
}
