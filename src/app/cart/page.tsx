"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { MobileShell } from "@/components/MobileShell";
import { cart, useCart, getPaidSubtotal, getFreeDrinkItem, getAmountNeededForFreeDrink } from "@/lib/cart-store";
import { ordersStore } from "@/lib/orders-store";
import { auth, useAuth } from "@/lib/auth-store";
import { usePublicSettings } from "@/lib/public-settings-store";
import { getImageUrl } from "@/lib/utils";

import { Minus, Plus, Trash2, ShoppingBag, Coins, Loader2, ChevronDown, Banknote, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const items = useCart((s) => s.items);
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const rewardSectionEnabled = usePublicSettings((s) => s.rewardSectionEnabled);
  const storeStatus = usePublicSettings((s) => s.storeStatus);
  const isStoreClosed = !storeStatus?.isOpen;
  
  const freeDrinkItem = getFreeDrinkItem(items);
  const amountNeededForFreeDrink = getAmountNeededForFreeDrink(items, 400);

  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
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

  type DisplayRow = {
    rowId: string;
    originalItemId: string;
    name: string;
    price: number;
    image: string;
    isFree: boolean;
    pairedRowId?: string;
  };

  // Expand all items into individual units for separate row display
  type Unit = { unitId: string; itemId: string; name: string; price: number; image: string; category?: string };
  const allUnits: Unit[] = [];
  items.forEach((item) => {
    for (let k = 0; k < item.qty; k++) {
      allUnits.push({
        unitId: `${item.id}-${k}`,
        itemId: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
      });
    }
  });

  const displayRows: DisplayRow[] = allUnits.map(u => ({
    rowId: u.unitId,
    originalItemId: u.itemId,
    name: u.name,
    price: u.price,
    image: u.image,
    isFree: false,
  }));

  const handleDeleteRow = (row: DisplayRow) => {
    const cartItem = items.find((i) => i.id === row.originalItemId);
    if (cartItem) {
      const newQty = cartItem.qty - 1;
      if (newQty <= 0) {
        cart.remove(row.originalItemId);
      } else {
        cart.setQty(row.originalItemId, newQty);
      }
    }
  };

  const rawSubtotal = displayRows.reduce((sum, r) => sum + r.price, 0);
  const subtotal = rawSubtotal;
  const delivery = 0;

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

    if (freeDrinkItem && amountNeededForFreeDrink > 0) {
      alert(`Add ₹${amountNeededForFreeDrink} more worth of items to unlock your free drink (${freeDrinkItem.name.replace(" (Free)", "")}) with this order!`);
      return;
    }

    if (!user) {
      auth.openModal();
      return;
    }

    const addr = user?.addresses?.find((a) => a.id === selectedAddressId) || user?.addresses?.[0];
    const deliveryAddress = addr?.fullAddress || "";
    let deliveryLat: number | undefined;
    let deliveryLng: number | undefined;

    if (addr?.lat !== null && addr?.lat !== undefined && addr?.lng !== null && addr?.lng !== undefined) {
      deliveryLat = Number(addr.lat);
      deliveryLng = Number(addr.lng);
    }
    
    if (!deliveryAddress.trim()) {
      alert("Please add a delivery address to place your order.");
      router.push("/profile/addresses/new?redirect=/cart");
      return;
    }

    if (deliveryLat === undefined || deliveryLng === undefined || isNaN(deliveryLat) || isNaN(deliveryLng)) {
      alert("Your selected delivery address is missing GPS coordinates. Please add a GPS-verified address to place your order.");
      router.push("/profile/addresses/new?redirect=/cart");
      return;
    }
    
    setCheckingOut(true);
    
    try {
      const orderId = await ordersStore.addOrder({
        deliveryAddress,
        deliveryLat,
        deliveryLng,
        paymentMethod: "COD",
        redeemCoins: coinsRedeemedCount,
      });

      if (orderId) {
        setRedeemCoins(false);
        await cart.clear();
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
          {/* Free Drink Threshold Banner */}
          {freeDrinkItem && (
            <div className="mx-5 mt-4">
              {amountNeededForFreeDrink > 0 ? (
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-amber-900 flex items-center gap-3 shadow-xs">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-extrabold text-amber-950">Add ₹{amountNeededForFreeDrink} more to get free drink</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">Order paid items must reach ₹400+ to claim your free {freeDrinkItem.name.replace(" (Free)", "")}.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-emerald-900 flex items-center gap-3 shadow-xs">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="text-xs">
                    <p className="font-extrabold text-emerald-950">Free Drink Unlocked! (₹0)</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Your order total is ₹400+. Enjoy your free {freeDrinkItem.name.replace(" (Free)", "")} with your order!</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <ul className="space-y-3 px-5 pt-5">
            {displayRows.map((row) => (
              <li key={row.rowId}>
                <article className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl p-3 shadow-sm border ${
                  row.isFree ? "bg-emerald-50/40 border-emerald-200" : "bg-surface border-border"
                }`}>
                  <img
                    src={getImageUrl(row.image)}
                    alt={row.name}
                    loading="lazy"
                    width={768}
                    height={768}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="truncate text-sm font-bold">{row.name}</h4>
                    </div>

                    <div className="mt-0.5">
                      <span className="text-sm font-bold text-brand">
                        ₹{row.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRow(row)}
                    aria-label={`Remove ${row.name}`}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </article>
              </li>
            ))}
          </ul>

          {/* Delivery Address Section (Saved Addresses / GPS Only) */}
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
              <div className="space-y-2">
                <div className="relative">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-border bg-surface p-3 pr-10 text-sm font-semibold focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                  >
                    {user.addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.lat != null && addr.lng != null ? "📍 " : "⚠️ "}{addr.label} {addr.name ? `(${addr.name})` : ""} - {addr.fullAddress}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>

                {(() => {
                  const activeAddr = user.addresses.find((a) => a.id === selectedAddressId) || user.addresses[0];
                  return activeAddr?.lat != null && activeAddr?.lng != null ? (
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>GPS location verified for direct delivery</span>
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Address missing GPS. Please click '+ Add New' above.</span>
                    </p>
                  );
                })()}
              </div>
            ) : (
              <div>
                {user ? (
                  <button
                    type="button"
                    onClick={() => router.push("/profile/addresses/new?redirect=/cart")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand/10 border border-brand/20 py-3.5 text-sm font-bold text-brand transition-colors hover:bg-brand/15 cursor-pointer"
                  >
                    + Add Delivery Address
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => auth.openModal()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand/10 border border-brand/20 py-3.5 text-sm font-bold text-brand transition-colors hover:bg-brand/15 cursor-pointer"
                  >
                    Log in to select delivery address
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Kaivu Coins Rewards Section */}
          {rewardSectionEnabled && user && user.kaivuCoins > 0 && (
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

          {/* Payment Method Section (Cash on Delivery Only - Collapsible, Collapsed by Default) */}
          <section className="mx-5 mt-4 rounded-3xl bg-surface p-5 shadow-sm border border-border">
            {/* Collapsible Header Row */}
            <button
              type="button"
              onClick={() => setIsPaymentOpen(!isPaymentOpen)}
              className="flex w-full items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Payment Method</h3>
                <motion.div
                  animate={{ rotate: isPaymentOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </div>

              {/* Status indicator on header */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-brand">Cash on Delivery</span>
              </div>
            </button>

            {/* Collapsible Details */}
            <AnimatePresence>
              {isPaymentOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-brand/5 border border-brand/20">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-brand-foreground shadow-xs">
                          <Banknote className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-foreground">Cash on Delivery (COD)</h4>
                            <span className="rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2">
                              Active
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Pay with cash or UPI at your doorstep
                          </p>
                        </div>
                      </div>

                      {/* Locked default radio circle */}
                      <div className="relative flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full border-2 border-brand flex items-center justify-center bg-brand">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="mx-5 mt-4 rounded-3xl bg-surface p-5 shadow-sm border border-border">
            {/* Collapsible Header Row with Title + Chevron on left, and OUTSIDE TOTAL on right */}
            <button
              type="button"
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="flex w-full items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Order Summary</h3>
                <motion.div
                  animate={{ rotate: isSummaryOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </div>

              {/* Total displayed OUTSIDE on header row */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground font-semibold">Total:</span>
                <span className="text-base font-extrabold text-brand">₹{total.toFixed(2)}</span>
              </div>
            </button>

            {/* Collapsible Breakdown Details */}
            <AnimatePresence>
              {isSummaryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <dl className="mt-4 space-y-2 text-sm border-t border-border/60 pt-3">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Item Total</dt>
                      <dd className="font-semibold">₹{rawSubtotal.toFixed(2)}</dd>
                    </div>


                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</dd>
                    </div>

                    <div className="flex justify-between items-center">
                      <dt className="text-muted-foreground">Delivery Fee</dt>
                      <dd className="flex items-center gap-1.5 font-semibold">
                        <span className="line-through text-muted-foreground text-xs">₹40.00</span>
                        <span className="font-extrabold text-emerald-600">FREE</span>
                      </dd>
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
                      <dt className="font-bold">Grand Total</dt>
                      <dd className="font-bold text-brand">₹{total.toFixed(2)}</dd>
                    </div>
                  </dl>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleCheckout}
              disabled={checkingOut || isStoreClosed}
              className={`mt-4 grid w-full place-items-center rounded-full py-3.5 text-sm font-bold transition-all shadow-md ${
                isStoreClosed
                  ? "bg-muted text-muted-foreground cursor-not-allowed opacity-80"
                  : "bg-brand text-brand-foreground active:scale-[0.98] cursor-pointer disabled:opacity-70"
              }`}
            >
              {checkingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isStoreClosed ? (
                "Store is Closed for Orders"
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
