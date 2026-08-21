import { useSyncExternalStore } from "react";
import { auth } from "./auth-store";

export type CartItem = {
  id: string; // maps to menuItemId for frontend compatibility
  name: string;
  price: number;
  image: string;
  qty: number;
  category?: string;
};

type State = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CART_STORAGE_KEY = "kaivu_cart";

export function isBurgerItem(item: { name?: string; category?: string }) {
  if (item.category) {
    const cat = item.category.toLowerCase();
    if (cat === "burgers" || cat === "loaded") return true;
  }
  const name = item.name?.toLowerCase() || "";
  return (
    name.includes("burger") ||
    name.includes("smash") ||
    name.includes("cluck") ||
    name.includes("shroom") ||
    name.includes("rooster") ||
    name.includes("loaded")
  );
}

export function getBogoInfo(items: CartItem[], userOrderCount?: number) {
  // Rule 1: BOGO applies ONLY on 1st order! (If user has placed orders before, BOGO is disabled)
  const isFirstOrder = userOrderCount === undefined || userOrderCount === 0;

  if (!isFirstOrder) {
    return {
      freeUnitItemIds: new Map<string, number>(),
      pairedFreeMap: new Map<string, string>(),
      isEligible: false,
    };
  }

  // Rule 3: Only BURGER items participate in BOGO pairing!
  type Unit = { id: string; itemId: string; price: number; name: string };
  const burgerUnits: Unit[] = [];

  items.forEach((item) => {
    if (isBurgerItem(item)) {
      const qty = item.qty || 1;
      for (let k = 0; k < qty; k++) {
        burgerUnits.push({
          id: `${item.id}-${k}`,
          itemId: item.id,
          price: item.price || 0,
          name: item.name,
        });
      }
    }
  });

  burgerUnits.sort((a, b) => b.price - a.price);

  const freeUnitItemIds = new Map<string, number>();
  const pairedFreeMap = new Map<string, string>();

  for (let i = 0; i < burgerUnits.length - 1; i += 2) {
    const paidUnit = burgerUnits[i];
    const freeUnit = burgerUnits[i + 1];
    freeUnitItemIds.set(freeUnit.itemId, (freeUnitItemIds.get(freeUnit.itemId) || 0) + 1);
    pairedFreeMap.set(paidUnit.itemId, freeUnit.itemId);
  }

  return { freeUnitItemIds, pairedFreeMap, isEligible: true };
}

function getInitialState(): State {
  if (typeof window === "undefined") {
    return { items: [], subtotal: 0, itemCount: 0, isLoading: false };
  }
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const items: CartItem[] = JSON.parse(raw);
      if (Array.isArray(items)) {
        const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
        const itemCount = items.reduce((sum, i) => sum + (i.qty || 1), 0);
        return { items, subtotal, itemCount, isLoading: false };
      }
    }
  } catch {
    // ignore
  }
  return { items: [], subtotal: 0, itemCount: 0, isLoading: false };
}

let state: State = getInitialState();

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setAndPersistItems(items: CartItem[], isLoading = false) {
  const rawSubtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
  const userOrderCount = auth.getState().user?.orderCount;
  const { freeUnitItemIds } = getBogoInfo(items, userOrderCount);

  let bogoDiscount = 0;
  items.forEach((i) => {
    const freeQty = freeUnitItemIds.get(i.id) || 0;
    bogoDiscount += freeQty * (i.price || 0);
  });

  const subtotal = rawSubtotal - bogoDiscount;
  const itemCount = items.reduce((sum, i) => sum + (i.qty || 1), 0);
  state = { items, subtotal, itemCount, isLoading };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
  emit();
}

/**
 * Loads the cart items (from DB if authenticated, or from local storage if guest).
 */
async function loadCart() {
  const isAuth = typeof window !== "undefined" && auth.getState().isAuthenticated;

  if (!isAuth) {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
          const items: CartItem[] = JSON.parse(raw);
          if (Array.isArray(items)) {
            setAndPersistItems(items, false);
            return;
          }
        }
      } catch {
        // ignore
      }
    }
    setAndPersistItems([], false);
    return;
  }

  try {
    state = { ...state, isLoading: true };
    emit();

    const res = await fetch("/api/cart");
    const data = await res.json();

    if (data.success && data.data) {
      const items = data.data.items.map((item: any) => ({
        id: item.menuItemId,
        name: item.name,
        price: item.price,
        image: item.imageUrl,
        qty: item.quantity,
      }));

      setAndPersistItems(items, false);
    } else {
      state = { ...state, isLoading: false };
      emit();
    }
  } catch {
    state = { ...state, isLoading: false };
    emit();
  }
}

