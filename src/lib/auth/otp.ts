import { db } from "@/lib/db";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

/**
 * Generate a random 4-digit OTP.
 * In development mode, always returns "1234" for easy testing.
 */
function generateOtpCode(): string {
  if (process.env.NODE_ENV === "development") {
    return "1234";
  }
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Create and store a new OTP for the given phone number.
 * Invalidates any existing unused OTPs for that phone.
 */
export async function createOtp(phone: string): Promise<{ code: string }> {
  // Expire all previous OTPs for this phone
  await db.otpCode.updateMany({
    where: { phone, verified: false },
    data: { verified: true }, // mark as consumed so they can't be used
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.otpCode.create({
    data: {
      phone,
      code,
      expiresAt,
    },
  });

  // TODO: In production, send OTP via SMS provider (Twilio/MSG91)
  // For now, log it in development
  if (process.env.NODE_ENV === "development") {
    console.log(`📱 OTP for ${phone}: ${code}`);
  }

  return { code };
}

/**
 * Verify an OTP code for the given phone number.
 * Returns true if valid, false otherwise.
 */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<{ valid: boolean; error?: string }> {
  const otpRecord = await db.otpCode.findFirst({
    where: {
      phone,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    return { valid: false, error: "OTP expired or not found. Please request a new one." };
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    return { valid: false, error: "Too many attempts. Please request a new OTP." };
  }

  // Increment attempt counter
  await db.otpCode.update({
    where: { id: otpRecord.id },
    data: { attempts: { increment: 1 } },
  });

  if (otpRecord.code !== code) {
    return { valid: false, error: "Invalid OTP. Please try again." };
  }

  // Mark as verified
  await db.otpCode.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  return { valid: true };
}
