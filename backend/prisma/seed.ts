import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('Seeding database...');
    const superAdmin = await prisma.user.upsert({
    where: { phoneNumber: '+919999999999' },
    update: {
      role: 'SUPER_ADMIN',
    },
    create: {
      phoneNumber: '+919999999999',
      role: 'SUPER_ADMIN',
      walletBalance: 0.00,
    },
  });
  console.log('Founder account injected:', superAdmin);
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
