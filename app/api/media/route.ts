import { prisma } from "@/lib/prisma";
import { getAdmin } from "@/lib/auth";
import { isKind } from "@/lib/media-config";
import { mediaWhere } from "@/lib/media-server";

const PER_PAGE = 24;

export async function GET(req: Request) {
  if (!(await getAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim() || undefined;
  const kinds = (sp.get("kinds") ?? "").split(",").filter(isKind);
  const page = Math.max(1, Number(sp.get("page")) || 1);

  const rows = await prisma.media.findMany({
    where: mediaWhere(q, kinds),
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE + 1, // one extra row tells us whether there is a next page
    select: { id: true, url: true, name: true, kind: true, altText: true },
  });
  return Response.json({ items: rows.slice(0, PER_PAGE), hasMore: rows.length > PER_PAGE });
}
