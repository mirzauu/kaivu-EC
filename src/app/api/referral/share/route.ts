import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * GET /api/referral/share
 * Generate a shareable referral link.
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.userId },
      select: { referralCode: true, name: true },
    });

    if (!user) {
      return NextResponse.json(apiError("User not found"), { status: 404 });
    }

    // Generate the referral link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kaivu.app";
    const referralLink = `${baseUrl}?ref=${user.referralCode}`;

    // Generate share message
    const shareMessage = user.name
      ? `${user.name} invited you to Kaivu! Use code ${user.referralCode} to get bonus Kaivu coins on your first order. ${referralLink}`
      : `You've been invited to Kaivu! Use code ${user.referralCode} to get bonus Kaivu coins on your first order. ${referralLink}`;

    return NextResponse.json(
      apiSuccess({
        referralCode: user.referralCode,
        referralLink,
        shareMessage,
      })
    );
  } catch (error) {
    console.error("Referral share error:", error);
    return NextResponse.json(apiError("Failed to generate referral link"), { status: 500 });
  }
});