// Watch authentication changes to sync/reload cart
if (typeof window !== "undefined") {
  let wasAuthenticated = auth.getState().isAuthenticated;

  auth.subscribe(async () => {
    const isAuth = auth.getState().isAuthenticated;
    if (isAuth && !wasAuthenticated) {
      wasAuthenticated = true;
      // If there were items stored locally as a guest, sync them to the database
      const guestItems = [...state.items];
      if (guestItems.length > 0) {
        try {
          await Promise.allSettled(
            guestItems.map((item) =>
              fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ menuItemId: item.id, quantity: item.qty }),
              })
            )
          );
        } catch {
          // ignore
        }
      }
      await loadCart();
    } else if (!isAuth && wasAuthenticated) {
      wasAuthenticated = false;
      // Logged out, clear cart
      setAndPersistItems([]);
    }
  });

  // Initial load check
  setTimeout(() => {
    if (auth.getState().isAuthenticated) {
      loadCart();
      wasAuthenticated = true;
    }
  }, 100);
}

export const cart = {
  /**
   * Refreshes the cart.
   */
  async refresh() {
    await loadCart();
  },

  /**
   * Add item to cart (local first + DB if authenticated).
   */
  async add(item: Omit<CartItem, "qty">) {
    // Add haptic feedback
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    // Add tracking event
    try {
      const { tracker } = await import("@/lib/tracking/tracker");
      tracker.track("ADD_TO_CART", { itemId: item.id, price: item.price, name: item.name });
    } catch (e) {
      console.error("Tracking failed", e);
    }

    // Optimistic local update
    const existingIndex = state.items.findIndex((i) => i.id === item.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = state.items.map((i, idx) =>
        idx === existingIndex ? { ...i, qty: i.qty + 1 } : i
      );
    } else {
      updated = [...state.items, { ...item, qty: 1 }];
    }
    setAndPersistItems(updated);

    // Sync with server if authenticated
    if (typeof window !== "undefined" && auth.getState().isAuthenticated) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ menuItemId: item.id, quantity: 1 }),
        });
      } catch (e) {
        console.error("Failed to sync add to cart", e);
      }
    }
  },

  /**
   * Remove item from cart (and its paired BOGO free item if applicable).
   */
  async remove(id: string) {
    // Add tracking event
    try {
      const { tracker } = await import("@/lib/tracking/tracker");
      tracker.track("REMOVE_FROM_CART", { itemId: id });
    } catch (e) {
      console.error("Tracking failed", e);
    }

    const { pairedFreeMap } = getBogoInfo(state.items);
    const pairedFreeId = pairedFreeMap.get(id);

    // Optimistic local update: remove item and its paired free item if distinct
    let updated = state.items.filter((i) => i.id !== id);
    if (pairedFreeId && pairedFreeId !== id) {
      updated = updated.filter((i) => i.id !== pairedFreeId);
    }
    setAndPersistItems(updated);

    // Sync with server if authenticated
    if (typeof window !== "undefined" && auth.getState().isAuthenticated) {
      try {
        await fetch(`/api/cart/${id}`, {
          method: "DELETE",
        });
        if (pairedFreeId && pairedFreeId !== id) {
          await fetch(`/api/cart/${pairedFreeId}`, {
            method: "DELETE",
          });
        }
      } catch (e) {
        console.error("Failed to sync remove from cart", e);
      }
    }
  },

  /**
   * Set item quantity in cart.
   */
  async setQty(id: string, qty: number) {
    if (qty <= 0) return cart.remove(id);

    // Optimistic local update
    const updated = state.items.map((i) => (i.id === id ? { ...i, qty } : i));
    setAndPersistItems(updated);

    // Sync with server if authenticated
    if (typeof window !== "undefined" && auth.getState().isAuthenticated) {
      try {
        await fetch(`/api/cart/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: qty }),
        });
      } catch (e) {
        console.error("Failed to sync update cart quantity", e);
      }
    }
  },

  /**
   * Clear the cart.
   */
  async clear() {
    setAndPersistItems([]);

    if (typeof window !== "undefined" && auth.getState().isAuthenticated) {
      try {
        await fetch("/api/cart", {
          method: "DELETE",
        });
      } catch (e) {
        console.error("Failed to sync clear cart", e);
      }
    }
  },
};

export function useCart<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state)
  );
}
