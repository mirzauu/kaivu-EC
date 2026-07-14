import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * GET /api/menu/[id]
 * Get a single menu item by ID or slug.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await db.menuItem.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!item) {
      return NextResponse.json(apiError("Menu item not found"), { status: 404 });
    }

    return NextResponse.json(
      apiSuccess({
        ...item,
        price: Number(item.price),
        rating: Number(item.rating),
        image: item.imageUrl,
        desc: item.description,
      })
    );
  } catch (error) {
    console.error("Menu item fetch error:", error);
    return NextResponse.json(apiError("Failed to fetch menu item"), { status: 500 });
  }
}

/**
 * PUT /api/menu/[id]
 * Update a menu item (admin-only).
 */
export const PUT = withAdmin(async (req: AuthenticatedRequest, context) => {
  try {
    const { id } = await context!.params;
    const body = await req.json();

    const item = await db.menuItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json(apiError("Menu item not found"), { status: 404 });
    }

    const updated = await db.menuItem.update({
      where: { id },
      data: {
        name: body.name ?? item.name,
        description: body.description ?? item.description,
        price: body.price ?? item.price,
        imageUrl: body.imageUrl ?? item.imageUrl,
        category: body.category ?? item.category,
        tag: body.tag !== undefined ? body.tag : item.tag,
        rating: body.rating ?? item.rating,
        isAvailable: body.isAvailable ?? item.isAvailable,
        sortOrder: body.sortOrder ?? item.sortOrder,
      },
    });

    return NextResponse.json(
      apiSuccess({
        ...updated,
        price: Number(updated.price),
        rating: Number(updated.rating),
      })
    );
  } catch (error) {
    console.error("Menu update error:", error);
    return NextResponse.json(apiError("Failed to update menu item"), { status: 500 });
  }
});

/**
 * DELETE /api/menu/[id]
 * Delete a menu item (admin-only). Soft-deletes by setting isAvailable = false.
 */
export const DELETE = withAdmin(async (_req: AuthenticatedRequest, context) => {
  try {
    const { id } = await context!.params;

    const item = await db.menuItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json(apiError("Menu item not found"), { status: 404 });
    }

    // Soft delete
    await db.menuItem.update({
      where: { id },
      data: { isAvailable: false },
    });

    return NextResponse.json(apiSuccess(null, "Menu item deleted"));
  } catch (error) {
    console.error("Menu delete error:", error);
    return NextResponse.json(apiError("Failed to delete menu item"), { status: 500 });
  }
});
