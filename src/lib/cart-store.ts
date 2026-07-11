import { useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

type State = { items: CartItem[] };

let state: State = { items: [] };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const cart = {
  add(item: Omit<CartItem, "qty">) {
    const existing = state.items.find((i) => i.id === item.id);
    state = {
      items: existing
        ? state.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state.items, { ...item, qty: 1 }],
    };
    emit();
  },
  remove(id: string) {
    state = { items: state.items.filter((i) => i.id !== id) };
    emit();
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) return cart.remove(id);
    state = { items: state.items.map((i) => (i.id === id ? { ...i, qty } : i)) };
    emit();
  },
  clear() {
    state = { items: [] };
    emit();
  },
};

export function useCart<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}
