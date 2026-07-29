import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/api-utils";
import { isRewardSectionEnabled } from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/settings/public
 * Get public system feature flags and settings.
 */
export async function GET() {
  try {
    const rewardSectionEnabled = await isRewardSectionEnabled();

    return NextResponse.json(
      apiSuccess({
        rewardSectionEnabled,
      })
    );
  } catch (error) {
    console.error("Public settings error:", error);
    return NextResponse.json(
      apiSuccess({
        rewardSectionEnabled: false,
      })
    );
  }
}
