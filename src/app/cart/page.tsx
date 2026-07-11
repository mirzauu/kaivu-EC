"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { cart, useCart } from "@/lib/cart-store";
import { ordersStore } from "@/lib/orders-store";
import { getImageUrl } from "@/lib/utils";

export default function Cart() {
  const items = useCart((s) => s.items);
  const router = useRouter();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = items.length ? 1.99 : 0;
  const total = subtotal + delivery;

  const handleCheckout = () => {
    if (items.length === 0) return;
    ordersStore.addOrder(items);
    cart.clear();
    router.push("/orders");
  };

  return (
    <MobileShell>
      <header className="px-5 pt-6">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <p className="text-sm text-muted-foreground">
          {items.length ? `${items.length} item${items.length > 1 ? "s" : ""}` : "Empty for now"}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="mx-5 mt-10 grid place-items-center gap-4 rounded-3xl bg-surface p-10 text-center shadow-sm">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent">
            <ShoppingBag className="h-7 w-7 text-brand" />
          </div>
          <div>
            <p className="text-base font-bold">Your cart is empty</p>
            <p className="mt-1 text-xs text-muted-foreground">Add a burger and we'll get cooking.</p>
          </div>
          <Link
            href="/menu"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3 px-5 pt-5">
            {items.map((i) => (
              <li key={i.id}>
                <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm">
                  <img
                    src={getImageUrl(i.image)}
                    alt={i.name}
                    loading="lazy"
                    width={768}
                    height={768}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold">{i.name}</h4>
                    <span className="text-sm font-bold text-brand">₹{(i.price * i.qty).toFixed(2)}</span>
                    <div className="mt-1.5 inline-flex items-center gap-2 rounded-full bg-accent p-1">
                      <button
                        onClick={() => cart.setQty(i.id, i.qty - 1)}
                        aria-label="Decrease"
                        className="grid h-6 w-6 place-items-center rounded-full bg-surface"
                      >
                        <Minus className="h-3 w-3" strokeWidth={3} />
                      </button>
                      <span className="min-w-4 text-center text-xs font-bold">{i.qty}</span>
                      <button
                        onClick={() => cart.setQty(i.id, i.qty + 1)}
                        aria-label="Increase"
                        className="grid h-6 w-6 place-items-center rounded-full bg-brand text-brand-foreground"
                      >
                        <Plus className="h-3 w-3" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => cart.remove(i.id)}
                    aria-label={`Remove ${i.name}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              </li>
            ))}
          </ul>

          <section className="mx-5 mt-6 rounded-3xl bg-surface p-5 shadow-sm">
            <h3 className="text-sm font-bold">Order summary</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">₹{subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-semibold">₹{delivery.toFixed(2)}</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-bold">₹{total.toFixed(2)}</dd>
              </div>
            </dl>
            <button
              onClick={handleCheckout}
              className="mt-5 grid w-full place-items-center rounded-full bg-brand py-3.5 text-sm font-bold text-brand-foreground"
            >
              Checkout · ₹{total.toFixed(2)}
            </button>
          </section>
        </>
      )}
    </MobileShell>
  );
}
