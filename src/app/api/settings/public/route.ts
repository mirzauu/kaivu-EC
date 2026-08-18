import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/api-utils";
import { isRewardSectionEnabled, getNotificationBannersConfig, DEFAULT_NOTIFICATION_BANNERS_CONFIG } from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings/public
 * Get public system feature flags and settings.
 */
export async function GET() {
  try {
    const [rewardSectionEnabled, notificationBanners] = await Promise.all([
      isRewardSectionEnabled(),
      getNotificationBannersConfig(),
    ]);

    return NextResponse.json(
      apiSuccess({
        rewardSectionEnabled,
        notificationBanners,
      })
    );
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json(
      apiSuccess({
        rewardSectionEnabled: false,
        notificationBanners: DEFAULT_NOTIFICATION_BANNERS_CONFIG,
      })
    );
  }
}
