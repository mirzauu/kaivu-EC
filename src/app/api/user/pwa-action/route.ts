import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

/**
 * POST /api/user/pwa-action
 * Records PWA actions (installed or dismissed) in the DB for the user.
 */
export async function POST(req: Request) {
  try {
    const tokenPayload = await getCurrentUser();

    if (!tokenPayload) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    const { action } = await req.json();

    if (action !== "installed" && action !== "dismissed") {
      return NextResponse.json(apiError("Invalid action type"), { status: 400 });
    }

    const userId = tokenPayload.userId;

    if (action === "installed") {
      await db.user.update({
        where: { id: userId },
        data: { pwaInstalled: true },
      });
    } else {
      // Find current order count
      const orderCount = await db.order.count({
        where: { userId },
      });

      await db.user.update({
        where: { id: userId },
        data: { pwaLastDismissedOrderCount: orderCount },
      });
    }

    return NextResponse.json(apiSuccess({ success: true }));
  } catch (error) {
    console.error("PWA action error:", error);
    return NextResponse.json(apiError("Failed to update PWA status"), { status: 500 });
  }
}
