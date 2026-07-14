import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/auth/otp";
import { normalizePhone, isValidPhone, apiError, apiSuccess } from "@/lib/api-utils";

/**
 * POST /api/auth/send-otp
 * Send an OTP to the given phone number.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(apiError("Phone number is required"), { status: 400 });
    }

    const normalized = normalizePhone(phone);

    if (!isValidPhone(normalized)) {
      return NextResponse.json(
        apiError("Invalid phone number format"),
        { status: 400 }
      );
    }

    await createOtp(normalized);

    return NextResponse.json(
      apiSuccess({ phone: normalized }, "OTP sent successfully")
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      apiError("Failed to send OTP"),
      { status: 500 }
    );
  }
}
