import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/api-utils";
import {
  isRewardSectionEnabled,
  getNotificationBannersConfig,
  DEFAULT_NOTIFICATION_BANNERS_CONFIG,
  getStoreStatus,
  DEFAULT_STORE_STATUS,
  getDeliveryConfig,
  getPickupConfig,
} from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings/public
 * Get public system feature flags, banners, and store status.
 */
export async function GET() {
  try {
    const [rewardSectionEnabled, notificationBanners, storeStatus, deliveryConfig, pickupConfig] =
      await Promise.all([
        isRewardSectionEnabled(),
        getNotificationBannersConfig(),
        getStoreStatus(),
        getDeliveryConfig(),
        getPickupConfig(),
      ]);

    return NextResponse.json(
      apiSuccess({
        rewardSectionEnabled,
        notificationBanners,
        storeStatus,
        deliveryConfig,
        pickupConfig,
      })
    );
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json(
      apiSuccess({
        rewardSectionEnabled: false,
        notificationBanners: DEFAULT_NOTIFICATION_BANNERS_CONFIG,
        storeStatus: DEFAULT_STORE_STATUS,
        deliveryConfig: null,
        pickupConfig: {
          enabled: true,
          spotName: "Kaivu Counter",
          spotAddress: "",
          lat: 0,
          lng: 0,
          instructions: "Show your order ID at the counter to collect your order.",
        },
      })
    );
  }
}

