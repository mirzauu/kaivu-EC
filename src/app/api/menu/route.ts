import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

/**
 * GET /api/menu
 * Fetch all available menu items.
 * Supports ?category= filter.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get("category");

    const where: Record<string, unknown> = { isAvailable: true };
    if (category && category !== "All") {
      where.category = category.toUpperCase();
    }

    const items = await db.menuItem.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const serialized = items.map((item) => ({
      ...item,
      price: Number(item.price),
      rating: Number(item.rating),
      image: item.imageUrl,
      desc: item.description,
    }));

    return NextResponse.json(apiSuccess(serialized));
  } catch (error) {
    console.error("Menu fetch error:", error);
    return NextResponse.json(apiError("Failed to fetch menu"), { status: 500 });
  }
}
