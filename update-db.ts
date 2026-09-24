import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { menu } from "./src/lib/menu-data";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Wiping existing menu items...");
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.menuItem.deleteMany();

  console.log(`Inserting ${menu.length} new items from JSON...`);
  
  for (const item of menu) {
    const categoryEnum = item.category === "Add-ons" ? "ADD_ONS" : item.category.toUpperCase();
    await prisma.menuItem.create({
      data: {
        slug: item.id,
        name: item.name,
        description: item.desc,
        price: item.price,
        imageUrl: item.image,
        category: categoryEnum as any,
        tag: item.tag || null,
        rating: item.rating,
        isAvailable: item.isAvailable !== false,
      },
    });
  }
  
  console.log("✅ Database successfully synced with new JSON menu!");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
