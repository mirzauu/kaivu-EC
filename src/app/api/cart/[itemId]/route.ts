import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * PATCH /api/cart/[menuItemId]
 * Update cart item quantity by menu item ID.
 */
export const PATCH = withAuth(
  async (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const { itemId: menuItemId } = await context!.params;
      const body = await req.json();
      const { quantity } = body;

      if (quantity === undefined || quantity < 0) {
        return NextResponse.json(
          apiError("Valid quantity is required"),
          { status: 400 }
        );
      }

      // If quantity is 0, remove the item
      if (quantity === 0) {
        await db.cartItem.deleteMany({
          where: { menuItemId, userId: req.user.userId },
        });
        return NextResponse.json(apiSuccess(null, "Item removed from cart"));
      }

      const cartItem = await db.cartItem.findFirst({
        where: { menuItemId, userId: req.user.userId },
      });

      if (!cartItem) {
        return NextResponse.json(
          apiError("Cart item not found"),
          { status: 404 }
        );
      }

      const updated = await db.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
            },
          },
        },
      });

      return NextResponse.json(
        apiSuccess({
          id: updated.menuItemId, // return menuItemId as 'id' for frontend compatibility
          name: updated.menuItem.name,
          price: Number(updated.menuItem.price),
          imageUrl: updated.menuItem.imageUrl,
          qty: updated.quantity,
        })
      );
    } catch (error) {
      console.error("Cart update error:", error);
      return NextResponse.json(
        apiError("Failed to update cart item"),
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/cart/[menuItemId]
 * Remove a specific item from the cart by menu item ID.
 */
export const DELETE = withAuth(
  async (
    req: AuthenticatedRequest,
    context?: { params: Promise<Record<string, string>> }
  ) => {
    try {
      const { itemId: menuItemId } = await context!.params;

      const deleted = await db.cartItem.deleteMany({
        where: { menuItemId, userId: req.user.userId },
      });

      if (deleted.count === 0) {
        return NextResponse.json(
          apiError("Cart item not found"),
          { status: 404 }
        );
      }

      return NextResponse.json(apiSuccess(null, "Item removed from cart"));
    } catch (error) {
      console.error("Cart delete error:", error);
      return NextResponse.json(
        apiError("Failed to remove cart item"),
        { status: 500 }
      );
    }
  }
);
