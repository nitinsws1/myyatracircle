import "server-only";
import { prisma } from "@/lib/prisma";
import { PAGE_META_FIELDS, type PageMeta } from "@/lib/content-config";

// Heading, banner and SEO of one public page. The website will call this too.
export async function getPageMeta(slug: string): Promise<PageMeta> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: `page.${slug}.` } } });
  const map = new Map(rows.map((r) => [r.key, r.value ?? ""]));
  return Object.fromEntries(PAGE_META_FIELDS.map((f) => [f, map.get(`page.${slug}.${f}`) ?? ""])) as PageMeta;
}
