import { useSyncExternalStore } from "react";

type AdminState = {
  isAuthenticated: boolean;
};

let state: AdminState = {
  isAuthenticated: typeof window !== "undefined" ? localStorage.getItem("csuite_auth") === "true" : false,
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export const adminAuth = {
  login(password: string) {
    if (password === "admin") {
      state = { isAuthenticated: true };
      if (typeof window !== "undefined") {
        localStorage.setItem("csuite_auth", "true");
      }
      emit();
      return true;
    }
    return false;
  },
  logout() {
    state = { isAuthenticated: false };
    if (typeof window !== "undefined") {
      localStorage.removeItem("csuite_auth");
    }
    emit();
  },
};

export function useAdminAuth<T>(selector: (s: AdminState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}
