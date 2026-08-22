import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/admin/orders/bulk-delete
 * Bulk delete multiple orders and their entire history (admin-only).
 * Accepts: { orderIds: string[] } where orderIds can be UUIDs or order numbers (KV-XXXX).
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { orderIds } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        apiError("Please provide an array of orderIds to delete"),
        { status: 400 }
      );
    }

    // Separate valid UUIDs and order number strings to avoid Postgres UUID cast errors
    const validUuids = orderIds.filter((id) => typeof id === "string" && UUID_REGEX.test(id));
    const orderNumbers = orderIds.filter((id) => typeof id === "string" && !UUID_REGEX.test(id));

    const orClauses: Array<{ id?: { in: string[] }; orderNumber?: { in: string[] } }> = [];
    if (validUuids.length > 0) {
      orClauses.push({ id: { in: validUuids } });
    }
    if (orderNumbers.length > 0) {
      orClauses.push({ orderNumber: { in: orderNumbers } });
    }

    if (orClauses.length === 0) {
      return NextResponse.json(
        apiError("No valid order identifiers provided"),
        { status: 400 }
      );
    }

    // Resolve all matching order IDs from database
    const orders = await db.order.findMany({
      where: {
        OR: orClauses,
      },
      select: { id: true, orderNumber: true },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        apiError("No matching orders found to delete"),
        { status: 404 }
      );
    }

    const resolvedIds = orders.map((o) => o.id);

    // Perform atomic bulk deletion
    await db.$transaction(async (tx) => {
      // 1. Unlink any user rewards associated with these orders
      await tx.userReward.updateMany({
        where: { redeemedOnOrder: { in: resolvedIds } },
        data: { redeemedOnOrder: null },
      });

      // 2. Delete all order items
      await tx.orderItem.deleteMany({
        where: { orderId: { in: resolvedIds } },
      });

      // 3. Delete the orders
      await tx.order.deleteMany({
        where: { id: { in: resolvedIds } },
      });
    });

    return NextResponse.json(
      apiSuccess(
        { count: resolvedIds.length },
        `Successfully deleted ${resolvedIds.length} order(s) and their full history.`
      )
    );
  } catch (error) {
    console.error("Bulk order deletion error:", error);
    return NextResponse.json(
      apiError("Failed to bulk delete orders"),
      { status: 500 }
    );
  }
});
