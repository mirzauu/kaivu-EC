import { useSyncExternalStore } from "react";
import { auth } from "./auth-store";
import { toast } from "sonner";

export type Order = {
  id: string;
  item: string;
  image: string;
  eta: string;
  stage: number; // 0: Confirmed, 1: Cooking, 2: On the way, 3: Delivered, -1: Cancelled
  price: number;
  date: string;
  status: "active" | "delivered" | "cancelled";
};

type State = {
  orders: Order[];
  isLoading: boolean;
};

let state: State = {
  orders: [],
  isLoading: false,
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((cb) => cb());
}

/**
 * Programmatically play a premium notification chime (two-note sine wave with exponential decay)
 * utilizing the browser's Web Audio API so it runs offline and requires zero audio assets.
 */
function playNotificationSound() {
  if (typeof window === "undefined") return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Note 1 (G5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(784, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Note 2 (C6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1046.5, now + 0.12);
    gain2.gain.setValueAtTime(0.08, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc1.start(now);
    osc1.stop(now + 0.35);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.error("Audio context playback failed", e);
  }
}

function triggerOnTheWayNotification(order: Order) {
  playNotificationSound();
  toast.success(`Order ${order.id} is on the way!`, {
    description: `Your delivery partner has picked up your order. ETA: ${order.eta}`,
    duration: 6000,
  });
}

/**
 * Format a status & stage for the UI.
 */
function mapStatusAndStage(status: string): { status: "active" | "delivered" | "cancelled"; stage: number; eta: string } {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
      return { status: "active", stage: 0, eta: "25 min" };
    case "COOKING":
      return { status: "active", stage: 1, eta: "15 min" };
    case "ON_THE_WAY":
      return { status: "active", stage: 2, eta: "5 min" };
    case "DELIVERED":
      return { status: "delivered", stage: 3, eta: "0 min" };
    case "CANCELLED":
    default:
      return { status: "cancelled", stage: -1, eta: "0 min" };
  }
}

/**
 * Formats a Date object or string to "Today · 7:30 PM" style
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  
  const timeString = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (date.toDateString() === now.toDateString()) {
    return `Today · ${timeString}`;
  }
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday · ${timeString}`;
  }

  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${date.toLocaleDateString("en-US", options)} · ${timeString}`;
}

/**
 * Loads orders from the backend database.
 */
async function loadOrders() {
  try {
    state = { ...state, isLoading: true };
    emit();

    const res = await fetch("/api/orders");
    const data = await res.json();

    if (data.success && data.data?.orders) {
      const mappedOrders: Order[] = data.data.orders.map((order: any) => {
        const { status, stage, eta } = mapStatusAndStage(order.status);
        
        // Find first item's image URL or use fallback
        const firstItem = order.items?.[0];
        const imageUrl = firstItem?.menuItem?.imageUrl || "/images/menu/burger-classic.jpg";
        
        return {
          id: order.orderNumber, // Use Order number as ID for display (KV-XXXX)
          dbId: order.id,        // Cache database UUID
          item: order.items.map((i: any) => `${i.itemName}${i.quantity > 1 ? ` × ${i.quantity}` : ""}`).join(" + "),
          image: imageUrl,
          eta,
          stage,
          price: order.total,
          date: formatDate(order.createdAt),
          status,
        };
      });

      // Track transitions to check if order went to "On the way" (stage 2)
      if (state.orders.length > 0) {
        mappedOrders.forEach((newOrder) => {
          const oldOrder = state.orders.find((o) => o.id === newOrder.id);
          if (oldOrder && oldOrder.stage < 2 && newOrder.stage === 2) {
            triggerOnTheWayNotification(newOrder);
          }
        });
      }

      state = {
        orders: mappedOrders,
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

// Watch authentication changes to reload orders
if (typeof window !== "undefined") {
  auth.subscribe(() => {
    setTimeout(() => {
      const isUserAuthenticated = auth.getState().isAuthenticated;
      if (isUserAuthenticated) {
        loadOrders();
      } else {
        state = { orders: [], isLoading: false };
        emit();
      }
    }, 100);
  });

  // Initial load check
  setTimeout(() => {
    if (auth.getState().isAuthenticated) {
      loadOrders();
    }
  }, 300);

  // Poll for realtime updates
  setInterval(() => {
    if (auth.getState().isAuthenticated) {
      loadOrders();
    }
  }, 10000);
}

export const ordersStore = {
  /**
   * Refreshes the orders list from the database.
   */
  async refresh() {
    await loadOrders();
  },

  /**
   * Places a new order from the cart.
   */
  async addOrder(params?: { deliveryAddress?: string; paymentMethod?: string; redeemCoins?: number }): Promise<string | null> {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params || {}),
      });
      const data = await res.json();
      
      if (data.success && data.data?.order) {
        // Track order placement event
        try {
          const { tracker } = await import("@/lib/tracking/tracker");
          tracker.track("ORDER_PLACED", {
            orderId: data.data.order.id,
            orderNumber: data.data.order.orderNumber,
            total: data.data.order.total,
            coinsEarned: data.data.coinsEarned,
          });
        } catch (err) {
          console.error("Tracking order placed failed", err);
        }

        // Refresh user profile (coins and wallet balance updated)
        await auth.refreshUser();
        await loadOrders();
        
        return data.data.order.id;
      }
      return null;
    } catch (e) {
      console.error("Failed to place order", e);
      return null;
    }
  },

  /**
   * Cancel an order.
   */
  async cancelOrder(id: string) {
    // Find local order to get DB ID
    const localOrder = state.orders.find((o) => o.id === id);
    const dbId = (localOrder as any)?.dbId || id;

    // Track order cancel event
    try {
      const { tracker } = await import("@/lib/tracking/tracker");
      tracker.track("ORDER_CANCELLED", { orderId: dbId, orderNumber: id });
    } catch (e) {
      console.error("Tracking failed", e);
    }

    try {
      const res = await fetch(`/api/orders/${dbId}/cancel`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        await auth.refreshUser();
        await loadOrders();
      }
    } catch (e) {
      console.error("Failed to cancel order", e);
    }
  },

  /**
   * Admin: Update order status stage.
   */
  async updateOrderStage(id: string, stage: number) {
    // Find local order to get DB ID
    const localOrder = state.orders.find((o) => o.id === id);
    const dbId = (localOrder as any)?.dbId || id;

    const statusMap = ["CONFIRMED", "COOKING", "ON_THE_WAY", "DELIVERED"];
    const status = statusMap[stage] || "CONFIRMED";

    try {
      const res = await fetch(`/api/orders/${dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        await loadOrders();
      }
    } catch (e) {
      console.error("Failed to update order stage", e);
    }
  },
};

export function useOrders<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state)
  );
}
