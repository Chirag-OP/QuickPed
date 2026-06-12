const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No users found");
    return;
  }
  console.log("Updating user:", user.id);
  
  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: 'Test Name', campusId: 'fa621ba4-23dd-42ce-b0d9-1d08c15c8a65' }
    });
    console.log("Success:", updated);
  } catch (e) {
    console.log("Error updating:", e.message);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
