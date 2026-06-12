const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const campuses = await prisma.campus.findMany();
  console.log('CAMPUSES:', JSON.stringify(campuses, null, 2));

  if (campuses.length === 0) {
    console.log('No campuses exist in DB. Creating one...');
    const newCampus = await prisma.campus.create({
      data: {
        name: 'IIT Ropar',
        config: {}
      }
    });
    console.log('NEW_CAMPUS_ID=' + newCampus.id);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
