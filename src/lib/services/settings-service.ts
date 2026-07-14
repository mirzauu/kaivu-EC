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

/**
 * Invalidate the settings cache (e.g., after admin updates).
 */
export function invalidateSettingsCache(): void {
  cachedSettings = null;
}
