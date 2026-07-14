import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * GET /api/cart
 * Fetch the current user's cart with full item details.
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const cartItems = await db.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        menuItem: {
          select: {
            id: true,
            slug: true,
            name: true,
            price: true,
            imageUrl: true,
            isAvailable: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const items = cartItems.map((ci) => ({
      id: ci.id,
      menuItemId: ci.menuItem.id,
      slug: ci.menuItem.slug,
      name: ci.menuItem.name,
      price: Number(ci.menuItem.price),
      imageUrl: ci.menuItem.imageUrl,
      quantity: ci.quantity,
      isAvailable: ci.menuItem.isAvailable,
      lineTotal: Number(ci.menuItem.price) * ci.quantity,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return NextResponse.json(
      apiSuccess({
        items,
        subtotal,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      })
    );
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json(apiError("Failed to fetch cart"), { status: 500 });
  }
});

/**
 * POST /api/cart
 * Add an item to the cart (or increment quantity if already in cart).
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { menuItemId, quantity = 1 } = body;

    if (!menuItemId) {
      return NextResponse.json(
        apiError("menuItemId is required"),
        { status: 400 }
      );
    }

    // Verify menu item exists and is available
    const menuItem = await db.menuItem.findUnique({
      where: { id: menuItemId },
    });
    if (!menuItem || !menuItem.isAvailable) {
      return NextResponse.json(
        apiError("Menu item not found or unavailable"),
        { status: 404 }
      );
    }

    // Upsert: add or increment
    const cartItem = await db.cartItem.upsert({
      where: {
        userId_menuItemId: {
          userId: req.user.userId,
          menuItemId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: req.user.userId,
        menuItemId,
        quantity,
      },
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
        id: cartItem.id,
        menuItemId: cartItem.menuItem.id,
        name: cartItem.menuItem.name,
        price: Number(cartItem.menuItem.price),
        imageUrl: cartItem.menuItem.imageUrl,
        quantity: cartItem.quantity,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Cart add error:", error);
    return NextResponse.json(apiError("Failed to add to cart"), { status: 500 });
  }
});

/**
 * DELETE /api/cart
 * Clear the entire cart.
 */
export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    await db.cartItem.deleteMany({
      where: { userId: req.user.userId },
    });

    return NextResponse.json(apiSuccess(null, "Cart cleared"));
  } catch (error) {
    console.error("Cart clear error:", error);
    return NextResponse.json(apiError("Failed to clear cart"), { status: 500 });
  }
});
