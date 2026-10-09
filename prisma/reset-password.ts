// For "I forgot my password". Run it on the machine that has the .env file:
//   npx tsx prisma/reset-password.ts you@example.com "A-New-Password-123"
// It also signs out every existing login.
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.log('Usage: npx tsx prisma/reset-password.ts <email> "<new password>"');
    return;
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    console.log("Use at least 8 characters, with a letter and a number.");
    return;
  }
  const result = await prisma.adminUser.updateMany({
    where: { email: email.toLowerCase() },
    data: {
      passwordHash: await bcrypt.hash(password, 12),
      passwordChangedAt: new Date(Math.floor(Date.now() / 1000) * 1000),
    },
  });
  console.log(result.count ? "Password updated. All old logins are signed out." : "No admin found with that email.");
}

main().finally(() => prisma.$disconnect());
