import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";
import webpush from "web-push";

// Configure web-push with VAPID details
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

/**
 * GET /api/orders/[id]
 * Get a specific order with full details.
 */
export const GET = withAuth(
  async (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const { id } = await context!.params;

      const order = await db.order.findFirst({
        where: {
          OR: [{ id }, { orderNumber: id }],
          // Regular users can only see their own orders
          ...(req.user.role !== "ADMIN" ? { userId: req.user.userId } : {}),
        },
        include: {
          items: {
            include: {
              menuItem: {
                select: { imageUrl: true, slug: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, phone: true },
          },
        },
      });

      if (!order) {
        return NextResponse.json(apiError("Order not found"), { status: 404 });
      }

      return NextResponse.json(
        apiSuccess({
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
        })
      );
    } catch (error) {
      console.error("Order fetch error:", error);
      return NextResponse.json(apiError("Failed to fetch order"), { status: 500 });
    }
  }
);

/**
 * PATCH /api/orders/[id]
 * Update order status (admin-only).
 */
export const PATCH = withAdmin(
  async (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const { id } = await context!.params;
      const body = await req.json();
      const { status } = body;

      const validStatuses = [
        "PENDING",
        "CONFIRMED",
        "COOKING",
        "ON_THE_WAY",
        "DELIVERED",
        "CANCELLED",
      ];

      if (!status || !validStatuses.includes(status)) {
        return NextResponse.json(
          apiError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`),
          { status: 400 }
        );
      }

      const order = await db.order.findFirst({
        where: {
          OR: [
            ...(id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? [{ id }] : []),
            { orderNumber: id }
          ]
        }
      });
      if (!order) {
        return NextResponse.json(apiError("Order not found"), { status: 404 });
      }

      const updateData: Record<string, unknown> = { status };
      if (status === "DELIVERED") {
        updateData.deliveredAt = new Date();
      }

      const updated = await db.order.update({
        where: { id: order.id },
        data: updateData,
      });

      // Send Push Notifications if status is ON_THE_WAY
      if (status === "ON_THE_WAY") {
        try {
          const subscriptions = await db.pushSubscription.findMany({
            where: { userId: order.userId },
          });

            // Save notification to DB for history tracking (runs always)
            await db.notification.create({
              data: {
                userId: order.userId,
                title: "Order on the way! 🛵",
                body: `Your order ${order.orderNumber} is dispatched. Keep your phone handy!`,
              },
            });

            if (subscriptions.length > 0) {
              const payload = JSON.stringify({
                title: "Order on the way! 🛵",
                body: `Your order ${order.orderNumber} is dispatched. Keep your phone handy!`,
                icon: "/images/menu/burger-classic.jpg",
                url: "/orders",
              });

              // Trigger pushes asynchronously
              Promise.allSettled(
                subscriptions.map((sub) =>
                  webpush.sendNotification(
                    {
                      endpoint: sub.endpoint,
                      keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                      },
                    },
                    payload
                  ).catch(async (err) => {
                    // If subscription has expired or is invalid, delete it from the DB
                    if (err.statusCode === 410 || err.statusCode === 404) {
                      await db.pushSubscription.delete({ where: { id: sub.id } });
                    }
                  })
                )
              ).catch((err) => console.error("Error in web-push Promise:", err));
            }
        } catch (pushErr) {
          console.error("Failed to query/trigger push notifications:", pushErr);
        }
      }

      return NextResponse.json(
        apiSuccess({
          ...updated,
          subtotal: Number(updated.subtotal),
          deliveryFee: Number(updated.deliveryFee),
          discount: Number(updated.discount),
          total: Number(updated.total),
        })
      );
    } catch (error) {
      console.error("Order update error:", error);
      return NextResponse.json(apiError("Failed to update order"), { status: 500 });
    }
  }
);
