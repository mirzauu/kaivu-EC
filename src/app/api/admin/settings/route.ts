import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { invalidateSettingsCache } from "@/lib/services/settings-service";

/**
 * GET /api/admin/settings
 * Get all system settings, grouped by category.
 */
export const GET = withAdmin(async (_req: AuthenticatedRequest) => {
  try {
    const settings = await db.systemSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    // Group by category
    const grouped: Record<string, typeof settings> = {};
    for (const setting of settings) {
      if (!grouped[setting.group]) {
        grouped[setting.group] = [];
      }
      grouped[setting.group].push(setting);
    }

    return NextResponse.json(apiSuccess({ settings, grouped }));
  } catch (error) {
    console.error("Admin settings fetch error:", error);
    return NextResponse.json(apiError("Failed to fetch settings"), { status: 500 });
  }
});

/**
 * PATCH /api/admin/settings
 * Update one or more system settings.
 * Body: { updates: [{ key: "coin_earn_rate_percent", value: "15" }, ...] }
 */
export const PATCH = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { updates } = body as {
      updates: Array<{ key: string; value: string }>;
    };

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        apiError("Updates array is required"),
        { status: 400 }
      );
    }

    // Validate all keys exist before updating
    const existingKeys = await db.systemSetting.findMany({
      where: { key: { in: updates.map((u) => u.key) } },
      select: { key: true },
    });
    const existingKeySet = new Set(existingKeys.map((k) => k.key));

    const invalidKeys = updates.filter((u) => !existingKeySet.has(u.key));
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        apiError(`Unknown settings: ${invalidKeys.map((k) => k.key).join(", ")}`),
        { status: 400 }
      );
    }

    // Update all settings in a transaction
    await db.$transaction(
      updates.map((update) =>
        db.systemSetting.update({
          where: { key: update.key },
          data: { value: update.value },
        })
      )
    );

    // Clear the settings cache so new values take effect immediately
    invalidateSettingsCache();

    // Fetch updated settings
    const settings = await db.systemSetting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    return NextResponse.json(
      apiSuccess({ settings }, "Settings updated successfully")
    );
  } catch (error) {
    console.error("Admin settings update error:", error);
    return NextResponse.json(apiError("Failed to update settings"), { status: 500 });
  }
});
