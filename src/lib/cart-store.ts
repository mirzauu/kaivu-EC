import { useSyncExternalStore } from "react";
import { auth } from "./auth-store";

export type CartItem = {
  id: string; // maps to menuItemId for frontend compatibility
  name: string;
  price: number;
  image: string;
  qty: number;
};

type State = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  isLoading: boolean;
};

let state: State = {
  items: [],
  subtotal: 0,
  itemCount: 0,
  isLoading: false,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/**
 * Loads the cart items from the database.
 */
async function loadCart() {
  try {
    state = { ...state, isLoading: true };
    emit();

    const res = await fetch("/api/cart");
    const data = await res.json();

    if (data.success && data.data) {
      const items = data.data.items.map((item: any) => ({
        id: item.menuItemId, // use menuItemId as id for frontend pages
        name: item.name,
        price: item.price,
        image: item.imageUrl,
        qty: item.quantity,
      }));

      state = {
        items,
        subtotal: data.data.subtotal,
        itemCount: data.data.itemCount,
        isLoading: false,
      };
    } else {
      state = { ...state, isLoading: false };
    }
  } catch (e) {
    state = { ...state, isLoading: false };
  }
  emit();
}

// Watch authentication changes to reload cart
if (typeof window !== "undefined") {
  let wasAuthenticated = false;

  auth.subscribe(() => {
    const isAuth = auth.getState().isAuthenticated;
    if (isAuth && !wasAuthenticated) {
      loadCart();
      wasAuthenticated = true;
    } else if (!isAuth && wasAuthenticated) {
      // Logged out, clear cart
      state = {
        items: [],
        subtotal: 0,
        itemCount: 0,
        isLoading: false,
      };
      emit();
      wasAuthenticated = false;
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
   * Refreshes the cart from the server.
   */
  async refresh() {
    await loadCart();
  },

  /**
   * Add item to the server-backed cart.
   */
  async add(item: Omit<CartItem, "qty">) {
    // Add tracking event
    try {
      const { tracker } = await import("@/lib/tracking/tracker");
      tracker.track("ADD_TO_CART", { itemId: item.id, price: item.price, name: item.name });
    } catch (e) {
      console.error("Tracking failed", e);
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId: item.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        await loadCart();
      }
    } catch (e) {
      console.error("Failed to add to cart", e);
    }
  },

  /**
   * Remove item from the server-backed cart.
   */
  async remove(id: string) {
    // Add tracking event
    try {
      const { tracker } = await import("@/lib/tracking/tracker");
      tracker.track("REMOVE_FROM_CART", { itemId: id });
    } catch (e) {
      console.error("Tracking failed", e);
    }

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadCart();
      }
    } catch (e) {
      console.error("Failed to remove from cart", e);
    }
  },

  /**
   * Set item quantity in the server-backed cart.
   */
  async setQty(id: string, qty: number) {
    if (qty <= 0) return cart.remove(id);

    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });
      const data = await res.json();
      if (data.success) {
        await loadCart();
      }
    } catch (e) {
      console.error("Failed to update cart quantity", e);
    }
  },

  /**
   * Clear the server-backed cart.
   */
  async clear() {
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadCart();
      }
    } catch (e) {
      console.error("Failed to clear cart", e);
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
