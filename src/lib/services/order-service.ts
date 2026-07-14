import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/api-utils";
import { getSettingNumber } from "@/lib/services/settings-service";
import { Prisma } from "@prisma/client";

/**
 * Place a new order from the user's cart.
 * All operations happen in a single Prisma transaction:
 * 1. Validate cart items
 * 2. Calculate totals (with dynamic settings)
 * 3. Apply coin redemption if requested
 * 4. Create order + order items
 * 5. Award coins (dynamic rate from settings)
 * 6. Clear cart
 * 7. Handle referral bonus if first order
 */
export async function placeOrder(params: {
  userId: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  redeemCoins?: number; // number of coins to redeem
}) {
  const { userId, deliveryAddress, paymentMethod, redeemCoins = 0 } = params;

  return db.$transaction(async (tx) => {
    // 1. Fetch cart items with menu item details
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { menuItem: true },
    });

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Validate all items are available
    const unavailable = cartItems.filter((ci) => !ci.menuItem.isAvailable);
    if (unavailable.length > 0) {
      throw new Error(
        `These items are no longer available: ${unavailable.map((u) => u.menuItem.name).join(", ")}`
      );
    }

    // 2. Calculate totals
    const subtotal = cartItems.reduce(
      (sum, ci) => sum + Number(ci.menuItem.price) * ci.quantity,
      0
    );

    // Get dynamic delivery fee and threshold from settings
    const deliveryFeeAmount = await getSettingNumber("delivery_fee", 29);
    const freeDeliveryThreshold = await getSettingNumber("free_delivery_threshold", 500);
    const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : deliveryFeeAmount;

    // 3. Handle coin redemption
    let coinDiscount = 0;
    let actualCoinsRedeemed = 0;

    if (redeemCoins > 0) {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { kaivuCoins: true },
      });

      if (!user) throw new Error("User not found");

      const minRedeem = await getSettingNumber("coin_min_redeem", 100);
      const maxRedeemPercent = await getSettingNumber("coin_max_redeem_percent", 50);
      const redemptionRate = await getSettingNumber("coin_redemption_rate", 10);

      // Can't redeem more than user has
      actualCoinsRedeemed = Math.min(redeemCoins, user.kaivuCoins);

      // Must meet minimum threshold
      if (actualCoinsRedeemed < minRedeem) {
        actualCoinsRedeemed = 0;
      }

      if (actualCoinsRedeemed > 0) {
        // Convert coins to ₹ discount (dynamic rate)
        coinDiscount = (actualCoinsRedeemed / 100) * redemptionRate;

        // Cap at max percentage of order
        const maxDiscount = (subtotal * maxRedeemPercent) / 100;
        if (coinDiscount > maxDiscount) {
          coinDiscount = maxDiscount;
          // Recalculate coins needed for this capped discount
          actualCoinsRedeemed = Math.ceil((coinDiscount / redemptionRate) * 100);
        }
      }
    }

    const total = subtotal + deliveryFee - coinDiscount;

    // 4. Generate unique order number
    let orderNumber = generateOrderNumber();
    let existingOrder = await tx.order.findUnique({
      where: { orderNumber },
    });
    while (existingOrder) {
      orderNumber = generateOrderNumber();
      existingOrder = await tx.order.findUnique({
        where: { orderNumber },
      });
    }

    // 5. Calculate coins earned (dynamic rate from settings)
    const coinEarnRate = await getSettingNumber("coin_earn_rate_percent", 10);
    const coinsEarned = Math.floor((total * coinEarnRate) / 100);

    // 6. Create order
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId,
        subtotal: new Prisma.Decimal(subtotal),
        deliveryFee: new Prisma.Decimal(deliveryFee),
        discount: new Prisma.Decimal(coinDiscount),
        total: new Prisma.Decimal(total),
        coinsEarned,
        coinsRedeemed: actualCoinsRedeemed,
        status: "CONFIRMED",
        deliveryAddress,
        paymentMethod: paymentMethod || "WALLET",
        estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000), // 30 min ETA
      },
    });

    if (deliveryAddress) {
      const existingAddress = await tx.address.findFirst({
        where: { userId, fullAddress: deliveryAddress },
      });
      if (!existingAddress) {
        const addressCount = await tx.address.count({ where: { userId } });
        await tx.address.create({
          data: {
            userId,
            fullAddress: deliveryAddress,
            label: "Home",
            isDefault: addressCount === 0,
          }
        });
      }
    }

    // 7. Create order items (snapshot item details at order time)
    await tx.orderItem.createMany({
      data: cartItems.map((ci) => ({
        orderId: order.id,
        menuItemId: ci.menuItem.id,
        itemName: ci.menuItem.name,
        itemPrice: ci.menuItem.price,
        quantity: ci.quantity,
        lineTotal: new Prisma.Decimal(
          Number(ci.menuItem.price) * ci.quantity
        ),
      })),
    });

    // 8. Update user's coin balance
    const netCoinChange = coinsEarned - actualCoinsRedeemed;
    await tx.user.update({
      where: { id: userId },
      data: { kaivuCoins: { increment: netCoinChange } },
    });

    // 9. Record coin transactions
    if (coinsEarned > 0) {
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: coinsEarned,
          type: "ORDER_EARN",
          description: `Earned ${coinsEarned} coins from order ${orderNumber}`,
          referenceId: order.id,
        },
      });
    }

    if (actualCoinsRedeemed > 0) {
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -actualCoinsRedeemed,
          type: "REWARD_REDEEM",
          description: `Redeemed ${actualCoinsRedeemed} coins on order ${orderNumber} (₹${coinDiscount.toFixed(2)} discount)`,
          referenceId: order.id,
        },
      });
    }

    // 10. Clear cart
    await tx.cartItem.deleteMany({ where: { userId } });

    // 11. Handle referral bonus (first order only)
    const orderCount = await tx.order.count({
      where: { userId, status: { not: "CANCELLED" } },
    });

    if (orderCount === 1) {
      // This is the user's first order — check for pending referral
      const referral = await tx.referral.findFirst({
        where: { referredId: userId, status: "PENDING" },
      });

      if (referral) {
        const referrerBonus = await getSettingNumber("referral_bonus_referrer", 100);
        const referredBonus = await getSettingNumber("referral_bonus_referred", 50);

        // Award referrer
        await tx.user.update({
          where: { id: referral.referrerId },
          data: { kaivuCoins: { increment: referrerBonus } },
        });
        await tx.coinTransaction.create({
          data: {
            userId: referral.referrerId,
            amount: referrerBonus,
            type: "REFERRAL_BONUS",
            description: `Referral bonus: +${referrerBonus} coins (referred user placed first order)`,
            referenceId: userId,
          },
        });

        // Award referred user
        await tx.user.update({
          where: { id: userId },
          data: { kaivuCoins: { increment: referredBonus } },
        });
        await tx.coinTransaction.create({
          data: {
            userId,
            amount: referredBonus,
            type: "REFERRAL_BONUS",
            description: `Referral bonus: +${referredBonus} coins (first order via referral)`,
            referenceId: referral.referrerId,
          },
        });

        // Update referral status
        await tx.referral.update({
          where: { id: referral.id },
          data: {
            status: "REWARDED",
            referrerCoinsAwarded: referrerBonus,
            referredCoinsAwarded: referredBonus,
            completedAt: new Date(),
          },
        });
      }
    }

    // Fetch the complete order with items
    const completeOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: {
        items: true,
      },
    });

    return {
      order: {
        ...completeOrder!,
        subtotal: Number(completeOrder!.subtotal),
        deliveryFee: Number(completeOrder!.deliveryFee),
        discount: Number(completeOrder!.discount),
        total: Number(completeOrder!.total),
        items: completeOrder!.items.map((item) => ({
          ...item,
          itemPrice: Number(item.itemPrice),
          lineTotal: Number(item.lineTotal),
        })),
      },
      coinsEarned,
      coinsRedeemed: actualCoinsRedeemed,
      coinDiscount,
    };
  });
}

