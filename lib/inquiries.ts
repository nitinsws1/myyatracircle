import "server-only";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, fmtDate, fmtDateTime, isStatus, type InquiryType, type Status } from "@/lib/inquiry-config";

export type Filters = { q?: string; status?: string };
export type Row = {
  id: number; name: string; email: string; phone: string | null;
  extra: string; status: Status; createdAt: Date;
};

const insensitive = "insensitive" as const;
const orderBy = { createdAt: "desc" as const };

function personWhere({ q, status }: Filters) {
  return {
    ...(status && isStatus(status) ? { status } : {}),
    ...(q
      ? { OR: [
          { name: { contains: q, mode: insensitive } },
          { email: { contains: q, mode: insensitive } },
          { phone: { contains: q } },
        ] }
      : {}),
  };
}

function subscriberWhere({ q, status }: Filters) {
  return {
    ...(status === "active" ? { isSubscribed: true } : status === "unsubscribed" ? { isSubscribed: false } : {}),
    ...(q ? { email: { contains: q, mode: insensitive } } : {}),
  };
}

export async function listInquiries(type: Exclude<InquiryType, "newsletter">, f: Filters, page: number) {
  const where = personWhere(f);
  const skip = (page - 1) * PAGE_SIZE;
  const take = PAGE_SIZE;

  if (type === "contact") {
    const [rows, total] = await Promise.all([
      prisma.contactInquiry.findMany({ where, orderBy, skip, take }),
      prisma.contactInquiry.count({ where }),
    ]);
    return { total, rows: rows.map((r): Row => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, extra: r.destinationOfInterest ?? "-", status: r.status, createdAt: r.createdAt })) };
  }
  if (type === "tour") {
    const [rows, total] = await Promise.all([
      prisma.tourInquiry.findMany({ where, orderBy, skip, take, include: { package: { select: { name: true } } } }),
      prisma.tourInquiry.count({ where }),
    ]);
    return { total, rows: rows.map((r): Row => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, extra: r.package?.name ?? "(package deleted)", status: r.status, createdAt: r.createdAt })) };
  }
  const [rows, total] = await Promise.all([
    prisma.holidayInquiry.findMany({ where, orderBy, skip, take }),
    prisma.holidayInquiry.count({ where }),
  ]);
  return { total, rows: rows.map((r): Row => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, extra: r.preferredDestination ?? "-", status: r.status, createdAt: r.createdAt })) };
}

export async function listSubscribers(f: Filters, page: number) {
  const where = subscriberWhere(f);
  const [rows, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ where, orderBy: { subscribedAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.newsletterSubscriber.count({ where }),
  ]);
  return { rows, total };
}

export async function tabCounts() {
  const [contact, tour, holiday, subscribers] = await Promise.all([
    prisma.contactInquiry.count({ where: { status: "NEW" } }),
    prisma.tourInquiry.count({ where: { status: "NEW" } }),
    prisma.holidayInquiry.count({ where: { status: "NEW" } }),
    prisma.newsletterSubscriber.count({ where: { isSubscribed: true } }),
  ]);
  return { contact, tour, holiday, newsletter: subscribers };
}

// Everything matching the filters (max 5000 rows) as a table of text, for the CSV download
export async function exportData(type: InquiryType, f: Filters) {
  const take = 5000;
  if (type === "contact") {
    const rows = await prisma.contactInquiry.findMany({ where: personWhere(f), orderBy, take });
    return {
      headers: ["ID", "Received", "Name", "Email", "Phone", "Country", "Destination of interest", "Message", "Status"],
      rows: rows.map((r) => [r.id, fmtDateTime(r.createdAt), r.name, r.email, r.phone, r.country, r.destinationOfInterest, r.message, r.status]),
    };
  }
  if (type === "tour") {
    const rows = await prisma.tourInquiry.findMany({ where: personWhere(f), orderBy, take, include: { package: { select: { name: true } } } });
    return {
      headers: ["ID", "Received", "Package", "Name", "Email", "Phone", "Message", "Status"],
      rows: rows.map((r) => [r.id, fmtDateTime(r.createdAt), r.package?.name, r.name, r.email, r.phone, r.message, r.status]),
    };
  }
  if (type === "holiday") {
    const rows = await prisma.holidayInquiry.findMany({ where: personWhere(f), orderBy, take });
    return {
      headers: ["ID", "Received", "Name", "Email", "Phone", "Preferred destination", "Start date", "End date", "Travelers", "Budget", "Accommodation", "Special requirements", "Status"],
      rows: rows.map((r) => [r.id, fmtDateTime(r.createdAt), r.name, r.email, r.phone, r.preferredDestination,
        r.travelStartDate ? fmtDate(r.travelStartDate) : "", r.travelEndDate ? fmtDate(r.travelEndDate) : "",
        r.numTravelers, r.budgetRange, r.accommodationPreference, r.specialRequirements, r.status]),
    };
  }
  const rows = await prisma.newsletterSubscriber.findMany({ where: subscriberWhere(f), orderBy: { subscribedAt: "desc" }, take });
  return {
    headers: ["ID", "Email", "Subscribed", "Subscribed at", "Unsubscribed at"],
    rows: rows.map((r) => [r.id, r.email, r.isSubscribed ? "Yes" : "No", fmtDateTime(r.subscribedAt), r.unsubscribedAt ? fmtDateTime(r.unsubscribedAt) : ""]),
  };
}
