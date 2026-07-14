import { PrismaClient, MenuCategory, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── SYSTEM SETTINGS (Dynamic Coin Config) ────────────────────────────────
  // These are all admin-configurable from the C-Suite dashboard.
  const settings = [
    // Coin Economy
    {
      key: "coin_earn_rate_percent",
      value: "10",
      type: "number",
      label: "Coin Earn Rate (%)",
      description:
        "Percentage of order total awarded as Kaivu coins. E.g., 10 = 10% of ₹450 = 45 coins.",
      group: "coins",
    },
    {
      key: "coin_redemption_rate",
      value: "10",
      type: "number",
      label: "Coin Redemption Value (₹ per 100 coins)",
      description:
        "How much ₹ discount 100 coins are worth. E.g., 10 = 100 coins = ₹10 off.",
      group: "coins",
    },
    {
      key: "coin_min_redeem",
      value: "100",
      type: "number",
      label: "Minimum Coins to Redeem",
      description: "Users must have at least this many coins to redeem.",
      group: "coins",
    },
    {
      key: "coin_max_redeem_percent",
      value: "50",
      type: "number",
      label: "Max Redemption (% of order)",
      description:
        "Maximum percentage of order total that can be paid via coins.",
      group: "coins",
    },
    {
      key: "signup_bonus_coins",
      value: "50",
      type: "number",
      label: "Signup Bonus (coins)",
      description: "Coins awarded to new users on signup.",
      group: "coins",
    },

    // Referral Settings
    {
      key: "referral_bonus_referrer",
      value: "100",
      type: "number",
      label: "Referrer Bonus (coins)",
      description:
        "Coins awarded to the referrer when referred user places first order.",
      group: "referral",
    },
    {
      key: "referral_bonus_referred",
      value: "50",
      type: "number",
      label: "Referred User Bonus (coins)",
      description:
        "Coins awarded to the new user on first order via referral.",
      group: "referral",
    },
    {
      key: "referral_enabled",
      value: "true",
      type: "boolean",
      label: "Referral Program Enabled",
      description: "Toggle the referral program on/off.",
      group: "referral",
    },

    // Delivery Settings
    {
      key: "delivery_fee",
      value: "29",
      type: "number",
      label: "Delivery Fee (₹)",
      description: "Standard delivery fee per order.",
      group: "delivery",
    },
    {
      key: "free_delivery_threshold",
      value: "500",
      type: "number",
      label: "Free Delivery Threshold (₹)",
      description: "Orders above this amount get free delivery.",
      group: "delivery",
    },

    // Rewards Settings
    {
      key: "loyalty_orders_for_free_burger",
      value: "8",
      type: "number",
      label: "Orders for Free Burger",
      description:
        "Number of orders needed in a month to earn a free burger.",
      group: "rewards",
    },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { ...setting },
      create: { ...setting },
    });
  }
  console.log(`  ✅ ${settings.length} system settings created`);

  // ─── MENU ITEMS ────────────────────────────────────────────────────────────
  const menuItems = [
    {
      slug: "buffalo-flamin-hot",
      name: "Buffalo Flami'n Hot",
      description:
        "Crispy chicken glazed in bold buffalo heat, cooled down with ranch and finished with fresh crunch",
      price: 260,
      imageUrl: "/images/menu/burger-spicy.jpg",
      category: MenuCategory.BURGERS,
      tag: "Spicy",
      rating: 4.8,
      sortOrder: 1,
    },
    {
      slug: "nashville-fried",
      name: "Nashville Fried & Creamy Slaw",
      description:
        "Nashville-spiced fried chicken layered with creamy slaw, roasted garlic aioli and a touch of tang.",
      price: 240,
      imageUrl: "/images/menu/burger-spicy.jpg",
      category: MenuCategory.BURGERS,
      tag: "New",
      rating: 4.7,
      sortOrder: 2,
    },
    {
      slug: "smoky-bbq-comfort",
      name: "Smoky BBQ Comfort",
      description:
        "Flame-grilled chicken, smoky honey BBQ, crispy onions and melted cheese on a toasted potato bun.",
      price: 210,
      imageUrl: "/images/menu/burger-bacon.jpg",
      category: MenuCategory.BURGERS,
      rating: 4.6,
      sortOrder: 3,
    },
    {
      slug: "the-smashed",
      name: "The Smashed",
      description:
        "Double smashed beef, melted cheese, grilled onions and pickled tang. Nothing extra. Nothing missing.",
      price: 330,
      imageUrl: "/images/menu/burger-classic.jpg",
      category: MenuCategory.BURGERS,
      tag: "Bestseller",
      rating: 4.9,
      sortOrder: 4,
    },
    {
      slug: "shroomland",
      name: "Shroomland",
      description:
        "Juicy beef, melted cheese and rich mushroom demi-glace inspired by old-school steakhouse flavours.",
      price: 390,
      imageUrl: "/images/menu/burger-classic.jpg",
      category: MenuCategory.BURGERS,
      rating: 4.8,
      sortOrder: 5,
    },
    {
      slug: "smoke-jam",
      name: "Smoke & Jam",
      description:
        "Double smashed beef loaded with bacon jam, caramelized onions, melted cheese and smoky indulgence",
      price: 360,
      imageUrl: "/images/menu/burger-bacon.jpg",
      category: MenuCategory.BURGERS,
      rating: 4.9,
      sortOrder: 6,
    },
    {
      slug: "golden-fries",
      name: "Golden Fries",
      description: "Hand-cut, sea salt, rosemary",
      price: 120,
      imageUrl: "/images/menu/fries.jpg",
      category: MenuCategory.SIDES,
      rating: 4.6,
      sortOrder: 7,
    },
    {
      slug: "choco-shake",
      name: "Choco Velvet Shake",
      description: "Belgian chocolate, whipped cream",
      price: 150,
      imageUrl: "/images/menu/shake.jpg",
      category: MenuCategory.DRINKS,
      rating: 4.8,
      sortOrder: 8,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: { ...item },
      create: { ...item },
    });
  }
  console.log(`  ✅ ${menuItems.length} menu items created`);

  // ─── DEFAULT REWARDS ───────────────────────────────────────────────────────
  const rewards = [
    {
      name: "Free Fries",
      description: "Get a free order of Golden Fries with your next order",
      type: "FREE_ITEM" as const,
      pointsRequired: 500,
      value: 120,
      targetItemId: null,
      isActive: true,
    },
    {
      name: "10% Off Order",
      description: "Get 10% off your entire order",
      type: "DISCOUNT_PERCENT" as const,
      pointsRequired: 1000,
      value: 10,
      isActive: true,
    },
    {
      name: "₹50 Off",
      description: "Flat ₹50 off on any order above ₹300",
      type: "DISCOUNT_FLAT" as const,
      pointsRequired: 300,
      value: 50,
      isActive: true,
    },
    {
      name: "Double Coins",
      description: "Earn double coins on your next 3 orders",
      type: "COINS_BONUS" as const,
      pointsRequired: 2000,
      value: 2, // multiplier
      isActive: true,
    },
  ];

  // Delete existing rewards and recreate
  await prisma.reward.deleteMany();
  for (const reward of rewards) {
    await prisma.reward.create({ data: reward });
  }
  console.log(`  ✅ ${rewards.length} rewards created`);

  // ─── ADMIN USER ────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { phone: "+919999999999" },
    update: {},
    create: {
      phone: "+919999999999",
      name: "Kaivu Admin",
      email: "admin@kaivu.app",
      referralCode: "KAIVU-ADMIN",
      role: UserRole.ADMIN,
      kaivuCoins: 0,
      walletBalance: 0,
    },
  });
  console.log("  ✅ Admin user created (phone: +919999999999)");

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
