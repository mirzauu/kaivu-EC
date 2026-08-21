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

    const { name, description, desc, price, imageUrl, image, videoUrl, category, tag, rating, sortOrder, isComingSoon, isFeatured } = body;
    const finalDescription = description || desc;

    if (!name || !finalDescription || price === undefined || !category) {
      return NextResponse.json(
        apiError("Name, description, price, and category are required"),
        { status: 400 }
      );
    }

    // Generate slug from name
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await db.menuItem.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const item = await db.menuItem.create({
      data: {
        slug,
        name,
        description: finalDescription,
        price,
        imageUrl: imageUrl || image || null,
        videoUrl: videoUrl || null,
        category: category.toUpperCase(),
        tag: tag || null,
        rating: rating || 5.0,
        isComingSoon: Boolean(isComingSoon) || tag?.toLowerCase() === "coming soon",
        isFeatured: Boolean(isFeatured),
        sortOrder: sortOrder || 0,
      },
    });

    return NextResponse.json(
      apiSuccess(
        {
          ...item,
          price: Number(item.price),
          rating: Number(item.rating),
          image: item.imageUrl,
          imageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          desc: item.description,
          isComingSoon: Boolean((item as any).isComingSoon) || item.tag?.toLowerCase() === "coming soon",
          isFeatured: Boolean((item as any).isFeatured),
        },
        "Menu item created"
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin menu create error:", error);
    return NextResponse.json(apiError("Failed to create menu item"), { status: 500 });
  }
});
