import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { getReferralStats, validateReferralCode } from "@/lib/services/referral-service";

/**
 * GET /api/referral
 * Get the current user's referral code and stats.
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const stats = await getReferralStats(req.user.userId);
    return NextResponse.json(apiSuccess(stats));
  } catch (error) {
    console.error("Referral stats error:", error);
    return NextResponse.json(apiError("Failed to fetch referral stats"), { status: 500 });
  }
});

/**
 * POST /api/referral
 * Validate a referral code.
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        apiError("Referral code is required"),
        { status: 400 }
      );
    }

    const result = await validateReferralCode(code, req.user.userId);

    if (!result.valid) {
      return NextResponse.json(apiError(result.error!), { status: 400 });
    }

    return NextResponse.json(apiSuccess(result));
  } catch (error) {
    console.error("Referral validate error:", error);
    return NextResponse.json(apiError("Failed to validate referral code"), { status: 500 });
  }
});
