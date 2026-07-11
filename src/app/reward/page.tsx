"use client";

import Link from "next/link";
import { Award, Gift, Ticket, Wallet, Magnet } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

export default function Reward() {
  return (
    <MobileShell>
      <header className="px-5 pt-6">
        <h1 className="text-2xl font-bold">Rewards</h1>
      </header>
      
      <section className="px-5 pt-4">
        <div className="overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                <Award className="h-3 w-3" /> Kaivu Club
              </p>
              <h3 className="mt-1 text-lg font-bold">1 free burger away</h3>
              <p className="mt-0.5 text-xs text-primary-foreground/70">7 / 8 orders this month</p>
            </div>
            <span className="shrink-0 text-2xl font-bold text-brand">7/8</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-brand" style={{ width: "87.5%" }} />
          </div>
        </div>
      </section>

      {/* Wallet */}
      <section className="px-5 pt-4">
        <Link href="/wallet" className="flex items-center justify-between rounded-3xl bg-surface p-5 shadow-sm transition-transform active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Kaivu Credits</p>
              <h3 className="text-xl font-bold">$12.50</h3>
            </div>
          </div>
          <button className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-sm">
            Top Up
          </button>
        </Link>
      </section>

      {/* Invite and Earn */}
      <section className="px-5 pt-4">
        <button className="w-full flex items-center justify-between rounded-3xl bg-brand/10 p-5 shadow-sm transition-transform active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
              <Magnet className="h-6 w-6" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-brand">Invite & Earn</h3>
              <p className="text-xs font-medium text-brand/80 mt-0.5">Get $5 for every friend</p>
            </div>
          </div>
          <span className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-sm">
            Invite
          </span>
        </button>
      </section>

      <section className="px-5 pt-6">
        <h3 className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Available Rewards
        </h3>
        <ul className="divide-y divide-border overflow-hidden rounded-3xl bg-surface shadow-sm">
          <li>
            <button className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-foreground">
                <Gift className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">Free Fries</span>
                <span className="block truncate text-[11px] text-muted-foreground">Unlock with 500 points</span>
              </span>
            </button>
          </li>
          <li>
            <button className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-foreground">
                <Ticket className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">10% Off Order</span>
                <span className="block truncate text-[11px] text-muted-foreground">Unlock with 1000 points</span>
              </span>
            </button>
          </li>
        </ul>
      </section>
    </MobileShell>
  );
}
