export const KINDS = ["IMAGE", "VIDEO", "DOCUMENT", "LOGO"] as const;
export type MediaKind = (typeof KINDS)[number];
export const isKind = (v: string): v is MediaKind => (KINDS as readonly string[]).includes(v);

export const KIND_LABEL: Record<MediaKind, string> = { IMAGE: "Image", VIDEO: "Video", DOCUMENT: "Document", LOGO: "Logo" };
export const KIND_PLURAL: Record<MediaKind, string> = { IMAGE: "Images", VIDEO: "Videos", DOCUMENT: "Documents", LOGO: "Logos" };

const IMG = ["image/jpeg", "image/png", "image/webp"];
export const KIND_RULES: Record<MediaKind, { mimes: string[]; maxMb: number; hint: string }> = {
  IMAGE: { mimes: IMG, maxMb: 5, hint: "JPG, PNG or WebP, max 5 MB" },
  LOGO: { mimes: IMG, maxMb: 5, hint: "JPG, PNG or WebP, max 5 MB" },
  VIDEO: { mimes: ["video/mp4", "video/webm"], maxMb: 50, hint: "MP4 or WebM, max 50 MB" },
  DOCUMENT: {
    mimes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    maxMb: 10,
    hint: "PDF or Word, max 10 MB",
  },
};

// returns a message if the file is not allowed for this kind, otherwise null
export function checkFile(file: File, kind: MediaKind): string | null {
  const rule = KIND_RULES[kind];
  if (!rule.mimes.includes(file.type)) return `not allowed as ${KIND_LABEL[kind].toLowerCase()}. ${rule.hint}`;
  if (file.size > rule.maxMb * 1024 * 1024) return `too large. ${rule.hint}`;
  return null;
}

export function kindFromFile(file: File): MediaKind {
  if (file.type.startsWith("video/")) return "VIDEO";
  if (file.type.startsWith("application/")) return "DOCUMENT";
  return "IMAGE";
}

export function fmtBytes(n?: number | null) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
