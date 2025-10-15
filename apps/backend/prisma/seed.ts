import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME;

  if (!adminEmail || !adminPassword || !adminUsername) {
    console.log("ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_USERNAME must be set");
    return;
  }

  const exists = await prisma.user.findFirst();

  if (exists) {
    console.log("Admin user already exists");
    return;
  }

  await prisma.user.create({
    data: {
      username: adminUsername,
      email: adminEmail,
      password: await Bun.password.hash(adminPassword),
      name: "Admin",
    },
  });

  console.log(`Admin user created with email: ${adminEmail}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
