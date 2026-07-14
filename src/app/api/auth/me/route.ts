import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

/**
 * GET /api/auth/me
 * Get the current authenticated user's profile.
 * Used to hydrate auth state on app load.
 */
export async function GET() {
  try {
    const tokenPayload = await getCurrentUser();

    if (!tokenPayload) {
      return NextResponse.json(
        apiSuccess({ user: null }),
        { status: 200 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        avatarUrl: true,
        referralCode: true,
        kaivuCoins: true,
        walletBalance: true,
        role: true,
        pwaInstalled: true,
        pwaLastDismissedOrderCount: true,
        createdAt: true,
        addresses: {
          select: {
            id: true,
            label: true,
            fullAddress: true,
            isDefault: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        apiSuccess({ user: null }),
        { status: 200 }
      );
    }

    return NextResponse.json(
      apiSuccess({
        user: {
          ...user,
          walletBalance: Number(user.walletBalance),
          orderCount: user._count.orders,
          addressCount: user.addresses.length,
        },
      })
    );
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(apiError("Failed to get user"), { status: 500 });
  }
}
