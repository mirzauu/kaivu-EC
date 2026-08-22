import { useSyncExternalStore } from "react";
import { MenuItem } from "./menu-data";

type State = {
  menu: MenuItem[];
  isLoading: boolean;
  error: string | null;
};

let state: State = {
  menu: [],
  isLoading: true,
  error: null,
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((cb) => cb());
}

let includeAllItems = false;

// Load menu items from server on client initialization
async function loadMenu(includeDisabled = includeAllItems) {
  try {
    includeAllItems = includeDisabled;
    state = { ...state, isLoading: true, error: null };
    emit();

    const url = includeDisabled ? "/api/menu?all=true" : "/api/menu";
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      state = {
        menu: data.data,
        isLoading: false,
        error: null,
      };
    } else {
      state = {
        ...state,
        isLoading: false,
        error: data.error || "Failed to load menu",
      };
    }
  } catch (e) {
    state = {
      ...state,
      isLoading: false,
      error: "Network error loading menu items",
    };
  }
  emit();
}

if (typeof window !== "undefined") {
  setTimeout(() => loadMenu(), 0);
}

export const menuStore = {
  /**
   * Refreshes the menu from the database.
   * @param includeDisabled If true, includes soft-deleted / disabled items (used in admin console).
   */
  async refresh(includeDisabled = false) {
    await loadMenu(includeDisabled);
  },

  /**
   * Admin: Add a new item to the menu.
   */
  async addItem(item: Omit<MenuItem, "id" | "rating">): Promise<MenuItem | null> {
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success) {
        // Reload menu to keep local state in sync
        await loadMenu();
        return data.data;
      }
      return null;
    } catch (e) {
      console.error("Failed to add menu item", e);
      return null;
    }
  },

  /**
   * Admin: Update an existing menu item.
   */
  async updateItem(id: string, updated: Partial<Omit<MenuItem, "id">>) {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        await loadMenu();
        return data.data;
      }
      return null;
    } catch (e) {
      console.error("Failed to update menu item", e);
      return null;
    }
  },

  /**
   * Admin: Toggle item availability (Soft Delete / Enable).
   */
  async toggleAvailable(id: string, isAvailable: boolean) {
    return this.updateItem(id, { isAvailable });
  },

  /**
   * Admin: Soft-delete (disable) a menu item.
   */
  async deleteItem(id: string) {
    try {
      const res = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadMenu();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to delete menu item", e);
      return false;
    }
  },

  /**
   * Admin: Hard delete (permanently remove) a menu item.
   */
  async hardDeleteItem(id: string) {
    try {
      const res = await fetch(`/api/menu/${id}?hard=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await loadMenu();
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to permanently delete menu item", e);
      return false;
    }
  },
};

export function useMenu<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state)
  );
}
