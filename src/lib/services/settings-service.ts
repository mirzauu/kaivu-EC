import { db } from "@/lib/db";

// Cache settings in memory for the duration of a request to avoid repeated DB hits
let cachedSettings: Record<string, string> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30_000; // 30 seconds — short enough for admin changes to propagate

/**
 * Load all system settings from the database.
 * Caches for 30 seconds to avoid excessive DB queries within a single request cycle.
 */
export async function getSettings(): Promise<Record<string, string>> {
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedSettings;
  }

  const rows = await db.systemSetting.findMany();
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  cachedSettings = map;
  cacheTimestamp = now;
  return map;
}

/**
 * Get a single setting value, parsed as a number.
 */
export async function getSettingNumber(
  key: string,
  fallback: number
): Promise<number> {
  const settings = await getSettings();
  const val = settings[key];
  if (val === undefined) return fallback;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Get a single setting value as boolean.
 */
export async function getSettingBoolean(
  key: string,
  fallback: boolean
): Promise<boolean> {
  const settings = await getSettings();
  const val = settings[key];
  if (val === undefined) return fallback;
  return val === "true";
}

/**
 * Check if the reward section is enabled (default: false).
 */
export async function isRewardSectionEnabled(): Promise<boolean> {
  return getSettingBoolean("reward_section_enabled", false);
}

/**
 * Get a single setting value as string.
 */
export async function getSettingString(
  key: string,
  fallback: string
): Promise<string> {
  const settings = await getSettings();
  return settings[key] ?? fallback;
}

/**
 * Update a system setting. Clears the cache.
 */
export async function updateSetting(
  key: string,
  value: string
): Promise<void> {
  await db.systemSetting.update({
    where: { key },
    data: { value },
  });
  // Bust cache
  cachedSettings = null;
}

import { NotificationBannersConfig, DEFAULT_NOTIFICATION_BANNERS_CONFIG } from "@/lib/types/banners";
export * from "@/lib/types/banners";

/**
 * Check and get notification banners configuration.
 */
export async function getNotificationBannersConfig(): Promise<NotificationBannersConfig> {
  const settings = await getSettings();
  const raw = settings["notification_banners_config"];
  if (!raw) return DEFAULT_NOTIFICATION_BANNERS_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return {
      fullScreenInstall: {
        ...DEFAULT_NOTIFICATION_BANNERS_CONFIG.fullScreenInstall,
        ...(parsed.fullScreenInstall || {}),
      },
      idleSmallBanner: {
        ...DEFAULT_NOTIFICATION_BANNERS_CONFIG.idleSmallBanner,
        ...(parsed.idleSmallBanner || {}),
      },
      halfScreenOffer: {
        ...DEFAULT_NOTIFICATION_BANNERS_CONFIG.halfScreenOffer,
        ...(parsed.halfScreenOffer || {}),
      },
    };
  } catch {
    return DEFAULT_NOTIFICATION_BANNERS_CONFIG;
  }
}

/**
 * Invalidate the settings cache (e.g., after admin updates).
 */
export function invalidateSettingsCache(): void {
  cachedSettings = null;
}

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

export async function setStoreSetting(
  key: string,
  value: string,
  label: string,
  group = "operations"
): Promise<void> {
  try {
    await db.systemSetting.upsert({
      where: { key },
      update: { value },
      create: {
        key,
        value,
        type: "string",
        label,
        group,
      },
    });
  } catch (err) {
    console.error(`Error saving setting ${key}:`, err);
  }
  cachedSettings = null;
}

/**
 * Get current store operational status and closing countdown timer.
 */
export async function getStoreStatus(): Promise<StoreStatus> {
  try {
    const settings = await getSettings();
    const rawIsOpen = settings["store_is_open"];
    const rawTimer = settings["store_closing_timer_ends_at"];
    const closingTimerEndsAt = rawTimer && rawTimer.trim().length > 0 ? rawTimer : null;
    const closedMessage = settings["store_closed_message"] || DEFAULT_STORE_STATUS.closedMessage;

    let isOpen = rawIsOpen === undefined ? true : rawIsOpen === "true";

    // Auto-close if timer has passed
    if (closingTimerEndsAt) {
      const endsAtMs = new Date(closingTimerEndsAt).getTime();
      if (!isNaN(endsAtMs) && Date.now() >= endsAtMs) {
        isOpen = false;
      }
    }

    return {
      isOpen,
      closingTimerEndsAt,
      closedMessage,
    };
  } catch (error) {
    console.error("Error fetching store status:", error);
    return DEFAULT_STORE_STATUS;
  }
}

/**
 * Update store open/close state, closing timer, and announcement message.
 */
export async function updateStoreStatus(status: Partial<StoreStatus>): Promise<StoreStatus> {
  if (status.isOpen !== undefined) {
    await setStoreSetting("store_is_open", status.isOpen ? "true" : "false", "Store Open Status");
  }
  if (status.closingTimerEndsAt !== undefined) {
    await setStoreSetting(
      "store_closing_timer_ends_at",
      status.closingTimerEndsAt || "",
      "Store Closing Timer Ends At"
    );
  }
  if (status.closedMessage !== undefined) {
    await setStoreSetting(
      "store_closed_message",
      status.closedMessage,
      "Store Closed Announcement Message"
    );
  }
  cachedSettings = null;
  return getStoreStatus();
}

