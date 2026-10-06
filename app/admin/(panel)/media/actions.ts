"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { isKind } from "@/lib/media-config";
import { collectContentUrls, findUsage, parseCloudinaryUrl } from "@/lib/media-server";

type Result = { ok: boolean; message?: string };

export async function registerMedia(input: {
  url: string; publicId: string; resourceType: string; kind: string; name: string;
  bytes?: number; width?: number; height?: number; mimeType?: string;
}) {
  await requireAdmin();
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  // only files that really live in OUR Cloudinary account can be recorded
  if (!input.url.startsWith(`https://res.cloudinary.com/${cloud}/`)) throw new Error("Invalid URL");
  if (!isKind(input.kind) || !["image", "video", "raw"].includes(input.resourceType)) throw new Error("Invalid media");

  await prisma.media.upsert({
    where: { url: input.url },
    update: {},
    create: {
      url: input.url,
      publicId: input.publicId,
      resourceType: input.resourceType,
      kind: input.kind,
      name: input.name.slice(0, 150),
      bytes: input.bytes ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      mimeType: input.mimeType ?? null,
    },
  });
  revalidatePath("/admin/media");
}

export async function updateMedia(id: number, _prev: Result | undefined, fd: FormData): Promise<Result> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  const altText = String(fd.get("altText") ?? "").trim();
  if (!name || name.length > 150) return { ok: false, message: "Name must be 1 to 150 characters" };
  if (altText.length > 200) return { ok: false, message: "Alt text must be under 200 characters" };

  const tags = [
    ...new Set(String(fd.get("tags") ?? "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)),
  ];
  if (tags.length > 15 || tags.some((t) => t.length > 30)) {
    return { ok: false, message: "Use at most 15 tags, each up to 30 characters" };
  }

  await prisma.media.update({ where: { id }, data: { name, altText: altText || null, tags } });
  revalidatePath("/admin/media");
  return { ok: true, message: "Saved" };
}

export async function deleteMedia(id: number): Promise<Result> {
  await requireAdmin();
  const asset = await prisma.media.findUnique({ where: { id } });
  if (!asset) redirect("/admin/media");

  const usage = await findUsage(asset.url);
  if (usage.length > 0) {
    return { ok: false, message: `This file is used in ${usage.length} place(s). Remove it there first, then delete it.` };
  }

  try {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    await cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.resourceType });
  } catch (e) {
    console.error(e);
    return { ok: false, message: "Could not delete the file from Cloudinary. Please try again." };
  }

  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  redirect("/admin/media");
}

// Adds files that were uploaded before the library existed (they are already used in site content)
export async function syncExistingMedia(): Promise<Result & { added?: number }> {
  await requireAdmin();
  const urls = await collectContentUrls();
  const known = new Set((await prisma.media.findMany({ where: { url: { in: urls } }, select: { url: true } })).map((m) => m.url));

  const rows = urls
    .filter((u) => !known.has(u))
    .flatMap((url) => {
      const p = parseCloudinaryUrl(url);
      if (!p) return [];
      const kind = p.resourceType === "video" ? ("VIDEO" as const) : p.resourceType === "raw" ? ("DOCUMENT" as const) : ("IMAGE" as const);
      return [{ url, publicId: p.publicId, resourceType: p.resourceType, kind, name: p.name }];
    });

  if (rows.length) await prisma.media.createMany({ data: rows, skipDuplicates: true });
  revalidatePath("/admin/media");
  return { ok: true, added: rows.length };
}
