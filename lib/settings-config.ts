// Every site-wide setting is one row in SiteSetting (key + value). These are the keys.
export const SETTING_KEYS = [
  "siteName", "tagline", "logo", "favicon",
  "phone", "whatsapp", "email", "address", "workingHours", "mapEmbedUrl",
  "footerText", "copyrightText",
  "siteMetaTitle", "siteMetaDescription",
  "gaId",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];
export type Settings = Record<SettingKey, string>;

export const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "x", label: "X (Twitter)" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "pinterest", label: "Pinterest" },
  { key: "tripadvisor", label: "TripAdvisor" },
  { key: "telegram", label: "Telegram" },
] as const;

export const platformLabel = (key: string) => SOCIAL_PLATFORMS.find((p) => p.key === key)?.label ?? key;

export type SettingsState = { ok?: boolean; errors?: Record<string, string>; message?: string } | undefined;
export type SocialState = { ok: boolean; error?: string } | undefined;
