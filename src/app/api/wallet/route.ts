import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * GET /api/wallet
 * Get wallet balance and transaction history.
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const user = await db.user.findUnique({
      where: { id: req.user.userId },
      select: { kaivuCoins: true, walletBalance: true },
    });

    if (!user) {
      return NextResponse.json(apiError("User not found"), { status: 404 });
    }

    // Coin transactions
    const [coinTransactions, coinTotal] = await Promise.all([
      db.coinTransaction.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.coinTransaction.count({ where: { userId: req.user.userId } }),
    ]);

    // Wallet transactions
    const [walletTransactions, walletTotal] = await Promise.all([
      db.walletTransaction.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.walletTransaction.count({ where: { userId: req.user.userId } }),
    ]);

    return NextResponse.json(
      apiSuccess({
        kaivuCoins: user.kaivuCoins,
        walletBalance: Number(user.walletBalance),
        coinTransactions: coinTransactions,
        walletTransactions: walletTransactions.map((wt) => ({
          ...wt,
          amount: Number(wt.amount),
          balanceAfter: Number(wt.balanceAfter),
        })),
        pagination: {
          page,
          limit,
          coinTotal,
          walletTotal,
        },
      })
    );
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(apiError("Failed to fetch wallet"), { status: 500 });
  }
});