/**
 * Cancel an order and refund coins.
 */
export async function cancelOrder(orderId: string, userId: string) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        OR: [
          ...(orderId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? [{ id: orderId }] : []),
          { orderNumber: orderId }
        ]
      }
    });

    if (!order) throw new Error("Order not found");
    if (order.userId !== userId) throw new Error("Not your order");
    if (order.status === "CANCELLED") throw new Error("Order already cancelled");
    if (order.status === "DELIVERED") throw new Error("Cannot cancel a delivered order");

    // Refund earned coins
    if (order.coinsEarned > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { kaivuCoins: { decrement: order.coinsEarned } },
      });
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: -order.coinsEarned,
          type: "ADMIN_ADJUST",
          description: `Coins reversed from cancelled order ${order.orderNumber}`,
          referenceId: order.id,
        },
      });
    }

    // Refund redeemed coins
    if (order.coinsRedeemed > 0) {
      await tx.user.update({
        where: { id: userId },
        data: { kaivuCoins: { increment: order.coinsRedeemed } },
      });
      await tx.coinTransaction.create({
        data: {
          userId,
          amount: order.coinsRedeemed,
          type: "ADMIN_ADJUST",
          description: `Coins refunded from cancelled order ${order.orderNumber}`,
          referenceId: order.id,
        },
      });
    }

    // Update order status
    const cancelled = await tx.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    return {
      ...cancelled,
      subtotal: Number(cancelled.subtotal),
      deliveryFee: Number(cancelled.deliveryFee),
      discount: Number(cancelled.discount),
      total: Number(cancelled.total),
    };
  });
}
