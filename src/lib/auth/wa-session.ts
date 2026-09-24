import { db } from "@/lib/db";
import { signToken } from "@/lib/auth/jwt";
import { normalizePhone, generateReferralCode } from "@/lib/api-utils";
import { getSettingNumber } from "@/lib/services/settings-service";
import { sendWhatsAppTextMessage } from "@/lib/whatsapp/client";

// In-memory fallback session store with auto-cleanup (in case database table is unavailable)
interface MemorySession {
  token: string;
  phone?: string;
  status: "PENDING" | "VERIFIED" | "EXPIRED";
  referralCode?: string;
  userId?: string;
  authToken?: string;
  user?: any;
  expiresAt: Date;
  createdAt: Date;
}

const memorySessions = new Map<string, MemorySession>();

// Cleanup expired sessions every minute
setInterval(() => {
  const now = new Date();
  for (const [token, sess] of memorySessions.entries()) {
    if (sess.expiresAt < now) {
      memorySessions.delete(token);
    }
  }
}, 60 * 1000);

export function generateLoginToken(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "KV-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Creates a new pending WhatsApp login session
 */
export async function createWhatsAppLoginSession(referralCode?: string): Promise<{
  token: string;
  whatsappUrl: string;
  expiresAt: Date;
}> {
  const token = generateLoginToken();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Store in memory cache for immediate sub-second polling
  memorySessions.set(token, {
    token,
    status: "PENDING",
    referralCode,
    expiresAt,
    createdAt: new Date(),
  });

  // Try persisting to DB asynchronously if table exists
  try {
    if ((db as any).whatsAppLoginSession) {
      await (db as any).whatsAppLoginSession.create({
        data: {
          token,
          status: "PENDING",
          referralCode,
          expiresAt,
        },
      });
    }
  } catch (err) {
    // Graceful fallback to memory store
    console.warn("[WhatsApp Auth] DB save failed, operating in high-performance memory mode:", err);
  }

  const botNumber = (
    process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER ||
    process.env.WHATSAPP_PHONE_NUMBER_ID ||
    "919995939334"
  ).replace(/\D/g, "");

  const messageText = `LOGIN ${token}`;
  const encodedText = encodeURIComponent(messageText);

  // Both api.whatsapp.com and wa.me formats work across Desktop, Web, Android and iOS
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${botNumber}&text=${encodedText}`;

  return {
    token,
    whatsappUrl,
    expiresAt,
  };
}

/**
 * Checks the status of a WhatsApp login session
 */
export async function getWhatsAppLoginSession(token: string): Promise<{
  status: "PENDING" | "VERIFIED" | "EXPIRED";
  user?: any;
  authToken?: string;
} | null> {
  const upperToken = token.toUpperCase().trim();

  // 1. Check DB first so cross-process updates (e.g. from Baileys WhatsApp service on VM) are instantly detected
  try {
    if ((db as any).whatsAppLoginSession) {
      const dbSess = await (db as any).whatsAppLoginSession.findUnique({
        where: { token: upperToken },
      });
      if (dbSess) {
        if (new Date() > dbSess.expiresAt) {
          return { status: "EXPIRED" };
        }

        let user = null;
        if (dbSess.userId) {
          user = await db.user.findUnique({
            where: { id: dbSess.userId },
            include: { addresses: true },
          });
        }

        // Keep local memory store in sync
        const memory = memorySessions.get(upperToken);
        if (memory) {
          memory.status = dbSess.status as any;
          memory.authToken = dbSess.authToken || undefined;
          memory.user = user;
        }

        return {
          status: dbSess.status as any,
          user,
          authToken: dbSess.authToken || undefined,
        };
      }
    }
  } catch (err) {
    console.error("[WhatsApp Auth] DB lookup error:", err);
  }

  // 2. Fallback to in-memory store
  const memory = memorySessions.get(upperToken);
  if (memory) {
    if (new Date() > memory.expiresAt) {
      memory.status = "EXPIRED";
      return { status: "EXPIRED" };
    }
    return {
      status: memory.status,
      user: memory.user,
      authToken: memory.authToken,
    };
  }

  return null;
}

/**
 * Called by incoming WhatsApp webhook when a user sends "LOGIN KV-XXXX"
 */
export async function verifyWhatsAppLoginMessage(
  incomingPhone: string,
  token: string
): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  const upperToken = token.toUpperCase().trim();
  const normalizedPhone = normalizePhone(incomingPhone);

  const memory = memorySessions.get(upperToken);
  let dbSess = null;

  try {
    if ((db as any).whatsAppLoginSession) {
      dbSess = await (db as any).whatsAppLoginSession.findUnique({
        where: { token: upperToken },
      });
    }
  } catch (e) {
    console.warn("[WhatsApp Auth] Failed to check db session:", e);
  }

  // Validate session exists and not expired
  if (!memory && !dbSess) {
    return { success: false, error: "Session not found" };
  }

  const expiresAt = memory?.expiresAt || dbSess?.expiresAt;
  if (expiresAt && new Date() > new Date(expiresAt)) {
    return { success: false, error: "Session expired" };
  }

  const referralCode = memory?.referralCode || dbSess?.referralCode;

  // Find or create User by phone
  let user = await db.user.findUnique({
    where: { phone: normalizedPhone },
    include: { addresses: true },
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;

    // Generate unique referral code
    let userReferralCode = generateReferralCode();
    let codeExists = await db.user.findUnique({ where: { referralCode: userReferralCode } });
    while (codeExists) {
      userReferralCode = generateReferralCode();
      codeExists = await db.user.findUnique({ where: { referralCode: userReferralCode } });
    }

    // Check referral
    let referrerId: string | null = null;
    let initialCoins = 0;

    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode } });
      if (referrer) {
        referrerId = referrer.id;
        initialCoins = await getSettingNumber("referral_bonus_referee", 25);
      }
    }

    user = await db.user.create({
      data: {
        phone: normalizedPhone,
        referralCode: userReferralCode,
        referredById: referrerId,
        kaivuCoins: initialCoins,
      },
      include: { addresses: true },
    });

    if (initialCoins > 0 && referrerId) {
      await db.coinTransaction.create({
        data: {
          userId: user.id,
          amount: initialCoins,
          type: "SIGNUP_BONUS",
          description: `Welcome bonus from referral code ${referralCode}`,
        },
      });

      const referrerBonus = await getSettingNumber("referral_bonus_referrer", 50);
      await db.user.update({
        where: { id: referrerId },
        data: { kaivuCoins: { increment: referrerBonus } },
      });

      await db.coinTransaction.create({
        data: {
          userId: referrerId,
          amount: referrerBonus,
          type: "REFERRAL_BONUS",
          description: `Referral bonus — ${normalizedPhone} joined using your code`,
        },
      });
    }
  }

  // Issue JWT Token
  const jwtToken = await signToken({
    userId: user.id,
    phone: user.phone,
    role: user.role,
  });

  // Update memory session
  if (memory) {
    memory.status = "VERIFIED";
    memory.phone = normalizedPhone;
    memory.userId = user.id;
    memory.authToken = jwtToken;
    memory.user = user;
  }

  // Update DB session if available
  try {
    if ((db as any).whatsAppLoginSession) {
      await (db as any).whatsAppLoginSession.update({
        where: { token: upperToken },
        data: {
          status: "VERIFIED",
          phone: normalizedPhone,
          userId: user.id,
          authToken: jwtToken,
        },
      });
    }
  } catch (err) {
    console.warn("[WhatsApp Auth] DB session update skipped:", err);
  }

  // Send WhatsApp confirmation back to the user
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kaivu.co";
  const magicLink = `${appUrl}/api/auth/magic-link?token=${upperToken}`;

  const welcomeMessage = isNewUser
    ? `*kaivu.*\n\nWelcome! You're logged in ✅\n\nTap to continue: ${magicLink}`
    : `*kaivu.*\n\nWelcome back! You're logged in ✅\n\nTap to continue: ${magicLink}`;

  sendWhatsAppTextMessage(normalizedPhone, welcomeMessage).catch((e) =>
    console.error("[WhatsApp Auth] Confirmation send failed:", e)
  );

  return {
    success: true,
    user,
  };
}
