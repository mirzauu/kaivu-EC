import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * GET /api/admin/users
 * List all users with activity summary.
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          phone: true,
          name: true,
          email: true,
          kaivuCoins: true,
          walletBalance: true,
          role: true,
          referralCode: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
              referralsMade: true,
              events: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json(
      apiSuccess({
        users: users.map((u) => ({
          ...u,
          walletBalance: Number(u.walletBalance),
          orderCount: u._count.orders,
          referralCount: u._count.referralsMade,
          eventCount: u._count.events,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    );
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json(apiError("Failed to fetch users"), { status: 500 });
  }
});
