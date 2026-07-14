import { db } from "@/lib/db";
import { generateReferralCode } from "@/lib/api-utils";

/**
 * Get referral stats for a user.
 */
export async function getReferralStats(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  if (!user) throw new Error("User not found");

  const [totalReferrals, completedReferrals, totalCoinsEarned] =
    await Promise.all([
      db.referral.count({ where: { referrerId: userId } }),
      db.referral.count({
        where: { referrerId: userId, status: "REWARDED" },
      }),
      db.coinTransaction.aggregate({
        where: { userId, type: "REFERRAL_BONUS" },
        _sum: { amount: true },
      }),
    ]);

  // Recent referrals with user details
  const recentReferrals = await db.referral.findMany({
    where: { referrerId: userId },
    include: {
      referred: {
        select: { name: true, phone: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    referralCode: user.referralCode,
    stats: {
      totalReferrals,
      completedReferrals,
      pendingReferrals: totalReferrals - completedReferrals,
      totalCoinsEarned: totalCoinsEarned._sum.amount || 0,
    },
    recentReferrals: recentReferrals.map((r) => ({
      id: r.id,
      referredName: r.referred.name || "New User",
      referredPhone: r.referred.phone.replace(/(\+\d{2})\d{6}(\d{4})/, "$1******$2"), // mask phone
      status: r.status,
      coinsAwarded: r.referrerCoinsAwarded,
      completedAt: r.completedAt,
      createdAt: r.createdAt,
    })),
  };
}

/**
 * Validate a referral code.
 */
export async function validateReferralCode(
  code: string,
  currentUserId?: string
) {
  const referrer = await db.user.findUnique({
    where: { referralCode: code },
    select: { id: true, name: true },
  });

  if (!referrer) {
    return { valid: false, error: "Invalid referral code" };
  }

  // Prevent self-referral
  if (currentUserId && referrer.id === currentUserId) {
    return { valid: false, error: "Cannot use your own referral code" };
  }

  return {
    valid: true,
    referrer: {
      id: referrer.id,
      name: referrer.name || "Kaivu User",
    },
  };
}

/**
 * Regenerate a user's referral code (if they want a custom one).
 */
export async function regenerateReferralCode(userId: string) {
  let newCode = generateReferralCode();
  let exists = await db.user.findUnique({ where: { referralCode: newCode } });
  while (exists) {
    newCode = generateReferralCode();
    exists = await db.user.findUnique({ where: { referralCode: newCode } });
  }

  await db.user.update({
    where: { id: userId },
    data: { referralCode: newCode },
  });

  return newCode;
}
