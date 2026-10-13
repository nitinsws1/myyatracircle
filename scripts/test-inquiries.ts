import "dotenv/config";
import { prisma } from "../lib/prisma";
import { submitContactInquiry } from "../app/(site)/contact/actions";
import { submitTourInquiry } from "../app/(site)/packages/actions";
import { submitHolidayInquiry } from "../app/(site)/customize-holiday/actions";
import { subscribeNewsletter } from "../lib/actions/newsletter";

async function main() {
  console.log("=== 1. CONTACT INQUIRY TEST ===");
  const cForm = new FormData();
  cForm.append("name", "Test Traveler");
  cForm.append("email", "test.contact@example.com");
  cForm.append("phone", "+91 98765 43210");
  cForm.append("country", "India");
  cForm.append("destinationOfInterest", "Kashmir");
  cForm.append("message", "Looking for a luxury family holiday in Srinagar and Gulmarg");

  const cRes = await submitContactInquiry(undefined, cForm);
  console.log("Contact submission response:", cRes);

  const contactInDb = await prisma.contactInquiry.findFirst({
    where: { email: "test.contact@example.com" },
    orderBy: { createdAt: "desc" },
  });
  console.log("Created contact in DB:", contactInDb?.id, contactInDb?.name, contactInDb?.status);

  console.log("\n=== 2. TOUR INQUIRY TEST ===");
  const samplePkg = await prisma.tourPackage.findFirst();
  const tForm = new FormData();
  if (samplePkg) tForm.append("packageId", String(samplePkg.id));
  tForm.append("name", "Test Tour Inquirer");
  tForm.append("email", "test.tour@example.com");
  tForm.append("phone", "+91 91234 56789");
  tForm.append("message", "Can this package be customized for 4 adults?");

  const tRes = await submitTourInquiry(undefined, tForm);
  console.log("Tour submission response:", tRes);

  const tourInDb = await prisma.tourInquiry.findFirst({
    where: { email: "test.tour@example.com" },
    orderBy: { createdAt: "desc" },
  });
  console.log("Created tour inquiry in DB:", tourInDb?.id, tourInDb?.name, tourInDb?.status);

  console.log("\n=== 3. CUSTOM HOLIDAY INQUIRY TEST ===");
  const hForm = new FormData();
  hForm.append("name", "Test Holiday Maker");
  hForm.append("email", "test.holiday@example.com");
  hForm.append("phone", "+91 98989 89898");
  hForm.append("preferredDestination", "Andaman Islands");
  hForm.append("travelStartDate", "2026-12-10");
  hForm.append("travelEndDate", "2026-12-18");
  hForm.append("numTravelers", "2");
  hForm.append("budgetRange", "₹2,00,000 - ₹3,00,000");
  hForm.append("accommodationPreference", "Beachfront Villa");
  hForm.append("specialRequirements", "Honeymoon setup");

  const hRes = await submitHolidayInquiry(undefined, hForm);
  console.log("Holiday submission response:", hRes);

  const holidayInDb = await prisma.holidayInquiry.findFirst({
    where: { email: "test.holiday@example.com" },
    orderBy: { createdAt: "desc" },
  });
  console.log("Created holiday inquiry in DB:", holidayInDb?.id, holidayInDb?.name, holidayInDb?.status);

  console.log("\n=== 4. NEWSLETTER TEST ===");
  const nForm = new FormData();
  nForm.append("email", "test.newsletter@example.com");

  const nRes = await subscribeNewsletter(undefined, nForm);
  console.log("Newsletter subscription response:", nRes);

  const newsInDb = await prisma.newsletterSubscriber.findUnique({
    where: { email: "test.newsletter@example.com" },
  });
  console.log("Created newsletter subscriber in DB:", newsInDb?.id, newsInDb?.email, newsInDb?.isSubscribed);

  console.log("\n=== 5. VALIDATION TEST (INVALID INPUTS) ===");
  const invalidForm = new FormData();
  invalidForm.append("name", "X"); // 1 char (min 2)
  invalidForm.append("email", "bad-email");
  invalidForm.append("phone", "123"); // invalid phone
  const invalidRes = await submitContactInquiry(undefined, invalidForm);
  console.log("Validation errors captured correctly:", invalidRes.errors);

  // Clean up
  await prisma.contactInquiry.deleteMany({ where: { email: "test.contact@example.com" } });
  await prisma.tourInquiry.deleteMany({ where: { email: "test.tour@example.com" } });
  await prisma.holidayInquiry.deleteMany({ where: { email: "test.holiday@example.com" } });
  await prisma.newsletterSubscriber.deleteMany({ where: { email: "test.newsletter@example.com" } });
  console.log("\nAll test entries cleaned up successfully.");
}

main().catch(console.error).finally(() => process.exit(0));
