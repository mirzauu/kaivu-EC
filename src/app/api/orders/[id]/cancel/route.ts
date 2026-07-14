import { NextResponse } from "next/server";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { cancelOrder } from "@/lib/services/order-service";

/**
 * POST /api/orders/[id]/cancel
 * Cancel an order and refund coins.
 */
export const POST = withAuth(
  async (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const { id } = await context!.params;

      const result = await cancelOrder(id, req.user.userId);

      return NextResponse.json(
        apiSuccess(result, "Order cancelled successfully")
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to cancel order";
      console.error("Order cancel error:", error);
      return NextResponse.json(apiError(message), { status: 400 });
    }
  }
);
