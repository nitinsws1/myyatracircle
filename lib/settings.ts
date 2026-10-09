import "server-only";
import { prisma } from "@/lib/prisma";
import { SETTING_KEYS, type Settings } from "@/lib/settings-config";

// All settings as one object, with "" for anything that was never filled in.
export async function getSettings(): Promise<Settings> {
  const rows = await prisma.siteSetting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value ?? ""]));
  return Object.fromEntries(SETTING_KEYS.map((k) => [k, map.get(k) ?? ""])) as Settings;
}
