"use client";

import { useEffect, useState } from "react";
import { MapPin, CreditCard, Heart, Settings, HelpCircle, LogOut, ChevronRight, Award, Loader2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth, auth } from "@/lib/auth-store";
import { toast } from "sonner";

const groups = [
  {
    title: "Account",
    items: [
      { Icon: MapPin, label: "Addresses", hint: "Saved delivery points" },
      { Icon: CreditCard, label: "Payment methods", hint: "Kaivu Wallet & Cards" },
      { Icon: Heart, label: "Favorites", hint: "Liked items" },
    ],
  },
  {
    title: "More",
    items: [
      { Icon: Settings, label: "Settings", hint: "" },
      { Icon: HelpCircle, label: "Help & support", hint: "" },
      { Icon: LogOut, label: "Log out", hint: "Clear session", destructive: true as const },
    ],
  },
];

export default function Profile() {
  const user = useAuth((s) => s.user);
  const [loyalty, setLoyalty] = useState({ current: 0, target: 8 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLoyalty() {
      try {
        const res = await fetch("/api/rewards");
        const data = await res.json();
        if (data.success && data.data.loyalty) {
          setLoyalty({
            current: data.data.loyalty.current,
            target: data.data.loyalty.target,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchLoyalty();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleItemClick = (label: string) => {
    if (label === "Log out") {
      auth.logout();
      toast.success("Successfully logged out");
    } else {
      toast.info(`${label} details are coming soon!`);
    }
  };

  if (!user) {
    return (
      <MobileShell>
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4 p-5 text-center">
          <p className="text-sm text-muted-foreground">Sign in to view your profile.</p>
          <button
            onClick={() => auth.openModal()}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground"
          >
            Log In / Sign Up
          </button>
        </div>
      </MobileShell>
    );
  }

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
            {(user.name || "K")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold">{user.name || "Kaivu Customer"}</h2>
            <p className="truncate text-xs text-muted-foreground">{user.email || "No email linked"} · {user.phone}</p>
          </div>
        </div>
      </section>

      {/* Loyalty Progress Card */}
      <section className="px-5 pt-4">
        <div className="overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                <Award className="h-3 w-3" /> Kaivu Club
              </p>
              <h3 className="mt-1 text-lg font-bold">
                {loyalty.current >= loyalty.target ? "Free burger earned! 🍔" : `${loyalty.target - loyalty.current} order away`}
              </h3>
              <p className="mt-0.5 text-xs text-primary-foreground/70">{loyalty.current} / {loyalty.target} orders this month</p>
            </div>
            <span className="shrink-0 text-2xl font-bold text-brand">{loyalty.current}/{loyalty.target}</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full rounded-full bg-brand transition-all duration-500" 
              style={{ width: `${(loyalty.current / loyalty.target) * 100}%` }} 
            />
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
                <button 
                  onClick={() => handleItemClick(label)}
                  className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left cursor-pointer transition-colors hover:bg-accent"
                >
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

      <p className="px-5 pt-6 text-center text-[11px] text-muted-foreground">Kaivu · v1.0.0 · DB connected</p>
    </MobileShell>
  );
}
