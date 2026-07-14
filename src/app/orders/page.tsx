"use client";

import { Package, CheckCircle2, Clock } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useOrders } from "@/lib/orders-store";
import { getImageUrl } from "@/lib/utils";

const stages = ["Confirmed", "Cooking", "On the way", "Delivered"];

export default function Orders() {
  const orders = useOrders((s) => s.orders);
  
  const activeOrders = orders.filter((o) => o.status === "active");
  const pastOrders = orders.filter((o) => o.status === "delivered" || o.status === "cancelled");
  const live = activeOrders[0];

  return (
    <MobileShell>
      <header className="px-5 pt-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">Live tracking & history.</p>
      </header>

      {/* Live order */}
      {live && (
        <section className="px-5 pt-5">
          <div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-sm">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-4">
              <img
                src={getImageUrl(live.image)}
                alt={live.item}
                loading="lazy"
                width={768}
                height={768}
                className="h-14 w-14 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Order {live.id}</p>
                <h3 className="truncate text-sm font-bold">{live.item}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-primary-foreground/70">
                  <Clock className="h-3 w-3" /> ETA {live.eta}
                </p>
              </div>
            </div>
            <div className="relative bg-primary/95 px-4 pb-4 pt-2">
              <div className="relative">
                {/* Inactive line connecting all stages */}
                <div className="absolute top-[12px] left-[12.5%] right-[12.5%] h-0.5 -translate-y-1/2 bg-white/12" />
                
                {/* Active line showing progress */}
                <div 
                  className="absolute top-[12px] left-[12.5%] h-0.5 -translate-y-1/2 bg-brand transition-all duration-500 ease-out" 
                  style={{ width: `${Math.max(0, live.stage) * 25}%` }}
                />

                <ol className="grid grid-cols-4 gap-1">
                  {stages.map((s, idx) => {
                    const done = idx <= live.stage;
                    const current = idx === live.stage;
                    return (
                      <li key={s} className="relative z-10 flex flex-col items-center gap-1.5">
                        <span
                          className="relative grid h-6 w-6 place-items-center rounded-full"
                          style={{
                            background: done ? "var(--color-brand)" : "rgba(255,255,255,0.12)",
                          }}
                        >
                          {/* Live ping animation for the current active step */}
                          {current && (
                            <span className="absolute inset-0 rounded-full bg-brand opacity-75 animate-ping" />
                          )}
                          {done && !current ? (
                            <CheckCircle2 className="relative z-10 h-4 w-4 text-brand-foreground" strokeWidth={2.5} />
                          ) : (
                            <span className="relative z-10 h-2 w-2 rounded-full bg-current opacity-90" />
                          )}
                        </span>
                        <span
                          className="text-[10px] font-semibold"
                          style={{ color: done ? "var(--color-brand-foreground)" : "rgba(255,255,255,0.55)" }}
                        >
                          {s}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* History */}
      <section className="px-5 pt-7">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">Past orders</h3>
          <span className="text-xs text-muted-foreground">{pastOrders.length} total</span>
        </div>
        <ul className="mt-3 space-y-3">
          {pastOrders.map((o) => (
            <li key={o.id}>
              <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm">
                <img
                  src={getImageUrl(o.image)}
                  alt={o.item}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold">{o.item}</h4>
                  <p className="text-[11px] text-muted-foreground">{o.date} · {o.id}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm font-bold">₹{o.price.toFixed(2)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    o.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-brand/10 text-brand"
                  }`}>
                    {o.status}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
        {pastOrders.length === 0 && (
          <div className="mt-6 grid place-items-center gap-2 rounded-3xl bg-surface p-10 text-center">
            <Package className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No past orders yet.</p>
          </div>
        )}
      </section>
    </MobileShell>
  );
}
