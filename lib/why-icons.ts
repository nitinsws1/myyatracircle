import {
  ShieldCheck, Headset, MapPinned, Wallet, Award, Heart,
  Users, Compass, Clock, Star, Plane, Sparkles, type LucideIcon,
} from "lucide-react";

// The admin picks one of these. Only the KEY is saved in the database ("shield-check"),
// the public website maps the key back to the icon with iconByKey().
export const WHY_ICONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "shield-check", label: "Trusted & safe", Icon: ShieldCheck },
  { key: "headset", label: "24/7 support", Icon: Headset },
  { key: "map-pinned", label: "Local experts", Icon: MapPinned },
  { key: "wallet", label: "Best value", Icon: Wallet },
  { key: "award", label: "Award winning", Icon: Award },
  { key: "heart", label: "Loved by travelers", Icon: Heart },
  { key: "users", label: "Small groups", Icon: Users },
  { key: "compass", label: "Unique experiences", Icon: Compass },
  { key: "clock", label: "Flexible timing", Icon: Clock },
  { key: "star", label: "Top rated", Icon: Star },
  { key: "plane", label: "Easy travel", Icon: Plane },
  { key: "sparkles", label: "Premium service", Icon: Sparkles },
];

export const WHY_ICON_KEYS = WHY_ICONS.map((i) => i.key);
export const iconByKey = (key: string | null | undefined) => WHY_ICONS.find((i) => i.key === key)?.Icon;
