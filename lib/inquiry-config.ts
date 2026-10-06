export const STATUSES = ["NEW", "IN_PROGRESS", "CLOSED"] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  NEW: "New",
  IN_PROGRESS: "In progress",
  CLOSED: "Closed",
};
export const STATUS_STYLE: Record<Status, string> = {
  NEW: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

export const TYPES = ["contact", "tour", "holiday", "newsletter"] as const;
export type InquiryType = (typeof TYPES)[number];
export const TYPE_LABEL: Record<InquiryType, string> = {
  contact: "Contact",
  tour: "Tour inquiries",
  holiday: "Custom holidays",
  newsletter: "Newsletter",
};

export const isType = (v: string): v is InquiryType => (TYPES as readonly string[]).includes(v);
export const isStatus = (v: string): v is Status => (STATUSES as readonly string[]).includes(v);

export const PAGE_SIZE = 20;

// Times are shown in India time on purpose, so every admin sees the same thing
export const fmtDateTime = (d: Date) =>
  d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
// @db.Date columns are stored as UTC midnight, so format them in UTC
export const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "UTC" });
