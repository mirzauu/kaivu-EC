import { NextRequest, NextResponse } from "next/server";
import { createWhatsAppLoginSession, getWhatsAppLoginSession } from "@/lib/auth/wa-session";
import { setTokenCookie } from "@/lib/auth/jwt";

/**
 * WhatsApp Login Session API
 * 
 * POST: Create a new WhatsApp login session (returns token, whatsappUrl, expiresAt)
 * GET: Poll status of an existing session by token. If VERIFIED, sets the HTTP-only cookie and returns user.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const referralCode = body?.referralCode || undefined;

    const session = await createWhatsAppLoginSession(referralCode);

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("[WhatsApp Session POST Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize WhatsApp session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing token parameter" },
        { status: 400 }
      );
    }

    const session = await getWhatsAppLoginSession(token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    if (session.status === "VERIFIED" && session.authToken) {
      // Set the HTTP-only auth cookie directly so user is immediately logged in
      await setTokenCookie(session.authToken);

      return NextResponse.json({
        success: true,
        data: {
          status: "VERIFIED",
          user: session.user,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: session.status,
      },
    });
  } catch (error) {
    console.error("[WhatsApp Session GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check session status" },
      { status: 500 }
    );
  }
}
