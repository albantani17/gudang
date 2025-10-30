import { PrismaClient } from "../src/generated/prisma";
import { ENV_ADMIN_SEED } from "../src/common/environment";

const prisma = new PrismaClient();

async function main() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME } = ENV_ADMIN_SEED();

  const exists = await prisma.user.findFirst();

  if (exists) {
    console.log("Admin user already exists");
    return;
  }

  const roleExists = await prisma.role.findFirst();

  let roleId = roleExists?.id;

  if (!roleId) {
    const role = await prisma.role.create({
      data: {
        name: "Admin",
        permission: ["*"],
      },
    });

    roleId = role.id;
  }

  await prisma.user.create({
    data: {
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: await Bun.password.hash(ADMIN_PASSWORD),
      name: "Admin",
      roleId,
    },
  });

  console.log(`Admin user created with email: ${ADMIN_EMAIL}`);
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
