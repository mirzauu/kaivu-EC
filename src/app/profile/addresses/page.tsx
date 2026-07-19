"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, MapPin, Trash2, CheckCircle2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth, auth } from "@/lib/auth-store";
import { toast } from "sonner";
import { useState } from "react";

export default function AddressesPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!user) {
    return (
      <MobileShell>
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4 p-5 text-center">
          <p className="text-sm text-muted-foreground">Sign in to view your addresses.</p>
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

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      setDeletingId(id);
      const res = await auth.deleteAddress(id);
      setDeletingId(null);
      if (res.success) {
        toast.success("Address deleted successfully");
      } else {
        toast.error(res.error || "Failed to delete address");
      }
    }
  };

  return (
    <MobileShell>
      {/* Header */}
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 pt-6">
        <button
          onClick={() => router.push("/profile")}
          className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-sm"
          aria-label="Go back to profile"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-center">Saved Addresses</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Address List */}
      <section className="px-5 pt-6 space-y-4">
        {user.addresses && user.addresses.length > 0 ? (
          <ul className="space-y-3">
            {user.addresses.map((addr) => (
              <li
                key={addr.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-4 rounded-3xl bg-surface p-5 shadow-sm border border-transparent hover:border-brand/10 transition-all duration-200"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold truncate">{addr.label}</h3>
                    {addr.isDefault && (
                      <span className="flex items-center gap-0.5 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand uppercase tracking-wider">
                        <CheckCircle2 className="h-3 w-3 inline" /> Default
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-normal">
                    {addr.fullAddress}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                  aria-label={`Delete address ${addr.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-accent text-muted-foreground mb-4">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-bold text-foreground">No saved addresses</h3>
            <p className="mt-1 max-w-[240px] text-xs text-muted-foreground leading-normal">
              You haven't saved any delivery addresses yet. Add one to get started!
            </p>
          </div>
        )}

        {/* Add Address CTA */}
        <div className="pt-2">
          <Link
            href="/profile/addresses/new"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-sm font-bold text-brand-foreground shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} /> Add New Address
          </Link>
        </div>
      </section>
    </MobileShell>
  );
}
