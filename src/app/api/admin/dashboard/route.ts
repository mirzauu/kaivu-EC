import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * GET /api/admin/dashboard
 * Aggregated analytics for the admin dashboard.
 */
export const GET = withAdmin(async (_req: AuthenticatedRequest) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Parallel queries for dashboard data
    const [
      totalUsers,
      usersToday,
      usersThisMonth,
      totalOrders,
      ordersToday,
      ordersThisMonth,
      revenueToday,
      revenueThisMonth,
      revenueLastMonth,
      activeOrders,
      topItems,
      recentOrders,
      recentEvents,
      coinStats,
      referralStats,
    ] = await Promise.all([
      // User counts
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: startOfToday } } }),
      db.user.count({ where: { createdAt: { gte: startOfMonth } } }),

      // Order counts
      db.order.count({ where: { status: { not: "CANCELLED" } } }),
      db.order.count({
        where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
      }),
      db.order.count({
        where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
      }),

      // Revenue
      db.order.aggregate({
        where: { createdAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      db.order.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
        _sum: { total: true },
      }),
      db.order.aggregate({
        where: {
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
      }),

      // Active orders (not delivered/cancelled)
      db.order.count({
        where: { status: { in: ["PENDING", "CONFIRMED", "COOKING", "ON_THE_WAY"] } },
      }),

      // Top selling items
      db.orderItem.groupBy({
        by: ["itemName"],
        _sum: { quantity: true },
        _count: true,
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),

      // Recent orders
      db.order.findMany({
        include: {
          user: { select: { name: true, phone: true } },
          items: { select: { itemName: true, quantity: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Recent user events
      db.userEvent.findMany({
        include: {
          user: { select: { name: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),

      // Coin stats
      db.coinTransaction.aggregate({
        where: { amount: { gt: 0 } },
        _sum: { amount: true },
      }),

      // Referral stats
      db.referral.count({ where: { status: "REWARDED" } }),
    ]);

    // Revenue trend (last 7 days)
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const dayRevenue = await db.order.aggregate({
        where: {
          createdAt: { gte: dayStart, lt: dayEnd },
          status: { not: "CANCELLED" },
        },
        _sum: { total: true },
        _count: true,
      });

      revenueTrend.push({
        date: dayStart.toISOString().split("T")[0],
        day: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: Number(dayRevenue._sum.total || 0),
        orders: dayRevenue._count || 0,
      });
    }

    const thisMonthRevenue = Number(revenueThisMonth._sum.total || 0);
    const lastMonthRevenue = Number(revenueLastMonth._sum.total || 0);
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    return NextResponse.json(
      apiSuccess({
        overview: {
          totalUsers,
          usersToday,
          usersThisMonth,
          totalOrders,
          ordersToday,
          ordersThisMonth,
          activeOrders,
          revenueToday: Number(revenueToday._sum.total || 0),
          revenueThisMonth: thisMonthRevenue,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
          totalCoinsDistributed: coinStats._sum.amount || 0,
          totalReferralsCompleted: referralStats,
        },
        revenueTrend,
        topItems: topItems.map((item) => ({
          name: item.itemName,
          quantity: item._sum.quantity || 0,
          orders: item._count,
        })),
        recentOrders: recentOrders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          userName: order.user.name || order.user.phone,
          items: order.items.map((i) => `${i.itemName} x${i.quantity}`).join(", "),
          total: Number(order.total),
          status: order.status,
          createdAt: order.createdAt,
        })),
        recentEvents: recentEvents.map((event) => ({
          id: event.id,
          userName: event.user?.name || event.user?.phone || "Anonymous",
          eventType: event.eventType,
          metadata: event.metadata,
          createdAt: event.createdAt,
        })),
      })
    );
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(apiError("Failed to load dashboard"), { status: 500 });
  }
});
