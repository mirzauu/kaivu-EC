import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

/**
 * POST /api/user/push-subscribe
 * Saves/registers a PWA push subscription for the authenticated user.
 */
export async function POST(req: Request) {
  try {
    const tokenPayload = await getCurrentUser();

    if (!tokenPayload) {
      return NextResponse.json(apiError("Unauthorized"), { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(apiError("Invalid subscription payload"), { status: 400 });
    }

    const userId = tokenPayload.userId;
    const { endpoint, keys } = subscription;
    const { p256dh, auth } = keys;

    if (!p256dh || !auth) {
      return NextResponse.json(apiError("Invalid subscription keys"), { status: 400 });
    }

    // Save or update subscription
    await db.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh,
        auth,
      },
      create: {
        userId,
        endpoint,
        p256dh,
        auth,
      },
    });

    return NextResponse.json(apiSuccess({ success: true }));
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json(apiError("Failed to register push subscription"), { status: 500 });
  }
}
