import { useSyncExternalStore } from "react";
import { auth } from "./auth-store";

type AdminState = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

// Initial state: only tentatively true if csuite_auth is set AND the current auth-store is not a regular customer
function getInitialState(): AdminState {
  if (typeof window === "undefined") {
    return { isAuthenticated: false, isLoading: false };
  }
  const hasLocalAuth = localStorage.getItem("csuite_auth") === "true";
  const currentUser = auth.getState().user;
  // If user is clearly signed in as a normal customer, admin authentication is strictly false
  if (currentUser && currentUser.role !== "ADMIN") {
    localStorage.removeItem("csuite_auth");
    return { isAuthenticated: false, isLoading: false };
  }
  return { isAuthenticated: hasLocalAuth, isLoading: false };
}

let state: AdminState = getInitialState();

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

// Automatically sync when customer logs in or out in auth-store
if (typeof window !== "undefined") {
  auth.subscribe(() => {
    const user = auth.getState().user;
    if (user && user.role !== "ADMIN" && state.isAuthenticated) {
      state = { isAuthenticated: false, isLoading: false };
      localStorage.removeItem("csuite_auth");
      emit();
    }
  });
}

export const adminAuth = {
  /**
   * Verifies current session with backend to ensure the user is an actual ADMIN.
   */
  async checkAdminSession(): Promise<boolean> {
    try {
      state = { ...state, isLoading: true };
      emit();

      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();

      if (data.success && data.data?.user && data.data.user.role === "ADMIN") {
        state = { isAuthenticated: true, isLoading: false };
        if (typeof window !== "undefined") {
          localStorage.setItem("csuite_auth", "true");
        }
        emit();
        return true;
      } else {
        state = { isAuthenticated: false, isLoading: false };
        if (typeof window !== "undefined") {
          localStorage.removeItem("csuite_auth");
        }
        emit();
        return false;
      }
    } catch {
      state = { isAuthenticated: false, isLoading: false };
      emit();
      return false;
    }
  },

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
        // Also refresh user in main auth-store
        await auth.refreshUser();
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

    await auth.refreshUser();

    if (typeof window !== "undefined") {
      window.location.href = "/csuite";
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
