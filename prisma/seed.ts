import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL!.toLowerCase();
  const password = process.env.ADMIN_PASSWORD!;

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { name: "Admin", email, passwordHash: await bcrypt.hash(password, 12) },
  });

  // default homepage sections (admin can rename / reorder / hide later)
  const sections = [
    ["hero", "Hero"],
    ["featuredDestinations", "Featured Destinations"],
    ["featuredPackages", "Featured Tour Packages"],
    ["experiences", "Travel Experiences"],
    ["whyUs", "Why Travel With Us"],
    ["testimonials", "What Our Travelers Say"],
    ["blogs", "From Our Blog"],
  ];
  for (const [i, [key, title]] of sections.entries()) {
    await prisma.homepageSection.upsert({
      where: { key },
      update: {},
      create: { key, title, sortOrder: i },
    });
  }
  console.log("Seed done for", email);
}

main().finally(() => prisma.$disconnect());
