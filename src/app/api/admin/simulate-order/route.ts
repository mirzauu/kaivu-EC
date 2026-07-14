import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateReferralCode, generateOrderNumber, apiError, apiSuccess } from "@/lib/api-utils";
import { withAdmin, type AuthenticatedRequest } from "@/lib/auth/middleware";
import { Prisma } from "@prisma/client";

/**
 * POST /api/admin/simulate-order
 * Simulates a customer checkout flow:
 * 1. Creates a random customer user
 * 2. Selects 1-3 random menu items
 * 3. Creates an order + items
 * 4. Logs events (LOGIN, ADD_TO_CART, ORDER_PLACED) to populate the tracking feed
 */
export const POST = withAdmin(async (_req: AuthenticatedRequest) => {
  try {
    // Get all available menu items
    const menuItems = await db.menuItem.findMany({
      where: { isAvailable: true },
    });

    if (menuItems.length === 0) {
      return NextResponse.json(
        apiError("No available menu items to simulate order"),
        { status: 400 }
      );
    }

    // 1. Create a random customer
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const names = ["Aarav Sharma", "Priya Patel", "Vikram Singh", "Ananya Rao", "Rohan Gupta", "Kavita Reddy"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const phone = `+9198765${randomSuffix}`;
    const referralCode = generateReferralCode();

    const customer = await db.user.create({
      data: {
        phone,
        name: randomName,
        email: `${randomName.toLowerCase().replace(" ", ".")}@example.com`,
        referralCode,
        kaivuCoins: 50, // signup bonus
        walletBalance: new Prisma.Decimal(1000), // pre-funded wallet
      },
    });

    // Log LOGIN event
    await db.userEvent.create({
      data: {
        userId: customer.id,
        eventType: "LOGIN",
        metadata: { method: "OTP_SIMULATOR", name: randomName },
        sessionId: `sim_${Date.now()}`,
      },
    });

    // 2. Select 1-3 random menu items
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedItems = [];
    let subtotal = 0;

    for (let i = 0; i < numItems; i++) {
      const item = menuItems[Math.floor(Math.random() * menuItems.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      selectedItems.push({ item, quantity });
      subtotal += Number(item.price) * quantity;

      // Log ADD_TO_CART event for each item
      await db.userEvent.create({
        data: {
          userId: customer.id,
          eventType: "ADD_TO_CART",
          metadata: { menuItemId: item.id, name: item.name, quantity },
          sessionId: `sim_${Date.now()}`,
        },
      });
    }

    const deliveryFee = subtotal >= 500 ? 0 : 29;
    const total = subtotal + deliveryFee;

    // Generate unique order number
    let orderNumber = generateOrderNumber();
    let existing = await db.order.findUnique({ where: { orderNumber } });
    while (existing) {
      orderNumber = generateOrderNumber();
      existing = await db.order.findUnique({ where: { orderNumber } });
    }

    const coinsEarned = Math.floor(total * 0.1);

    // 3. Create the order
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: customer.id,
        subtotal: new Prisma.Decimal(subtotal),
        deliveryFee: new Prisma.Decimal(deliveryFee),
        total: new Prisma.Decimal(total),
        coinsEarned,
        status: "CONFIRMED",
        deliveryAddress: "Simulated Delivery Street, Bangalore",
        paymentMethod: "WALLET",
        estimatedDelivery: new Date(Date.now() + 25 * 60 * 1000),
      },
    });

    // 4. Create order items
    await db.orderItem.createMany({
      data: selectedItems.map((si) => ({
        orderId: order.id,
        menuItemId: si.item.id,
        itemName: si.item.name,
        itemPrice: si.item.price,
        quantity: si.quantity,
        lineTotal: new Prisma.Decimal(Number(si.item.price) * si.quantity),
      })),
    });

    // Update user coins and record transaction
    await db.user.update({
      where: { id: customer.id },
      data: { kaivuCoins: { increment: coinsEarned } },
    });

    await db.coinTransaction.create({
      data: {
        userId: customer.id,
        amount: coinsEarned,
        type: "ORDER_EARN",
        description: `Simulated Earn: +${coinsEarned} coins for order ${orderNumber}`,
        referenceId: order.id,
      },
    });

    // Log ORDER_PLACED event
    await db.userEvent.create({
      data: {
        userId: customer.id,
        eventType: "ORDER_PLACED",
        metadata: { orderId: order.id, total, itemsCount: numItems },
        sessionId: `sim_${Date.now()}`,
      },
    });

    return NextResponse.json(
      apiSuccess(
        {
          orderId: order.id,
          orderNumber,
          customer: randomName,
          total,
        },
        "Checkout simulation completed"
      )
    );
  } catch (error) {
    console.error("Order simulation failed:", error);
    return NextResponse.json(apiError("Simulation failed"), { status: 500 });
  }
});
