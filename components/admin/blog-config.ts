export type BlogState = "PUBLISHED" | "SCHEDULED" | "DRAFT";

// A post is "scheduled" when it is Published but its date is still in the future
export function blogState(status: "DRAFT" | "PUBLISHED", publishedAt: Date | null, now = new Date()): BlogState {
  if (status === "DRAFT") return "DRAFT";
  return publishedAt && publishedAt > now ? "SCHEDULED" : "PUBLISHED";
}

export const STATE_LABEL: Record<BlogState, string> = { PUBLISHED: "Published", SCHEDULED: "Scheduled", DRAFT: "Draft" };
export const STATE_STYLE: Record<BlogState, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  SCHEDULED: "bg-sky-50 text-sky-700",
  DRAFT: "bg-amber-50 text-amber-700",
};

export const fmtBlogDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
