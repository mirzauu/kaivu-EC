"use client";

import { MapPin, CreditCard, Heart, Settings, HelpCircle, LogOut, ChevronRight, Award } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";

const groups = [
  {
    title: "Account",
    items: [
      { Icon: MapPin, label: "Addresses", hint: "2 saved" },
      { Icon: CreditCard, label: "Payment methods", hint: "Visa · 4242" },
      { Icon: Heart, label: "Favorites", hint: "8 items" },
    ],
  },
  {
    title: "More",
    items: [
      { Icon: Settings, label: "Settings", hint: "" },
      { Icon: HelpCircle, label: "Help & support", hint: "" },
      { Icon: LogOut, label: "Log out", hint: "", destructive: true as const },
    ],
  },
];

export default function Profile() {
  return (
    <MobileShell>
      <header className="px-5 pt-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </header>

      {/* Identity card */}
      <section className="px-5 pt-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl bg-surface p-4 shadow-sm">
          <div
            aria-hidden
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-xl font-bold text-brand-foreground"
          >
            A
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold">Alex Morgan</h2>
            <p className="truncate text-xs text-muted-foreground">alex@kaivu.app · +1 (555) 010-2210</p>
          </div>
        </div>
      </section>

      {/* Rewards */}
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

      {/* Menu groups */}
      {groups.map((g) => (
        <section key={g.title} className="px-5 pt-6">
          <h3 className="px-1 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {g.title}
          </h3>
          <ul className="divide-y divide-border overflow-hidden rounded-3xl bg-surface shadow-sm">
            {g.items.map(({ Icon, label, hint, destructive }) => (
              <li key={label}>
                <button className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                    style={{
                      background: destructive ? "color-mix(in oklch, var(--color-destructive) 14%, transparent)" : "var(--color-accent)",
                      color: destructive ? "var(--color-destructive)" : "var(--color-foreground)",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span
                      className="block truncate text-sm font-semibold"
                      style={{ color: destructive ? "var(--color-destructive)" : "var(--color-foreground)" }}
                    >
                      {label}
                    </span>
                    {hint && <span className="block truncate text-[11px] text-muted-foreground">{hint}</span>}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="px-5 pt-6 text-center text-[11px] text-muted-foreground">Kaivu · v1.0.0</p>
    </MobileShell>
  );
}
