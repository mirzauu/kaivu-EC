import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppLoginSession } from "@/lib/auth/wa-session";
import { setTokenCookie } from "@/lib/auth/jwt";

/**
 * Magic Link Callback Endpoint
 * When user taps the link sent back in WhatsApp:
 * https://kaivu.co/api/auth/magic-link?token=KV-XXXX
 * It logs them in on whatever browser opens it and redirects to homepage.
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  const baseUrl = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || "https://kaivu.co";

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/?auth=error&reason=missing_token`);
  }

  try {
    const session = await getWhatsAppLoginSession(token);

    if (!session || session.status !== "VERIFIED" || !session.authToken) {
      return NextResponse.redirect(`${baseUrl}/?auth=error&reason=invalid_or_expired`);
    }

    // Set auth cookie
    await setTokenCookie(session.authToken);

    // Redirect to home with logged_in query param so frontend can sync state
    return NextResponse.redirect(`${baseUrl}/?auth=success`);
  } catch (error) {
    console.error("[Magic Link Error]:", error);
    return NextResponse.redirect(`${baseUrl}/?auth=error&reason=server_error`);
  }
}
