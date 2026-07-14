import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { Prisma } from "@prisma/client";

/**
 * POST /api/wallet/topup
 * Add funds to the wallet (mock payment for now).
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { amount } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        apiError("A positive amount is required"),
        { status: 400 }
      );
    }

    if (amount > 10000) {
      return NextResponse.json(
        apiError("Maximum top-up amount is ₹10,000"),
        { status: 400 }
      );
    }

    // TODO: Integrate with payment gateway (Razorpay/Stripe)
    // For now, directly credit the wallet

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: req.user.userId },
        data: { walletBalance: { increment: amount } },
        select: { walletBalance: true },
      });

      await tx.walletTransaction.create({
        data: {
          userId: req.user.userId,
          amount: new Prisma.Decimal(amount),
          type: "TOP_UP",
          description: `Wallet top-up of ₹${amount}`,
          balanceAfter: user.walletBalance,
        },
      });

      return { walletBalance: Number(user.walletBalance) };
    });

    return NextResponse.json(
      apiSuccess(result, `₹${amount} added to wallet`)
    );
  } catch (error) {
    console.error("Wallet topup error:", error);
    return NextResponse.json(apiError("Failed to top up wallet"), { status: 500 });
  }
});
