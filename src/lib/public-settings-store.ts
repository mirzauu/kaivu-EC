import { useSyncExternalStore } from "react";
import { NotificationBannersConfig, DEFAULT_NOTIFICATION_BANNERS_CONFIG } from "./types/banners";

type PublicSettingsState = {
  rewardSectionEnabled: boolean;
  notificationBanners: NotificationBannersConfig;
  isLoading: boolean;
};

let state: PublicSettingsState = {
  rewardSectionEnabled: false,
  notificationBanners: DEFAULT_NOTIFICATION_BANNERS_CONFIG,
  isLoading: true,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((cb) => cb());
}

async function loadPublicSettings() {
  try {
    state = { ...state, isLoading: true };
    emit();

    const res = await fetch("/api/settings/public");
    const data = await res.json();

    if (data.success && data.data) {
      state = {
        rewardSectionEnabled: Boolean(data.data.rewardSectionEnabled),
        notificationBanners: data.data.notificationBanners || DEFAULT_NOTIFICATION_BANNERS_CONFIG,
        isLoading: false,
      };
    } else {
      state = {
        rewardSectionEnabled: false,
        notificationBanners: DEFAULT_NOTIFICATION_BANNERS_CONFIG,
        isLoading: false,
      };
    }
  } catch (e) {
    state = {
      rewardSectionEnabled: false,
      notificationBanners: DEFAULT_NOTIFICATION_BANNERS_CONFIG,
      isLoading: false,
    };
  }
  emit();
}

if (typeof window !== "undefined") {
  setTimeout(() => loadPublicSettings(), 0);
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
    () => selector({ rewardSectionEnabled: false, notificationBanners: DEFAULT_NOTIFICATION_BANNERS_CONFIG, isLoading: false })
  );
}
