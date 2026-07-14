import { useSyncExternalStore } from "react";

type AdminState = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

let state: AdminState = {
  isAuthenticated: typeof window !== "undefined" ? localStorage.getItem("csuite_auth") === "true" : false,
  isLoading: false,
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export const adminAuth = {
  /**
   * Logs in the admin user using backend credentials check.
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      state = { ...state, isLoading: true };
      emit();

      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        state = { isAuthenticated: true, isLoading: false };
        if (typeof window !== "undefined") {
          localStorage.setItem("csuite_auth", "true");
        }
        emit();
        return true;
      }

      state = { ...state, isLoading: false };
      emit();
      return false;
    } catch (e) {
      state = { ...state, isLoading: false };
      emit();
      return false;
    }
  },

  /**
   * Admin logout — clears cookies on the server and redirects.
   */
  async logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request failed", e);
    }

    state = { isAuthenticated: false, isLoading: false };
    if (typeof window !== "undefined") {
      localStorage.removeItem("csuite_auth");
    }
    emit();

    if (typeof window !== "undefined") {
      window.location.href = "/"; // Redirect to home
    }
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
