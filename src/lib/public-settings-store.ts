import { useSyncExternalStore } from "react";

type PublicSettingsState = {
  rewardSectionEnabled: boolean;
  isLoading: boolean;
};

let state: PublicSettingsState = {
  rewardSectionEnabled: false,
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
        isLoading: false,
      };
    } else {
      state = {
        rewardSectionEnabled: false,
        isLoading: false,
      };
    }
  } catch (e) {
    state = {
      rewardSectionEnabled: false,
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
    () => selector({ rewardSectionEnabled: false, isLoading: false })
  );
}
