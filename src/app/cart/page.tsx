"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, Coins, Loader2 } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { cart, useCart } from "@/lib/cart-store";
import { ordersStore } from "@/lib/orders-store";
import { auth, useAuth } from "@/lib/auth-store";
import { getImageUrl } from "@/lib/utils";

export default function Cart() {
  const items = useCart((s) => s.items);
  const router = useRouter();
  const user = useAuth((s) => s.user);
  
  const [redeemCoins, setRedeemCoins] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  useEffect(() => {
    if (user?.addresses?.length) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [user]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = items.length ? 29.0 : 0; // Standard delivery fee ₹29

  // Calculate coin discount if checked: 100 coins = ₹10 off (₹0.10 per coin)
  const maxCoinsToRedeem = user?.kaivuCoins || 0;
  const potentialDiscount = maxCoinsToRedeem * 0.1;
  // Cap discount at 50% of subtotal
  const maxDiscountAllowed = subtotal * 0.5;
  const coinDiscount = redeemCoins 
    ? Math.min(potentialDiscount, maxDiscountAllowed) 
    : 0;

  // Calculate coins actually redeemed for this discount
  const coinsRedeemedCount = redeemCoins 
    ? Math.ceil(coinDiscount / 0.1) 
    : 0;

  const total = Math.max(0, subtotal + delivery - coinDiscount);

  const handleCheckout = async () => {
    if (items.length === 0 || checkingOut) return;
    
    let deliveryAddress = "";
    let deliveryLat: number | undefined;
    let deliveryLng: number | undefined;

    if (selectedAddressId === "new") {
      deliveryAddress = addressInput;
    } else {
      const addr = user?.addresses?.find(a => a.id === selectedAddressId);
      deliveryAddress = addr?.fullAddress || "";
      if (addr?.lat !== null && addr?.lng !== null) {
        deliveryLat = Number(addr?.lat);
        deliveryLng = Number(addr?.lng);
      }
    }
    
    if (!deliveryAddress.trim()) {
      alert("Please provide a delivery address");
      return;
    }
    
    setCheckingOut(true);
    
    try {
      const orderId = await ordersStore.addOrder({
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        paymentMethod: "WALLET",
        redeemCoins: coinsRedeemedCount,
      });

      if (orderId) {
        setRedeemCoins(false);
        router.push("/orders");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOut(false);
    }
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
                        className="grid h-6 w-6 place-items-center rounded-full bg-surface cursor-pointer"
                      >
                        <Minus className="h-3 w-3" strokeWidth={3} />
                      </button>
                      <span className="min-w-4 text-center text-xs font-bold">{i.qty}</span>
                      <button
                        onClick={() => cart.setQty(i.id, i.qty + 1)}
                        aria-label="Increase"
                        className="grid h-6 w-6 place-items-center rounded-full bg-brand text-brand-foreground cursor-pointer"
                      >
                        <Plus className="h-3 w-3" strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => cart.remove(i.id)}
                    aria-label={`Remove ${i.name}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </article>
              </li>
            ))}
          </ul>

          {/* Delivery Address Section */}
          <section className="mx-5 mt-4 rounded-3xl bg-surface p-5 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">Delivery Address</h3>
              {user && user.addresses && user.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => router.push("/profile/addresses/new?redirect=/cart")}
                  className="text-xs font-bold text-brand hover:underline"
                >
                  + Add New
                </button>
              )}
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3 mb-3">
                <div className="relative">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-surface p-3 pr-10 text-sm font-semibold focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    {user.addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.label} {addr.name ? `(${addr.name})` : ""} - {addr.fullAddress}
                      </option>
                    ))}
                    <option value="new">Deliver to another address</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-3">
                {user ? (
                  <button
                    type="button"
                    onClick={() => router.push("/profile/addresses/new?redirect=/cart")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand/10 border border-brand/20 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/15"
                  >
                    + Add Saved Address (GPS Auto-Fill)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => auth.openModal()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand/10 border border-brand/20 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/15"
                  >
                    Log in to save address
                  </button>
                )}

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-4 text-muted-foreground text-[10px] uppercase font-bold tracking-wide">Or type manually</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>
              </div>
            )}
            
            {(selectedAddressId === "new" || !user?.addresses?.length) && (
              <textarea
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter delivery address details manually..."
                rows={2}
                className="w-full rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            )}
          </section>

          {/* Kaivu Coins Rewards Section */}
          {user && user.kaivuCoins > 0 && (
            <section className="mx-5 mt-4 rounded-3xl bg-surface p-4 shadow-sm border border-brand/10">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold">Apply Kaivu Coins</h4>
                    <p className="text-[10px] text-muted-foreground">
                      Balance: {user.kaivuCoins} coins (Save up to ₹{potentialDiscount.toFixed(2)})
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={redeemCoins}
                  onChange={(e) => setRedeemCoins(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-gray-300 text-brand focus:ring-brand accent-brand cursor-pointer"
                />
              </label>
            </section>
          )}

          <section className="mx-5 mt-4 rounded-3xl bg-surface p-5 shadow-sm">
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
              
              {coinDiscount > 0 && (
                <div className="flex justify-between text-brand font-semibold">
                  <dt className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5" /> Coin Discount ({coinsRedeemedCount} coins)
                  </dt>
                  <dd>-₹{coinDiscount.toFixed(2)}</dd>
                </div>
              )}

              <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
                <dt className="font-bold">Total</dt>
                <dd className="font-bold">₹{total.toFixed(2)}</dd>
              </div>
            </dl>
            
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-5 grid w-full place-items-center rounded-full bg-brand py-3.5 text-sm font-bold text-brand-foreground transition-all active:scale-[0.98] cursor-pointer disabled:opacity-70"
            >
              {checkingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `Checkout · ₹${total.toFixed(2)}`
              )}
            </button>
          </section>
        </>
      )}
    </MobileShell>
  );
}
