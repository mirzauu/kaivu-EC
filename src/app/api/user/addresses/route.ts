import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

/**
 * GET /api/user/addresses
 * List all saved addresses for the authenticated user.
 */
export const GET = withAuth(async (req) => {
  try {
    const userId = req.user.userId;

    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apiSuccess(addresses));
  } catch (error) {
    console.error("GET addresses error:", error);
    return NextResponse.json(apiError("Failed to fetch addresses"), { status: 500 });
  }
});

/**
 * POST /api/user/addresses
 * Create a new address for the authenticated user.
 */
export const POST = withAuth(async (req) => {
  try {
    const userId = req.user.userId;
    const body = await req.json();

    const { name, label, fullAddress, city, pincode, lat, lng, isDefault } = body;

    if (!label || !fullAddress) {
      return NextResponse.json(
        apiError("Label and Full Address are required fields"),
        { status: 400 }
      );
    }

    // Check if user has any existing addresses
    const addressCount = await db.address.count({
      where: { userId },
    });

    // If this is the user's first address, force it to be default
    const shouldBeDefault = addressCount === 0 ? true : !!isDefault;

    // If making this address default, unset any other default addresses
    if (shouldBeDefault) {
      await db.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const newAddress = await db.address.create({
      data: {
        userId,
        name: name || null,
        label,
        fullAddress,
        city: city || null,
        pincode: pincode || null,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        isDefault: shouldBeDefault,
      },
    });

    return NextResponse.json(apiSuccess(newAddress));
  } catch (error) {
    console.error("POST addresses error:", error);
    return NextResponse.json(apiError("Failed to save address"), { status: 500 });
  }
});

/**
 * DELETE /api/user/addresses
 * Delete a specific address for the authenticated user.
 */
export const DELETE = withAuth(async (req) => {
  try {
    const userId = req.user.userId;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(apiError("Address ID is required"), { status: 400 });
    }

    // Verify ownership and delete
    const address = await db.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      return NextResponse.json(apiError("Address not found or unauthorized"), { status: 404 });
    }

    await db.address.delete({
      where: { id },
    });

    // If we deleted the default address, set another address as default
    if (address.isDefault) {
      const nextAddress = await db.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });

      if (nextAddress) {
        await db.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json(apiSuccess({ success: true }));
  } catch (error) {
    console.error("DELETE address error:", error);
    return NextResponse.json(apiError("Failed to delete address"), { status: 500 });
  }
});
