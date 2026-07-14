import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signToken, setTokenCookie } from "@/lib/auth/jwt";
import { apiError, apiSuccess } from "@/lib/api-utils";

/**
 * POST /api/auth/admin-login
 * Direct login for admin user using username/password.
 * Sets the real JWT cookie so the middleware allows access to /csuite.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (username !== "admin" || password !== "admin") {
      return NextResponse.json(
        apiError("Invalid admin credentials"),
        { status: 401 }
      );
    }

    // Find the admin user from database (seeded in Phase 1)
    let admin = await db.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!admin) {
      return NextResponse.json(
        apiError("Admin account not found in database. Run seed script."),
        { status: 500 }
      );
    }

    // Sign JWT
    const token = await signToken({
      userId: admin.id,
      phone: admin.phone,
      role: admin.role,
    });

    // Set cookie
    await setTokenCookie(token);

    // Save session
    await db.session.create({
      data: {
        userId: admin.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return NextResponse.json(
      apiSuccess({
        user: {
          id: admin.id,
          phone: admin.phone,
          name: admin.name,
          role: admin.role,
        },
      }, "Admin authenticated successfully")
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(apiError("Authentication failed"), { status: 500 });
  }
}
