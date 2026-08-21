import { useSyncExternalStore } from "react";
import { NotificationBannersConfig, DEFAULT_NOTIFICATION_BANNERS_CONFIG } from "./types/banners";

export type StoreStatus = {
  isOpen: boolean;
  closingTimerEndsAt: string | null;
  closedMessage: string;
};

export const DEFAULT_STORE_STATUS: StoreStatus = {
  isOpen: true,
  closingTimerEndsAt: null,
  closedMessage: "We are currently closed for orders. Check back soon!",
};

type PublicSettingsState = {
  rewardSectionEnabled: boolean;
  notificationBanners: NotificationBannersConfig;
  storeStatus: StoreStatus;
  isLoading: boolean;
};

let state: PublicSettingsState = {
  rewardSectionEnabled: false,
  notificationBanners: DEFAULT_NOTIFICATION_BANNERS_CONFIG,
  storeStatus: DEFAULT_STORE_STATUS,
  isLoading: true,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((cb) => cb());
}

async function loadPublicSettings() {
  try {
    const res = await fetch("/api/settings/public");
    const data = await res.json();

    if (data.success && data.data) {
      state = {
        rewardSectionEnabled: Boolean(data.data.rewardSectionEnabled),
        notificationBanners: data.data.notificationBanners || DEFAULT_NOTIFICATION_BANNERS_CONFIG,
        storeStatus: data.data.storeStatus || DEFAULT_STORE_STATUS,
        isLoading: false,
      };
    } else {
      state = {
        ...state,
        isLoading: false,
      };
    }
  } catch (e) {
    state = {
      ...state,
      isLoading: false,
    };
  }
  emit();
}

if (typeof window !== "undefined") {
  setTimeout(() => loadPublicSettings(), 0);
  // Periodic poll every 10s to keep store open/close & countdown timers in sync
  setInterval(() => {
    if (document.visibilityState === "visible") {
      loadPublicSettings();
    }
  }, 10000);
}

export const publicSettingsStore = {
  fetchPublicSettings: loadPublicSettings,
  updateLocalRewardStatus: (enabled: boolean) => {
    state = { ...state, rewardSectionEnabled: enabled };
    emit();
  },
  updateLocalNotificationBanners: (config: NotificationBannersConfig) => {
    state = { ...state, notificationBanners: config };
    emit();
  },
  updateLocalStoreStatus: (status: Partial<StoreStatus>) => {
    state = { ...state, storeStatus: { ...state.storeStatus, ...status } };
    emit();
  },
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  getSnapshot: () => state,
};

export function usePublicSettings<T>(selector: (state: PublicSettingsState) => T): T {
  return useSyncExternalStore(
    publicSettingsStore.subscribe,
    () => selector(publicSettingsStore.getSnapshot()),
    () =>
      selector({
        rewardSectionEnabled: false,
        notificationBanners: DEFAULT_NOTIFICATION_BANNERS_CONFIG,
        storeStatus: DEFAULT_STORE_STATUS,
        isLoading: false,
      })
  );
}

