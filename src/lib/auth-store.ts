import { useSyncExternalStore } from "react";

export type Address = {
  id: string;
  name: string | null;
  label: string;
  fullAddress: string;
  isDefault: boolean;
  lat?: number | null;
  lng?: number | null;
};

export type User = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  referralCode: string;
  kaivuCoins: number;
  walletBalance: number;
  role: "USER" | "ADMIN";
  addresses: Address[];
  orderCount: number;
  pwaInstalled: boolean;
  pwaLastDismissedOrderCount: number;
};

type State = {
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  user: User | null;
  isLoading: boolean;
};

let initialUser: User | null = null;
let initialAuth = false;

if (typeof window !== "undefined") {
  try {
    const cached = localStorage.getItem("kaivu_user");
    if (cached) {
      initialUser = JSON.parse(cached);
      initialAuth = true;
    }
  } catch (e) {
    console.error("Failed to parse cached user", e);
  }
}

let state: State = {
  isAuthenticated: initialAuth,
  isAuthModalOpen: false,
  user: initialUser,
  isLoading: initialAuth ? false : true, // don't show loader on reload if we have cached details
};

let pendingAction: (() => void) | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

// Check session on store initialization (in client side)
if (typeof window !== "undefined") {
  fetch("/api/auth/me")
    .then((r) => r.json())
    .then((res) => {
      if (res.success && res.data?.user) {
        localStorage.setItem("kaivu_user", JSON.stringify(res.data.user));
        state = {
          isAuthenticated: true,
          isAuthModalOpen: false,
          user: res.data.user,
          isLoading: false,
        };
      } else {
        localStorage.removeItem("kaivu_user");
        state = {
          isAuthenticated: false,
          isAuthModalOpen: false,
          user: null,
          isLoading: false,
        };
      }
      emit();
    })
    .catch(() => {
      // Keep cached state in case of offline/flaky network, but turn off loading
      state = { ...state, isLoading: false };
      emit();
    });
}

export const auth = {
  /**
   * Refreshes the user profile from the server.
   */
  async refreshUser() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success && data.data?.user) {
        localStorage.setItem("kaivu_user", JSON.stringify(data.data.user));
        state = {
          ...state,
          isAuthenticated: true,
          user: data.data.user,
        };
        emit();
      }
    } catch (e) {
      console.error("Failed to refresh user", e);
    }
  },

  /**
   * Saves a new address to the user's profile.
   */
  async addAddress(addressData: {
    name?: string;
    label: string;
    fullAddress: string;
    city?: string;
    pincode?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to save address" };
      }
      await this.refreshUser();
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, error: "Network error saving address" };
    }
  },

  /**
   * Deletes an address from the user's profile.
   */
  async deleteAddress(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to delete address" };
      }
      await this.refreshUser();
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error deleting address" };
    }
  },

  /**
   * Sends OTP request to the backend.
   */
  async sendOtp(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to send OTP" };
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error. Please try again." };
    }
  },

  /**
   * Verifies OTP and logs the user in.
   */
  async verifyOtp(
    phone: string,
    code: string,
    referralCode?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, referralCode }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Verification failed" };
      }

      localStorage.setItem("kaivu_user", JSON.stringify(data.data.user));
      state = {
        isAuthenticated: true,
        isAuthModalOpen: false,
        user: data.data.user,
        isLoading: false,
      };
      emit();

      // Trigger tracking event on login
      try {
        const { tracker } = await import("@/lib/tracking/tracker");
        tracker.track("LOGIN", { userId: data.data.user.id });
      } catch (err) {
        console.error("Tracking failed during login", err);
      }

      // Execute and clear any pending action
      if (pendingAction) {
        const action = pendingAction;
        pendingAction = null;
        action();
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error. Please try again." };
    }
  },

  /**
   * Updates the user's name.
   */
  async updateName(name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Failed to update name" };
      }
      await this.refreshUser();
      return { success: true };
    } catch (e) {
      return { success: false, error: "Network error updating profile" };
    }
  },

  /**
   * Logs out the current user.
   */
  async logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request failed", e);
    }

    localStorage.removeItem("kaivu_user");
    state = {
      isAuthenticated: false,
      isAuthModalOpen: false,
      user: null,
      isLoading: false,
    };
    emit();
    
    if (typeof window !== "undefined") {
      window.location.href = "/"; // redirect to home
    }
  },

  openModal(action?: () => void) {
    if (action) {
      pendingAction = action;
    }
    state = { ...state, isAuthModalOpen: true };
    emit();
  },

  closeModal() {
    pendingAction = null;
    state = { ...state, isAuthModalOpen: false };
    emit();
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getState() {
    return state;
  },
};

export function useAuth<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state)
  );
}
