"use client";

import { useOrders } from "@/lib/orders-store";
import { MobileShell } from "@/components/MobileShell";
import { getImageUrl } from "@/lib/utils";
import { ArrowLeft, Clock, MapPin, Package, Receipt, Coins, Store, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orders = useOrders((s) => s.orders);
  const order = orders.find((o) => o.id === id || o.dbId === id);

  if (!order) {
    return (
      <MobileShell>
        <div className="flex items-center gap-3 p-5 pt-8">
          <Link href="/orders" className="grid h-10 w-10 place-items-center rounded-full bg-surface">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Order Not Found</h1>
        </div>
      </MobileShell>
    );
  }

  const isCancelled = order.status === "cancelled";
  const isPickup = order.orderType === "PICKUP";

  return (
    <MobileShell>
      <header className="flex items-center gap-3 p-5 pt-8">
        <Link href="/orders" className="grid h-10 w-10 place-items-center rounded-full bg-surface hover:bg-surface/80 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Order Details</h1>
            {isPickup && (
              <span className="rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">
                Store Pickup
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{order.id} · {order.date}</p>
        </div>
      </header>

      <div className="px-5 pb-10 space-y-6 mt-4">
        <section className="overflow-hidden rounded-3xl bg-surface p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={getImageUrl(order.image)}
              alt={order.item}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover"
            />
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex justify-between items-start gap-2">
                <h2 className="text-base font-bold leading-tight">{order.item}</h2>
              </div>
              <p className="text-sm font-bold mt-2">
                ₹{(order.subtotal ?? (order.price + (order.discount || 0))).toFixed(2)}
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isCancelled
                    ? "bg-destructive/10 text-destructive"
                    : order.stage === 2 && isPickup
                    ? "bg-emerald-500/15 text-emerald-700 animate-pulse font-extrabold"
                    : "bg-brand/10 text-brand"
                }`}>
                  {order.stage === 2 && isPickup ? "READY FOR PICKUP" : order.status}
                </span>
                {!isCancelled && order.status === "active" && (
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    ETA {order.eta}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Fulfillment Spot / Delivery Address Section */}
        {isPickup ? (
          <section className="space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Store className="h-4 w-4 text-brand" />
              Pickup Location
            </h3>
            <div className="rounded-2xl bg-surface p-4 shadow-sm space-y-3">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {order.pickupSpotName || "Kaivu Shop Counter"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {order.pickupSpotAddress || order.deliveryAddress}
                </p>
              </div>

              {order.deliveryLat && order.deliveryLng && (
                <div className="space-y-2 pt-1">
                  <div className="overflow-hidden rounded-xl border border-border h-36 w-full">
                    <iframe
                      title="Kaivu Pickup Spot Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}&hl=en&z=15&output=embed`}
                    />
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${order.deliveryLat},${order.deliveryLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent/80 py-2.5 text-xs font-bold text-foreground transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-brand" />
                    <span>Open in Google Maps / Get Directions</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </div>
              )}
            </div>
          </section>
        ) : order.deliveryAddress ? (
          <section className="space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand" />
              Delivery Address
            </h3>
            <div className="rounded-2xl bg-surface p-4 shadow-sm">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {order.deliveryAddress}
              </p>
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-brand" />
            Order Summary
          </h3>
          <div className="rounded-2xl bg-surface p-4 shadow-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Items Total</span>
              <span className="font-medium">
                ₹{(order.subtotal ?? (order.price + (order.discount || 0))).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="font-medium">
                {order.deliveryFee && order.deliveryFee > 0 ? `₹${order.deliveryFee.toFixed(2)}` : "Free"}
              </span>
            </div>
            {(order.discount || 0) > 0 && (
              <div className="flex justify-between text-sm text-brand font-semibold">
                <span className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" />
                  Kaivu Coins Discount {order.coinsRedeemed ? `(${order.coinsRedeemed} coins)` : ""}
                </span>
                <span>-₹{order.discount!.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-border/50 pt-3 flex justify-between text-base font-bold">
              <span>Total Paid</span>
              <span className="text-brand font-extrabold">₹{order.price.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
