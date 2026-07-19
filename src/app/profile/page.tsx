"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Heart, Settings, HelpCircle, LogOut, ChevronRight, Award, Loader2, Download, Share, Pencil, Check, X } from "lucide-react";
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
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [loyalty, setLoyalty] = useState({ current: 0, target: 8 });
  const [loading, setLoading] = useState(true);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

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
    } else if (label === "Addresses") {
      router.push("/profile/addresses");
    } else {
      toast.info(`${label} details are coming soon!`);
    }
  };

  const handleInstallApp = async () => {
    const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIOS) {
      toast.info("To install on iOS: tap the Share button below, then 'Add to Home Screen'.", { duration: 5000 });
      return;
    }

    const deferredPrompt = (window as any).deferredPrompt;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        try {
          await fetch("/api/user/pwa-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "installed" }),
          });
          auth.refreshUser();
        } catch (e) {
          console.error(e);
        }
        (window as any).deferredPrompt = null;
        toast.success("App installed successfully!");
      }
    } else {
      toast.info("App is already installed or your browser doesn't support automatic installation.");
    }
  };

  const handleSaveName = async () => {
    if (!editNameValue.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsSavingName(true);
    const res = await auth.updateName(editNameValue);
    setIsSavingName(false);
    if (res.success) {
      toast.success("Name updated successfully!");
      setIsEditingName(false);
    } else {
      toast.error(res.error || "Failed to update name");
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
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={editNameValue}
                  onChange={(e) => setEditNameValue(e.target.value)}
                  className="w-full rounded-md border border-brand/30 bg-background px-2 py-1 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Your Name"
                  autoFocus
                  disabled={isSavingName}
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {isSavingName ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  disabled={isSavingName}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-muted-foreground hover:bg-accent/80 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="truncate text-base font-bold">{user.name || "Kaivu Customer"}</h2>
                <button
                  onClick={() => {
                    setEditNameValue(user.name || "");
                    setIsEditingName(true);
                  }}
                  className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Edit name"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            )}
            <p className="truncate text-xs text-muted-foreground">{user.phone}</p>
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

      {/* Install App Button */}
      <section className="px-5 pt-6">
        <button
          onClick={handleInstallApp}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand/10 border border-brand/20 py-3.5 text-sm font-bold text-brand transition-all hover:bg-brand/15 active:scale-[0.98]"
        >
          <Download className="h-4.5 w-4.5" />
          Install Kaivu App
        </button>
      </section>

      <p className="px-5 pt-6 text-center text-[11px] text-muted-foreground">Kaivu · v1.0.0 · DB connected</p>
    </MobileShell>
  );
}
