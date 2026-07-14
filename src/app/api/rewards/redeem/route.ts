import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { redeemReward } from "@/lib/services/reward-engine";

/**
 * POST /api/rewards/redeem
 * Redeem a reward using Kaivu coins.
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { rewardId } = body;

    if (!rewardId) {
      return NextResponse.json(
        apiError("rewardId is required"),
        { status: 400 }
      );
    }

    const result = await redeemReward(req.user.userId, rewardId);

    return NextResponse.json(
      apiSuccess(result, "Reward redeemed successfully")
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to redeem reward";
    console.error("Reward redeem error:", error);
    return NextResponse.json(apiError(message), { status: 400 });
  }
});
