import { useSyncExternalStore } from "react";
import { menu as initialMenu, MenuItem } from "./menu-data";

type State = {
  menu: MenuItem[];
};

let state: State = {
  menu: [...initialMenu],
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((cb) => cb());
}

export const menuStore = {
  addItem(item: Omit<MenuItem, "id">) {
    const id = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newItem: MenuItem = {
      ...item,
      id,
      rating: item.rating || 5.0,
    };
    state = {
      menu: [...state.menu, newItem],
    };
    emit();
    return newItem;
  },
  updateItem(id: string, updated: Partial<Omit<MenuItem, "id">>) {
    state = {
      menu: state.menu.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    };
    emit();
  },
  deleteItem(id: string) {
    state = {
      menu: state.menu.filter((item) => item.id !== id),
    };
    emit();
  },
};

export function useMenu<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}
