import { useSyncExternalStore } from "react";
import burgerClassic from "@/assets/burger-classic.jpg";
import burgerBacon from "@/assets/burger-bacon.jpg";

export type Order = {
  id: string;
  item: string;
  image: any;
  eta: string;
  stage: number; // 0: Confirmed, 1: Cooking, 2: On the way, 3: Delivered, -1: Cancelled
  price: number;
  date: string;
  status: "active" | "delivered" | "cancelled";
};

type State = {
  orders: Order[];
};

let state: State = {
  orders: [
    {
      id: "KV-2841",
      item: "The Smashed + Golden Fries",
      image: burgerClassic,
      eta: "12 min",
      stage: 2,
      price: 450.0,
      date: "Today · 7:30 PM",
      status: "active",
    },
    {
      id: "KV-2832",
      item: "Smoke & Jam",
      image: burgerBacon,
      eta: "0 min",
      stage: 3,
      price: 360.0,
      date: "Yesterday · 8:14 PM",
      status: "delivered",
    },
    {
      id: "KV-2810",
      item: "The Smashed × 2",
      image: burgerClassic,
      eta: "0 min",
      stage: 3,
      price: 660.0,
      date: "Jun 24 · 1:02 PM",
      status: "delivered",
    },
  ],
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((cb) => cb());
}

export const ordersStore = {
  addOrder(items: { name: string; price: number; qty: number; image: string }[]) {
    const id = "KV-" + Math.floor(1000 + Math.random() * 9000);
    const itemNames = items.map((i) => `${i.name}${i.qty > 1 ? ` × ${i.qty}` : ""}`).join(" + ");
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const delivery = 1.99;
    const totalPrice = subtotal + delivery;

    const newOrder: Order = {
      id,
      item: itemNames,
      image: items[0]?.image || burgerClassic,
      eta: "15 min",
      stage: 0,
      price: totalPrice,
      date: "Today · Just now",
      status: "active",
    };

    state = {
      orders: [newOrder, ...state.orders],
    };
    emit();
    return id;
  },
  updateOrderStage(id: string, stage: number) {
    state = {
      orders: state.orders.map((o) => {
        if (o.id === id) {
          const status = stage === 3 ? "delivered" : o.status;
          const eta = stage === 3 ? "0 min" : stage === 2 ? "5 min" : stage === 1 ? "10 min" : "15 min";
          return { ...o, stage, status, eta };
        }
        return o;
      }),
    };
    emit();
  },
  cancelOrder(id: string) {
    state = {
      orders: state.orders.map((o) => {
        if (o.id === id) {
          return { ...o, status: "cancelled", stage: -1, eta: "0 min" };
        }
        return o;
      }),
    };
    emit();
  },
};

export function useOrders<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}
