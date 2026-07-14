import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * GET /api/admin/users/[id]
 * Get full user profile with activity summary.
 */
export const GET = withAdmin(
  async (
    _req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const { id } = await context!.params;

      const user = await db.user.findUnique({
        where: { id },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              items: {
                select: { itemName: true, quantity: true, lineTotal: true },
              },
            },
          },
          coinTransactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          walletTransactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          referralsMade: {
            include: {
              referred: {
                select: { name: true, phone: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          addresses: true,
          _count: {
            select: {
              orders: true,
              events: true,
              referralsMade: true,
            },
          },
        },
      });

      if (!user) {
        return NextResponse.json(apiError("User not found"), { status: 404 });
      }

      // Total spent
      const totalSpent = await db.order.aggregate({
        where: { userId: id, status: { not: "CANCELLED" } },
        _sum: { total: true },
      });

      return NextResponse.json(
        apiSuccess({
          ...user,
          walletBalance: Number(user.walletBalance),
          totalSpent: Number(totalSpent._sum.total || 0),
          orderCount: user._count.orders,
          eventCount: user._count.events,
          referralCount: user._count.referralsMade,
          orders: user.orders.map((o) => ({
            ...o,
            subtotal: Number(o.subtotal),
            deliveryFee: Number(o.deliveryFee),
            discount: Number(o.discount),
            total: Number(o.total),
            items: o.items.map((i) => ({
              ...i,
              lineTotal: Number(i.lineTotal),
            })),
          })),
          walletTransactions: user.walletTransactions.map((wt) => ({
            ...wt,
            amount: Number(wt.amount),
            balanceAfter: Number(wt.balanceAfter),
          })),
        })
      );
    } catch (error) {
      console.error("Admin user detail error:", error);
      return NextResponse.json(apiError("Failed to fetch user"), { status: 500 });
    }
  }
);
