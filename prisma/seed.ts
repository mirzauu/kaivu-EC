import { PrismaClient, MenuCategory, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import assets from "../src/lib/cloudinary-assets.json";

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
      value: "1",
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
      value: "0",
      type: "number",
      label: "Delivery Fee (₹)",
      description: "Standard delivery fee per order.",
      group: "delivery",
    },
    {
      key: "free_delivery_threshold",
      value: "0",
      type: "number",
      label: "Free Delivery Threshold (₹)",
      description: "Orders above this amount get free delivery.",
      group: "delivery",
    },

    // Rewards Settings
    {
      key: "reward_section_enabled",
      value: "false",
      type: "boolean",
      label: "Reward Section Enabled",
      description: "Toggle the user-facing rewards section and navbar icon on/off.",
      group: "rewards",
    },
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
  const imgCluck = assets.menuImages["kaivu-cluck-burger.jpg"];
  const imgMac = assets.menuImages["kaivu-mac-burger.jpg"];
  const imgLoaded = assets.menuImages["kaivu-loaded-bowl.jpg"];
  const imgShake = assets.menuImages["shake.jpg"];

  const menuItems = [
    {
      slug: "cluck-riot",
      name: "Cluck Riot",
      description: "Crispy fried chicken tossed in Nashville hot oil, dusted with our own seasoning, and piled high with slaw.",
      price: 229,
      imageUrl: imgCluck,
      category: MenuCategory.BURGERS,
      tag: "Nashville Hot",
      rating: 4.9,
      sortOrder: 1,
      variants: null
    },
    {
      slug: "mac-and-rooster",
      name: "Mac and Rooster",
      description: "Crispy Nashville fried chicken stacked with creamy mac and cheese. A comfort-food favourite with a little heat.",
      price: 269,
      imageUrl: imgMac,
      category: MenuCategory.BURGERS,
      tag: "Comfort",
      rating: 4.9,
      sortOrder: 2,
      variants: null
    },
    {
      slug: "classic-fried-bird",
      name: "Classic Fried Bird",
      description: "A crispy fried chicken burger made for those who love a classic crunch.",
      price: 219,
      imageUrl: null,
      category: MenuCategory.BURGERS,
      tag: "Classic",
      rating: 4.8,
      sortOrder: 3,
      variants: null
    },
    {
      slug: "og-buff-smash",
      name: "OG Buff Smash",
      description: "A double smashed beef patty burger, built for a rich, satisfying bite.",
      price: 339,
      imageUrl: null,
      category: MenuCategory.BURGERS,
      tag: "Double Beef",
      rating: 5,
      sortOrder: 4,
      variants: null
    },
    {
      slug: "classic-smash",
      name: "Classic Smash",
      description: "A single smashed beef patty finished with chimichurri for a fresh, herby kick.",
      price: 239,
      imageUrl: null,
      category: MenuCategory.BURGERS,
      tag: "Single Beef",
      rating: 4.8,
      sortOrder: 5,
      variants: null
    },
    {
      slug: "yolk-me-up",
      name: "Yolk Me Up",
      description: "Double smashed beef patties topped with a fried bullseye egg. Rich, hearty, and seriously satisfying.",
      price: 369,
      imageUrl: null,
      category: MenuCategory.BURGERS,
      tag: "Bullseye Egg",
      rating: 5,
      sortOrder: 6,
      variants: null
    },
    {
      slug: "beef-patty-melt",
      name: "Beef Patty Melt",
      description: "A hearty beef patty sandwich made for a rich, savoury bite.",
      price: 219,
      imageUrl: null,
      category: MenuCategory.SANDOS,
      tag: "Sando",
      rating: 4.8,
      sortOrder: 7,
      variants: null
    },
    {
      slug: "grilled-chicken-sando",
      name: "Grilled Chicken Sando",
      description: "Juicy grilled chicken served sandwich-style for a satisfying, savoury bite.",
      price: 229,
      imageUrl: null,
      category: MenuCategory.SANDOS,
      tag: "Sando",
      rating: 4.8,
      sortOrder: 8,
      variants: null
    },
    {
      slug: "normal-tenders",
      name: "Normal Tenders",
      description: "Golden, crispy chicken tenders with a satisfying crunch.",
      price: 259,
      imageUrl: null,
      category: MenuCategory.TENDERS,
      tag: "Crispy",
      rating: 4.8,
      sortOrder: 9,
      variants: {"groupTitle":"Sizes","options":[{"name":"Box of 4","quantity":4,"price":259},{"name":"Box of 6","quantity":6,"price":359}]}
    },
    {
      slug: "hot-bird-tenders",
      name: "Hot Bird Tenders",
      description: "Crispy chicken tenders coated in bold Nashville-style heat.",
      price: 279,
      imageUrl: null,
      category: MenuCategory.TENDERS,
      tag: "Nashville Spicy",
      rating: 4.9,
      sortOrder: 10,
      variants: {"groupTitle":"Sizes","options":[{"name":"Box of 4","quantity":4,"price":279},{"name":"Box of 6","quantity":6,"price":369}]}
    },
    {
      slug: "honey-bbq-glazed-tenders",
      name: "Honey BBQ Glazed Tenders",
      description: "Crispy chicken tenders coated in a sweet, smoky honey BBQ glaze.",
      price: 299,
      imageUrl: null,
      category: MenuCategory.TENDERS,
      tag: "Honey BBQ",
      rating: 5,
      sortOrder: 11,
      variants: {"groupTitle":"Sizes","options":[{"name":"Box of 4","quantity":4,"price":299},{"name":"Box of 6","quantity":6,"price":399}]}
    },
    {
      slug: "hot-honey-wings",
      name: "Hot Honey Wings",
      description: "Crispy chicken wings coated in a sweet honey glaze with a spicy kick.",
      price: 269,
      imageUrl: null,
      category: MenuCategory.WINGS,
      tag: "Hot Honey",
      rating: 4.9,
      sortOrder: 12,
      variants: {"groupTitle":"Sizes","options":[{"name":"Box of 3","quantity":3,"price":269},{"name":"Box of 5","quantity":5,"price":379}]}
    },
    {
      slug: "hot-chicken-wings",
      name: "Hot Chicken Wings",
      description: "Crispy chicken wings tossed in bold, fiery Nashville-style seasoning.",
      price: 249,
      imageUrl: null,
      category: MenuCategory.WINGS,
      tag: "Fiery",
      rating: 4.8,
      sortOrder: 13,
      variants: {"groupTitle":"Sizes","options":[{"name":"Box of 3","quantity":3,"price":249},{"name":"Box of 5","quantity":5,"price":359}]}
    },
    {
      slug: "honey-bbq-wings",
      name: "Honey BBQ Wings",
      description: "Crispy chicken wings glazed with a sweet and smoky honey BBQ sauce.",
      price: 259,
      imageUrl: null,
      category: MenuCategory.WINGS,
      tag: "Smoky BBQ",
      rating: 4.9,
      sortOrder: 14,
      variants: {"groupTitle":"Sizes","options":[{"name":"Box of 3","quantity":3,"price":259},{"name":"Box of 5","quantity":5,"price":369}]}
    },
    {
      slug: "mac-and-cheese-with-hot-tender",
      name: "Mac and Cheese with Hot Tender",
      description: "Creamy mac and cheese topped with a crispy hot chicken tender and a drizzle of chipotle mayo.",
      price: 249,
      imageUrl: null,
      category: MenuCategory.PASTA,
      tag: "Special",
      rating: 4.9,
      sortOrder: 15,
      variants: null
    },
    {
      slug: "nashville-loaded",
      name: "Nashville Loaded",
      description: "Crispy fries loaded with bold Nashville flavour.",
      price: 239,
      imageUrl: imgLoaded,
      category: MenuCategory.LOADED,
      tag: "Loaded Fries",
      rating: 4.8,
      sortOrder: 16,
      variants: null
    },
    {
      slug: "hot-tender-addon",
      name: "Hot Tender",
      description: "An extra crispy hot chicken tender.",
      price: 89,
      imageUrl: null,
      category: MenuCategory.ADD_ONS,
      tag: "Add-on",
      rating: 4.8,
      sortOrder: 17,
      variants: null
    },
    {
      slug: "ranch-dip",
      name: "Ranch",
      description: "Creamy ranch dip. (Size: 50 ml)",
      price: 25,
      imageUrl: null,
      category: MenuCategory.ADD_ONS,
      tag: "50 ml",
      rating: 4.8,
      sortOrder: 18,
      variants: null
    },
    {
      slug: "hot-honey-dip",
      name: "Hot Honey",
      description: "Sweet honey with a spicy kick. (Size: 50 ml)",
      price: 30,
      imageUrl: null,
      category: MenuCategory.ADD_ONS,
      tag: "50 ml",
      rating: 4.8,
      sortOrder: 19,
      variants: null
    },
    {
      slug: "chipotle-mayo-dip",
      name: "Chipotle Mayo",
      description: "Creamy chipotle mayo with a smoky kick. (Size: 50 ml)",
      price: 30,
      imageUrl: null,
      category: MenuCategory.ADD_ONS,
      tag: "50 ml",
      rating: 4.8,
      sortOrder: 20,
      variants: null
    },
    {
      slug: "bread-addon",
      name: "Bread",
      description: "An extra serving of bread.",
      price: 5,
      imageUrl: null,
      category: MenuCategory.ADD_ONS,
      tag: "Add-on",
      rating: 4.7,
      sortOrder: 21,
      variants: null
    },
    {
      slug: "cola",
      name: "Cola",
      description: "A chilled, refreshing cola.",
      price: 20,
      imageUrl: imgShake,
      category: MenuCategory.DRINKS,
      tag: "Chilled",
      rating: 4.7,
      sortOrder: 22,
      variants: null
    },
    {
      slug: "sprite",
      name: "Sprite",
      description: "A crisp, refreshing lemon-lime soft drink.",
      price: 20,
      imageUrl: imgShake,
      category: MenuCategory.DRINKS,
      tag: "Chilled",
      rating: 4.7,
      sortOrder: 23,
      variants: null
    },
    {
      slug: "7up",
      name: "7UP",
      description: "A refreshing lemon-lime soft drink.",
      price: 20,
      imageUrl: imgShake,
      category: MenuCategory.DRINKS,
      tag: "Chilled",
      rating: 4.7,
      sortOrder: 24,
      variants: null
    },
    {
      slug: "pepsi",
      name: "Pepsi",
      description: "A chilled, refreshing cola.",
      price: 20,
      imageUrl: imgShake,
      category: MenuCategory.DRINKS,
      tag: "Chilled",
      rating: 4.7,
      sortOrder: 25,
      variants: null
    }
  ];

  // Remove existing cart items, order items referencing menu items, and old menu items
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.menuItem.deleteMany();

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item,
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

  // Delete existing user rewards and rewards before recreating
  await prisma.userReward.deleteMany();
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
