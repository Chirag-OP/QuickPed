const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const newCampus = await prisma.campus.create({
    data: {
      name: 'Dynamic Test Campus ' + Date.now(),
      config: {}
    }
  });
  console.log('NEW_CAMPUS_ID=' + newCampus.id);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
