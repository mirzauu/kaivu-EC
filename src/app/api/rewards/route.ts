import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { getAvailableRewards, getLoyaltyProgress } from "@/lib/services/reward-engine";
import { isRewardSectionEnabled } from "@/lib/services/settings-service";

/**
 * GET /api/rewards
 * Get available rewards and loyalty progress for the current user.
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const enabled = await isRewardSectionEnabled();
    if (!enabled) {
      return NextResponse.json(apiSuccess({ rewards: [], loyalty: null, enabled: false }));
    }

    const [rewards, loyalty] = await Promise.all([
      getAvailableRewards(req.user.userId),
      getLoyaltyProgress(req.user.userId),
    ]);

    return NextResponse.json(apiSuccess({ rewards, loyalty, enabled: true }));
  } catch (error) {
    console.error("Rewards fetch error:", error);
    return NextResponse.json(apiError("Failed to fetch rewards"), { status: 500 });
  }
});
