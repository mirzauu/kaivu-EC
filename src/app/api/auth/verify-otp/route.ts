import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otp";
import { signToken, setTokenCookie } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import {
  normalizePhone,
  isValidPhone,
  generateReferralCode,
  apiError,
  apiSuccess,
} from "@/lib/api-utils";
import { getSettingNumber } from "@/lib/services/settings-service";

/**
 * POST /api/auth/verify-otp
 * Verify OTP and authenticate user.
 * Creates user on first login (phone-based registration).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, referralCode } = body;

    if (!phone || !code) {
      return NextResponse.json(
        apiError("Phone and OTP code are required"),
        { status: 400 }
      );
    }

    const normalized = normalizePhone(phone);

    if (!isValidPhone(normalized)) {
      return NextResponse.json(
        apiError("Invalid phone number format"),
        { status: 400 }
      );
    }

    // Verify OTP
    const result = await verifyOtp(normalized, code);
    if (!result.valid) {
      return NextResponse.json(apiError(result.error!), { status: 401 });
    }

    // Find or create user
    let user = await db.user.findUnique({ where: { phone: normalized } });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;

      // Generate unique referral code
      let userReferralCode = generateReferralCode();
      let codeExists = await db.user.findUnique({
        where: { referralCode: userReferralCode },
      });
      while (codeExists) {
        userReferralCode = generateReferralCode();
        codeExists = await db.user.findUnique({
          where: { referralCode: userReferralCode },
        });
      }

      // Handle referral: find the referrer
      let referredById: string | undefined;
      if (referralCode) {
        const referrer = await db.user.findUnique({
          where: { referralCode: referralCode },
        });
        if (referrer) {
          referredById = referrer.id;
        }
      }

      // Get signup bonus from dynamic settings
      const signupBonus = await getSettingNumber("signup_bonus_coins", 50);

      user = await db.user.create({
        data: {
          phone: normalized,
          referralCode: userReferralCode,
          referredById: referredById,
          kaivuCoins: signupBonus,
        },
      });

      // Record signup bonus coin transaction
      if (signupBonus > 0) {
        await db.coinTransaction.create({
          data: {
            userId: user.id,
            amount: signupBonus,
            type: "SIGNUP_BONUS",
            description: `Welcome bonus: +${signupBonus} Kaivu coins`,
          },
        });
      }

      // Create referral record if applicable
      if (referredById) {
        await db.referral.create({
          data: {
            referrerId: referredById,
            referredId: user.id,
            status: "PENDING", // becomes COMPLETED when first order is placed
          },
        });
      }
    }

    // Generate JWT
    const token = await signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    });

    // Set HTTP-only cookie
    await setTokenCookie(token);

    // Store session
    await db.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return NextResponse.json(
      apiSuccess(
        {
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            referralCode: user.referralCode,
            kaivuCoins: user.kaivuCoins,
            walletBalance: user.walletBalance,
            role: user.role,
            isNewUser,
          },
        },
        isNewUser ? "Account created successfully" : "Login successful"
      )
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      apiError("Verification failed"),
      { status: 500 }
    );
  }
}
