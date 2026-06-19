const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const campus = await prisma.campus.upsert({
    where: { id: '123e4567-e89b-12d3-a456-426614174000' },
    update: {},
    create: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Mock Campus',
      config: {}
    }
  });
  console.log('Campus ready:', campus);
}

main().catch(console.error).finally(() => prisma.$disconnect());
