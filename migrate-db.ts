import * as dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';

async function main() {
  const connectionString = process.env.DATABASE_URL!.replace(':6543/', ':5432/');
  console.log("Connecting to direct DB port...");
  const client = new Client({ connectionString });
  
  await client.connect();
  
  try {
    // 1. Add SANDOS to the enum
    await client.query(`ALTER TYPE "MenuCategory" ADD VALUE IF NOT EXISTS 'SANDOS';`);
    console.log("Added SANDOS to MenuCategory enum.");
    
    // 2. Update the two products
    const res = await client.query(`
      UPDATE "menu_items"
      SET category = 'SANDOS'
      WHERE name IN ('Beef Patty Melt', 'Grilled Chicken Sando');
    `);
    console.log(`Updated ${res.rowCount} menu items to SANDOS category.`);
  } catch(e) {
    console.error("Error migrating DB:", e);
  } finally {
    await client.end();
  }
}

main();
