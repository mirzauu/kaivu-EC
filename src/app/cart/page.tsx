"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { MobileShell } from "@/components/MobileShell";
import { cart, useCart, getPaidSubtotal, getFreeDrinkItem, getAmountNeededForFreeDrink } from "@/lib/cart-store";
import { ordersStore } from "@/lib/orders-store";
import { auth, useAuth } from "@/lib/auth-store";
import { usePublicSettings } from "@/lib/public-settings-store";
import { getImageUrl, calculateDistance } from "@/lib/utils";
import { useMenu } from "@/lib/menu-store";
import { menu as defaultMenu } from "@/lib/menu-data";

import { Minus, Plus, X, ShoppingBag, Coins, Loader2, ChevronDown, Banknote, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const items = useCart((s) => s.items);
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const rewardSectionEnabled = usePublicSettings((s) => s.rewardSectionEnabled);
  const storeStatus = usePublicSettings((s) => s.storeStatus);
  const deliveryConfig = usePublicSettings((s) => s.deliveryConfig);
  const isStoreClosed = !storeStatus?.isOpen;
  
  const storeMenu = useMenu((s) => s.menu);
  const allItems = storeMenu && storeMenu.length > 0 ? storeMenu : defaultMenu;
  const addOns = allItems.filter((item: any) => item.category === "Add-ons" || item.category === "ADD_ONS");

  const freeDrinkItem = getFreeDrinkItem(items);
  const amountNeededForFreeDrink = getAmountNeededForFreeDrink(items, 400);

  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [redeemCoins, setRedeemCoins] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  useEffect(() => {
    if (user?.addresses?.length) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [user]);

  const addr = user?.addresses?.find((a) => a.id === selectedAddressId) || user?.addresses?.[0];
  const deliveryAddress = addr?.fullAddress || "";
  let deliveryLat: number | undefined;
  let deliveryLng: number | undefined;

  if (addr?.lat !== null && addr?.lat !== undefined && addr?.lng !== null && addr?.lng !== undefined) {
    deliveryLat = Number(addr.lat);
    deliveryLng = Number(addr.lng);
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  // Calculate delivery fee
  let delivery = 0;
  let deliveryError = "";

  if (deliveryConfig) {
    const { shopLat, shopLng, maxDeliveryKm, freeDeliveryKm, perKmCharge, freeDeliveryThreshold, globalDeliveryFee } = deliveryConfig;
    
    delivery = subtotal >= freeDeliveryThreshold && freeDeliveryThreshold > 0 ? 0 : globalDeliveryFee;

    if (shopLat !== 0 && shopLng !== 0 && deliveryLat && deliveryLng) {
      const distanceKm = calculateDistance(shopLat, shopLng, deliveryLat, deliveryLng);
      
      if (maxDeliveryKm > 0 && distanceKm > maxDeliveryKm) {
        deliveryError = `Your address is outside our ${maxDeliveryKm}km delivery range.`;
      } else if (subtotal < freeDeliveryThreshold || freeDeliveryThreshold === 0) {
        if (distanceKm <= freeDeliveryKm) {
          delivery = 0;
        } else {
          delivery = (distanceKm - freeDeliveryKm) * perKmCharge;
        }
      }
    }
  }

  // Calculate coin discount if checked: 100 coins = ₹10 off (₹0.10 per coin)
  const maxCoinsToRedeem = user?.kaivuCoins || 0;
  const potentialDiscount = Math.round(maxCoinsToRedeem * 10) / 100;
  // Cap discount at 50% of subtotal
  const maxDiscountAllowed = Math.round(subtotal * 0.5 * 100) / 100;
  const coinDiscount = redeemCoins 
    ? Math.min(potentialDiscount, maxDiscountAllowed) 
    : 0;

  // Calculate coins actually redeemed for this discount
  const coinsRedeemedCount = redeemCoins 
    ? Math.min(maxCoinsToRedeem, Math.ceil((coinDiscount / 0.1) - 0.001)) 
    : 0;

  const total = Math.max(0, Math.round((subtotal + delivery - coinDiscount) * 100) / 100);

  const handleCheckout = async () => {
    if (items.length === 0 || checkingOut) return;

    if (deliveryError) {
      alert(deliveryError);
      return;
    }

    if (freeDrinkItem && amountNeededForFreeDrink > 0) {
      alert(`Add ₹${amountNeededForFreeDrink} more worth of items to unlock your free drink (${freeDrinkItem.name.replace(" (Free)", "")}) with this order!`);
      return;
    }

    if (!user) {
      auth.openModal();
      return;
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
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to place order. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <MobileShell theme="light">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#661E28] font-display uppercase tracking-wide">
          Your Order
        </h1>
        <button
          onClick={() => router.back()}
          className="grid h-9 w-9 place-items-center rounded-full bg-[#1A1A1A] text-[#FFF8E7] hover:bg-[#333] transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </header>

      {items.length === 0 ? (
        <div className="mx-5 mt-10 grid place-items-center gap-4 rounded-3xl bg-white p-10 text-center shadow-sm border border-[#E5DDD0]">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FFF8E7]">
            <ShoppingBag className="h-7 w-7 text-[#661E28]" />
          </div>
          <div>
            <p className="text-base font-bold text-[#1A1A1A] font-display uppercase">Your cart is empty</p>
            <p className="mt-1 text-xs text-[#1A1A1A]/60">Add a burger and we&apos;ll get cooking.</p>
          </div>
          <Link
            href="/menu"
            className="rounded-full bg-[#661E28] px-5 py-2.5 text-sm font-semibold text-[#FFF8E7]"
          >
            Browse the menu
          </Link>
        </div>
      ) : (
        <>
          {/* Free Drink Threshold Banner */}
          {freeDrinkItem && (
            <div className="mx-5 mt-2 mb-3">
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

          {/* Cart Items */}
          <ul className="space-y-0 divide-y divide-[#E5DDD0]">
            {items.map((item) => (
              <li key={item.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    loading="lazy"
                    width={768}
                    height={768}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#1A1A1A]">{item.name}</h4>
                        <p className="text-xs text-[#1A1A1A]/50 mt-0.5">₹{item.price} each</p>
                      </div>
                      <span className="text-base font-bold text-[#1A1A1A] shrink-0">
                        ₹{(item.price * item.qty)}
                      </span>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() => {
                            if (item.qty <= 1) cart.remove(item.id);
                            else cart.setQty(item.id, item.qty - 1);
                          }}
                          className="h-8 w-8 grid place-items-center rounded-l-lg bg-[#661E28] text-[#FFF8E7] text-lg font-bold hover:bg-[#7a2432] transition-colors cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" strokeWidth={3} />
                        </button>
                        <span className="h-8 w-10 grid place-items-center bg-[#FFF8E7] border-y border-[#E5DDD0] text-sm font-bold text-[#1A1A1A]">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => cart.setQty(item.id, item.qty + 1)}
                          className="h-8 w-8 grid place-items-center rounded-r-lg bg-[#661E28] text-[#FFF8E7] text-lg font-bold hover:bg-[#7a2432] transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                        </button>
                      </div>
                      <button
                        onClick={() => cart.remove(item.id)}
                        className="text-xs text-[#1A1A1A]/50 hover:text-[#661E28] transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Delivery Address Section */}
          <section className="mx-5 mt-4 rounded-2xl bg-white p-5 border border-[#E5DDD0]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1A1A1A] font-display uppercase">Delivery Address</h3>
              {user && user.addresses && user.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => router.push("/profile/addresses/new?redirect=/cart")}
                  className="text-xs font-bold text-[#661E28] hover:underline"
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
                    className="w-full appearance-none rounded-xl border border-[#E5DDD0] bg-[#FFF8F0] p-3 pr-10 text-sm font-semibold text-[#1A1A1A] focus:border-[#661E28] focus:outline-none focus:ring-1 focus:ring-[#661E28] cursor-pointer"
                  >
                    {user.addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.lat != null && addr.lng != null ? "📍 " : "⚠️ "}{addr.label} {addr.name ? `(${addr.name})` : ""} - {addr.fullAddress}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#A0937D]">
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
                      <span>Address missing GPS. Please click &apos;+ Add New&apos; above.</span>
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
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#661E28]/10 border border-[#661E28]/20 py-3.5 text-sm font-bold text-[#661E28] transition-colors hover:bg-[#661E28]/15 cursor-pointer"
                  >
                    + Add Delivery Address
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => auth.openModal()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#661E28]/10 border border-[#661E28]/20 py-3.5 text-sm font-bold text-[#661E28] transition-colors hover:bg-[#661E28]/15 cursor-pointer"
                  >
                    Log in to select delivery address
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Kaivu Coins Rewards Section */}
          {user && user.kaivuCoins > 0 ? (
            <section className="mx-5 mt-4 rounded-2xl bg-white p-4 border border-[#661E28]/20">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
                      <span>Use remaining Kaivu Coins</span>
                      <span className="rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5">
                        {user.kaivuCoins} coins
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#1A1A1A]/50 mt-0.5">
                      {redeemCoins
                        ? `Applying ${coinsRedeemedCount} coins for -₹${coinDiscount.toFixed(2)} off`
                        : `Redeem up to ${user.kaivuCoins} coins (save ₹${potentialDiscount.toFixed(2)})`}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={redeemCoins}
                  onChange={(e) => setRedeemCoins(e.target.checked)}
                  className="h-5 w-5 rounded-lg border-gray-300 text-[#661E28] focus:ring-[#661E28] accent-[#661E28] cursor-pointer"
                />
              </label>
            </section>
          ) : !user ? (
            <section className="mx-5 mt-4 rounded-2xl bg-white p-3.5 border border-dashed border-[#E5DDD0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="text-xs text-[#1A1A1A]/60 font-medium">Have Kaivu Coins?</span>
              </div>
              <button
                type="button"
                onClick={() => auth.openModal()}
                className="text-xs font-bold text-[#661E28] hover:underline cursor-pointer"
              >
                Log in to use coins
              </button>
            </section>
          ) : null}

          {/* Payment Method Section */}
          <section className="mx-5 mt-4 rounded-2xl bg-white p-5 border border-[#E5DDD0]">
            <button
              type="button"
              onClick={() => setIsPaymentOpen(!isPaymentOpen)}
              className="flex w-full items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#1A1A1A] font-display uppercase">Payment Method</h3>
                <motion.div
                  animate={{ rotate: isPaymentOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-[#A0937D]" />
                </motion.div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#661E28]">Cash on Delivery</span>
              </div>
            </button>

            <AnimatePresence>
              {isPaymentOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-3 border-t border-[#E5DDD0]">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#661E28]/5 border border-[#661E28]/20">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#661E28] text-[#FFF8E7] shadow-xs">
                          <Banknote className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-[#1A1A1A]">Cash on Delivery (COD)</h4>
                            <span className="rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5">
                              Active
                            </span>
                          </div>
                          <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">
                            Pay with cash or UPI at your doorstep
                          </p>
                        </div>
                      </div>

                      <div className="relative flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full border-2 border-[#661E28] flex items-center justify-center bg-[#661E28]">
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Add-ons Upsell Section */}
          {addOns.length > 0 && (
            <section className="mx-5 mt-6 pt-4 border-t border-[#E5DDD0]">
              <h3 className="text-[13px] font-bold text-[#661E28] mb-3 uppercase font-display tracking-wide">Complete your meal</h3>
              <div className="flex overflow-x-auto gap-3 pb-2 -mx-5 px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {addOns.map(addon => {
                  const cartItem = items.find(i => i.id === addon.id);
                  const qty = cartItem ? cartItem.qty : 0;
                  
                  return (
                    <div key={addon.id} className="min-w-[120px] max-w-[140px] flex-shrink-0 bg-white rounded-xl p-3 shadow-xs border border-black/5 relative flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-[#1A1A1A] line-clamp-2 leading-tight">{addon.name}</h4>
                        {addon.tag && <span className="text-[9px] text-[#A0937D] mt-1 block">{addon.tag}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs font-bold text-[#1A1A1A]">₹{addon.price}</span>
                        {qty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-[#1A1A1A] text-white rounded-full px-1.5 py-0.5">
                            <button onClick={() => cart.remove(addon.id)} className="grid h-4 w-4 place-items-center active:scale-90">
                              <Minus className="h-2.5 w-2.5" />
                            </button>
                            <span className="text-[10px] font-bold">{qty}</span>
                            <button onClick={() => cart.add({ id: addon.id, name: addon.name, price: Number(addon.price), image: "" })} className="grid h-4 w-4 place-items-center active:scale-90">
                              <Plus className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => cart.add({
                              id: addon.id,
                              name: addon.name,
                              price: Number(addon.price),
                              image: ""
                            })}
                            className="grid h-6 w-6 place-items-center rounded-full bg-[#661E28] text-white active:scale-90 transition-transform shadow-xs"
                          >
                            <Plus className="h-3.5 w-3.5 stroke-[3]" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Order Summary / Subtotal */}
          <section className="mx-5 mt-4 pt-4 border-t border-[#E5DDD0]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-[#661E28] font-display uppercase tracking-wide">
                Subtotal
              </h3>
              <span className="text-xl font-bold text-[#1A1A1A]">₹{subtotal}</span>
            </div>

            {coinDiscount > 0 && (
              <div className="flex justify-between text-sm font-semibold text-[#661E28] mb-2">
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" /> Coin Discount ({coinsRedeemedCount} coins)
                </span>
                <span>-₹{coinDiscount.toFixed(2)}</span>
              </div>
            )}

            {delivery > 0 && (
              <div className="flex justify-between text-sm font-semibold text-[#1A1A1A] mb-2">
                <span className="flex items-center gap-1">
                  Delivery Fee
                </span>
                <span>₹{delivery.toFixed(2)}</span>
              </div>
            )}
            
            {delivery === 0 && (
              <div className="flex justify-between text-sm font-semibold text-emerald-600 mb-2">
                <span className="flex items-center gap-1">
                  Delivery Fee
                </span>
                <span>FREE</span>
              </div>
            )}

            {(coinDiscount > 0 || delivery > 0) && (
              <div className="flex justify-between text-base font-bold border-t border-[#E5DDD0] pt-2 mb-2">
                <span className="text-[#1A1A1A]">Grand Total</span>
                <span className="text-[#661E28]">₹{total.toFixed(2)}</span>
              </div>
            )}

            <p className="text-[11px] text-[#1A1A1A]/50 mt-2 leading-relaxed">
              One or more items are priced on confirmation — final total will be shared over WhatsApp.
            </p>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={checkingOut || isStoreClosed || !!deliveryError}
              className={`mt-5 grid w-full place-items-center rounded-full py-4 text-sm font-bold transition-all shadow-md ${
                (isStoreClosed || !!deliveryError)
                  ? "bg-[#E5DDD0] text-[#A0937D] cursor-not-allowed opacity-80"
                  : "bg-[#661E28] text-[#FFF8E7] active:scale-[0.98] cursor-pointer disabled:opacity-70 hover:bg-[#7a2432]"
              }`}
            >
              {checkingOut ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isStoreClosed ? (
                "Store is Closed for Orders"
              ) : deliveryError ? (
                "Address Outside Delivery Range"
              ) : (
                `Checkout · ₹${total.toFixed(2)}`
              )}
            </button>

            {/* Continue browsing */}
            <div className="text-center mt-3 mb-4">
              <Link
                href="/menu"
                className="text-sm font-bold text-[#661E28] hover:underline"
              >
                Continue browsing
              </Link>
            </div>
          </section>
        </>
      )}
    </MobileShell>
  );
}
