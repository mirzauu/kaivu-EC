import { db } from "@/lib/db";
import { getSettingNumber } from "@/lib/services/settings-service";

/**
 * Get available rewards for a user, including unlock status.
 */
export async function getAvailableRewards(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { kaivuCoins: true },
  });

  if (!user) throw new Error("User not found");

  const rewards = await db.reward.findMany({
    where: {
      isActive: true,
      OR: [
        { validUntil: null },
        { validUntil: { gt: new Date() } },
      ],
    },
    orderBy: { pointsRequired: "asc" },
  });

  // Check which rewards the user has already claimed
  const claimedRewards = await db.userReward.findMany({
    where: { userId, status: { in: ["AVAILABLE", "REDEEMED"] } },
    select: { rewardId: true, status: true },
  });

  const claimedMap = new Map(
    claimedRewards.map((cr) => [cr.rewardId, cr.status])
  );

  return rewards.map((reward) => ({
    id: reward.id,
    name: reward.name,
    description: reward.description,
    type: reward.type,
    pointsRequired: reward.pointsRequired,
    value: Number(reward.value),
    isUnlocked: user.kaivuCoins >= reward.pointsRequired,
    isClaimed: claimedMap.has(reward.id),
    claimStatus: claimedMap.get(reward.id) || null,
    userCoins: user.kaivuCoins,
  }));
}

/**
 * Redeem a reward — deduct coins, create user_reward entry.
 */
export async function redeemReward(userId: string, rewardId: string) {
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { kaivuCoins: true },
    });

    if (!user) throw new Error("User not found");

    const reward = await tx.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      throw new Error("Reward not found or inactive");
    }

    if (user.kaivuCoins < reward.pointsRequired) {
      throw new Error(
        `Not enough coins. You have ${user.kaivuCoins}, need ${reward.pointsRequired}`
      );
    }

    // Check if already claimed
    const existing = await tx.userReward.findFirst({
      where: { userId, rewardId, status: "AVAILABLE" },
    });
    if (existing) {
      throw new Error("You already have this reward available");
    }

    // Deduct coins
    await tx.user.update({
      where: { id: userId },
      data: { kaivuCoins: { decrement: reward.pointsRequired } },
    });

    // Record coin transaction
    await tx.coinTransaction.create({
      data: {
        userId,
        amount: -reward.pointsRequired,
        type: "REWARD_REDEEM",
        description: `Redeemed "${reward.name}" for ${reward.pointsRequired} coins`,
        referenceId: rewardId,
      },
    });

    // Create user reward
    const userReward = await tx.userReward.create({
      data: {
        userId,
        rewardId,
        status: "AVAILABLE",
      },
      include: { reward: true },
    });

    return {
      userReward: {
        ...userReward,
        reward: {
          ...userReward.reward,
          value: Number(userReward.reward.value),
        },
      },
      remainingCoins: user.kaivuCoins - reward.pointsRequired,
    };
  });
}

/**
 * Get a user's loyalty progress (orders this month for free burger).
 */
export async function getLoyaltyProgress(userId: string) {
  const target = await getSettingNumber("loyalty_orders_for_free_burger", 8);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const ordersThisMonth = await db.order.count({
    where: {
      userId,
      status: { not: "CANCELLED" },
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    current: Math.min(ordersThisMonth, target),
    target,
    isComplete: ordersThisMonth >= target,
    remaining: Math.max(0, target - ordersThisMonth),
  };
}
