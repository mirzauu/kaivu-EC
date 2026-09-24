import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './src/lib/db';

async function main() {
  const result = await db.menuItem.updateMany({
    where: {
      name: {
        in: ['Beef Patty Melt', 'Grilled Chicken Sando']
      }
    },
    data: {
      category: 'SANDOS'
    }
  });
  console.log('Updated Sandos category in DB:', result);
}

main().catch(console.error).finally(() => process.exit(0));
