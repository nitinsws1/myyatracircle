"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { SETTING_KEYS, SOCIAL_PLATFORMS, type SettingKey, type SettingsState, type SocialState } from "@/lib/settings-config";

const get = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const isUrl = (v: string) => /^(https?:\/\/|\/)/.test(v);

// refresh the admin page AND the whole public site (header, footer, contact details)
const refreshAll = () => {
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
};

// ================= GENERAL SETTINGS =================
export async function saveSettings(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requireAdmin();
  const errors: Record<string, string> = {};
  const v = {} as Record<SettingKey, string>;
  for (const k of SETTING_KEYS) v[k] = get(fd, k);

  if (v.siteName.length < 2 || v.siteName.length > 80) errors.siteName = "Site name must be 2 to 80 characters";
  if (v.tagline.length > 150) errors.tagline = "Keep the tagline under 150 characters";

  for (const k of ["logo", "favicon"] as const) {
    if (v[k] && !isUrl(v[k])) errors[k] = "Invalid image URL";
  }

  if (v.phone && !/^\+?[\d\s()-]{5,25}$/.test(v.phone)) errors.phone = "Use digits, spaces, + ( ) and - only";

  // WhatsApp: keep digits only (country code first), e.g. 919876543210
  v.whatsapp = v.whatsapp.replace(/[\s+()-]/g, "");
  if (v.whatsapp && !/^\d{8,15}$/.test(v.whatsapp)) errors.whatsapp = "Enter 8 to 15 digits with the country code, e.g. 919876543210";

  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) errors.email = "Enter a valid email address";
  if (v.address.length > 300) errors.address = "Keep the address under 300 characters";
  if (v.workingHours.length > 150) errors.workingHours = "Keep this under 150 characters";

  // the admin may paste the whole <iframe ...> from Google Maps, we only keep its src
  const iframeSrc = /src=["']([^"']+)["']/.exec(v.mapEmbedUrl);
  if (iframeSrc) v.mapEmbedUrl = iframeSrc[1];
  if (v.mapEmbedUrl && !v.mapEmbedUrl.startsWith("https://www.google.com/maps/embed")) {
    errors.mapEmbedUrl = "Use the embed link from Google Maps (Share > Embed a map). It starts with https://www.google.com/maps/embed";
  }

  if (v.footerText.length > 300) errors.footerText = "Keep the footer text under 300 characters";
  if (v.copyrightText.length > 150) errors.copyrightText = "Keep this under 150 characters";
  if (v.siteMetaTitle.length > 100) errors.siteMetaTitle = "Keep the title under 100 characters";
  if (v.siteMetaDescription.length > 300) errors.siteMetaDescription = "Keep the description under 300 characters";

  // only the Measurement ID is stored, never pasted scripts
  v.gaId = v.gaId.toUpperCase();
  if (v.gaId && !/^G-[A-Z0-9]{6,}$/.test(v.gaId)) errors.gaId = "Use the Measurement ID that starts with G-, e.g. G-ABC123XYZ9";

  if (Object.keys(errors).length) return { errors };

  try {
    await prisma.$transaction(
      SETTING_KEYS.map((key) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value: v[key] || null },
          create: { key, value: v[key] || null },
        })
      )
    );
  } catch (e) {
    console.error(e);
    return { message: "Something went wrong while saving. Please try again." };
  }
  refreshAll();
  return { ok: true, message: "Settings saved" };
}

// ================= SOCIAL LINKS =================
function parseSocial(fd: FormData) {
  const platform = get(fd, "platform");
  const url = get(fd, "url").trim();

  if (!SOCIAL_PLATFORMS.some((p) => p.key === platform)) {
    return { error: "Choose a platform" } as const;
  }

  // Validate a normal HTTPS URL
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "https:") {
      return {
        error: "Enter a valid HTTPS link",
      } as const;
    }
  } catch {
    return {
      error: "Enter a valid full link starting with https://",
    } as const;
  }

  if (url.length > 300) {
    return {
      error: "URL must be 300 characters or less",
    } as const;
  }

  return { data: { platform, url } } as const;
}

export async function createSocial(
  _prev: SocialState,
  fd: FormData
): Promise<SocialState> {
  await requireAdmin();

  const p = parseSocial(fd);

  if ("error" in p) {
    return { ok: false, error: p.error };
  }

  // Prevent duplicate platform
  const existing = await prisma.socialLink.findFirst({
    where: {
      platform: p.data.platform,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    return {
      ok: false,
      error: `${p.data.platform} link already exists. Edit the existing link instead.`,
    };
  }

  const max = await prisma.socialLink.aggregate({
    _max: {
      sortOrder: true,
    },
  });

  try {
    await prisma.socialLink.create({
      data: {
        ...p.data,
        sortOrder: (max._max.sortOrder ?? -1) + 1,
      },
    });
  } catch (error) {
    // Protect against duplicate inserts caused by simultaneous requests
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        ok: false,
        error: `${p.data.platform} link already exists. Edit the existing link instead.`,
      };
    }

    throw error;
  }

  refreshAll();

  return { ok: true };
}

export async function updateSocial(id: number, _prev: SocialState, fd: FormData): Promise<SocialState> {
  await requireAdmin();
  const p = parseSocial(fd);
  if ("error" in p) return { ok: false, error: p.error };
  await prisma.socialLink.updateMany({ where: { id }, data: p.data });
  refreshAll();
  return { ok: true };
}

export async function deleteSocial(id: number) {
  await requireAdmin();
  await prisma.socialLink.deleteMany({ where: { id } });
  refreshAll();
}

export async function toggleSocial(id: number) {
  await requireAdmin();
  const s = await prisma.socialLink.findUnique({ where: { id } });
  if (!s) return;
  await prisma.socialLink.update({ where: { id }, data: { isActive: !s.isActive } });
  refreshAll();
}

// swap with the neighbour, then renumber 0,1,2...
export async function moveSocial(id: number, dir: -1 | 1) {
  await requireAdmin();
  const rows = await prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { id: true } });
  const ids = rows.map((r) => r.id);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await prisma.$transaction(ids.map((rid, idx) => prisma.socialLink.update({ where: { id: rid }, data: { sortOrder: idx } })));
  refreshAll();
}
