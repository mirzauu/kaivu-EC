import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-utils";

/**
 * PATCH /api/user/profile
 * Update user profile details (like name)
 */
export const PATCH = withAuth(async (req) => {
  try {
    const userId = req.user.userId;
    const body = await req.json();

    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(apiError("Name must be a valid string"), { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { name: body.name.trim() },
      select: {
        id: true,
        name: true,
      }
    });

    return NextResponse.json(apiSuccess({ user: updatedUser }));
  } catch (error) {
    console.error("PATCH profile error:", error);
    return NextResponse.json(apiError("Failed to update profile"), { status: 500 });
  }
});
