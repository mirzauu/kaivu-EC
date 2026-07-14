import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { placeOrder } from "@/lib/services/order-service";

/**
 * GET /api/orders
 * Fetch the current user's orders (paginated, newest first).
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status"); // filter by status

    const where: Record<string, unknown> = {};
    if (req.user.role !== "ADMIN") {
      where.userId = req.user.userId;
    }
    if (status) {
      where.status = status.toUpperCase();
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: {
            include: {
              menuItem: {
                select: { imageUrl: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const serialized = orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        itemPrice: Number(item.itemPrice),
        lineTotal: Number(item.lineTotal),
      })),
    }));

    return NextResponse.json(
      apiSuccess({
        orders: serialized,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(apiError("Failed to fetch orders"), { status: 500 });
  }
});

/**
 * POST /api/orders
 * Place a new order from the current user's cart.
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { deliveryAddress, paymentMethod, redeemCoins } = body as {
      deliveryAddress?: string;
      paymentMethod?: string;
      redeemCoins?: number;
    };

    const result = await placeOrder({
      userId: req.user.userId,
      deliveryAddress,
      paymentMethod,
      redeemCoins: redeemCoins || 0,
    });

    return NextResponse.json(
      apiSuccess(result, "Order placed successfully"),
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to place order";
    console.error("Order create error:", error);
    return NextResponse.json(apiError(message), { status: 400 });
  }
});
