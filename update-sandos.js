const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.menuItem.updateMany({
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

main().catch(console.error).finally(() => prisma.$disconnect());
