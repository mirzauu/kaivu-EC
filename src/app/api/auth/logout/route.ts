import { NextResponse } from "next/server";
import { clearTokenCookie, getCurrentUser } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { apiSuccess } from "@/lib/api-utils";

/**
 * POST /api/auth/logout
 * Clear the auth cookie and invalidate the session.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();

    if (user) {
      // Delete all sessions for this user
      await db.session.deleteMany({
        where: { userId: user.userId },
      });
    }

    await clearTokenCookie();

    return NextResponse.json(apiSuccess(null, "Logged out successfully"));
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear the cookie even if DB operation fails
    await clearTokenCookie();
    return NextResponse.json(apiSuccess(null, "Logged out"));
  }
}
