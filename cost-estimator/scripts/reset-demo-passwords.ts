import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await hashPassword("admin123-dev-only");
  const estHash = await hashPassword("estimator123-dev-only");

  await prisma.user.update({
    where: { email: "admin@elan-architecture.fr" },
    data: { passwordHash: adminHash },
  });

  await prisma.user.update({
    where: { email: "estimator@elan-architecture.fr" },
    data: { passwordHash: estHash },
  });

  console.log("Password reset OK");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
