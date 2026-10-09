import { getAdmin } from "@/lib/auth";
import { exportData } from "@/lib/inquiries";
import { isType } from "@/lib/inquiry-config";

// A route handler is not covered by the admin layout, so it checks the login itself.
export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });

  const sp = new URL(req.url).searchParams;
  const type = sp.get("type") ?? "";
  if (!isType(type)) return new Response("Unknown type", { status: 400 });

  const { headers, rows } = await exportData(type, {
    q: sp.get("q")?.trim() || undefined,
    status: sp.get("status") || undefined,
  });

  // Cells starting with = + - @ can run as formulas when opened in Excel, so we defuse them.
  // Phone-like values (digits, spaces, dashes, a leading +) are left untouched.
  const cell = (v: unknown) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s) && !/^\+?[\d\s()-]+$/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = "\uFEFF" + [headers, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${date}.csv"`,
    },
  });
}
