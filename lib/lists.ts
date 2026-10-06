import { cleanHtml } from "@/lib/sanitize";

// ["text", "text"]  ->  trimmed, non-empty strings
export function parseStringList(raw: string, max = 40): string[] {
  try {
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, max);
  } catch {
    return [];
  }
}

// [{ title, description }]  ->  rows with dayNumber = position (1, 2, 3...)
export function parseItinerary(raw: string, max = 60) {
  try {
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) throw new Error();

    const rows: { title: string; description: string | null }[] = [];
    for (const d of arr.slice(0, max)) {
      const title = String(d?.title ?? "").trim();
      const description = cleanHtml(String(d?.description ?? ""));
      if (!title && !description) continue; // ignore completely empty days
      if (!title) {
        return { itinerary: [], error: `Day ${rows.length + 1} needs a title (or remove the day)` };
      }
      rows.push({ title, description: description || null });
    }
    return { itinerary: rows.map((r, i) => ({ ...r, dayNumber: i + 1 })) };
  } catch {
    return { itinerary: [], error: "Itinerary data is invalid. Please re-enter it." };
  }
}
