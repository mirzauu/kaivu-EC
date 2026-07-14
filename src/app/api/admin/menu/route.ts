import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";

/**
 * POST /api/admin/menu
 * Add a new menu item (admin-only).
 */
export const POST = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    const { name, description, price, imageUrl, category, tag, rating, sortOrder } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        apiError("Name, description, price, and category are required"),
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Check for duplicate slug
    const existing = await db.menuItem.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        apiError("A menu item with this name already exists"),
        { status: 409 }
      );
    }

    const item = await db.menuItem.create({
      data: {
        slug,
        name,
        description,
        price,
        imageUrl: imageUrl || null,
        category: category.toUpperCase(),
        tag: tag || null,
        rating: rating || 5.0,
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(
      apiSuccess(
        { ...item, price: Number(item.price), rating: Number(item.rating) },
        "Menu item created"
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin menu create error:", error);
    return NextResponse.json(apiError("Failed to create menu item"), { status: 500 });
  }
});
