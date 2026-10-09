import type { ReactNode } from "react";
import styles from "./AtmoFrame.module.css";

type AtmoFrameProps = {
  className?: string;
  children: ReactNode;
};

// A thin "atmosphere" wrapper for full-bleed photography: a soft light
// overlay plus a faint grain texture (both drawn as pseudo-elements so they
// never intercept pointer events), used on the destination/experience photo
// tiles and the Travel Styles stage image.
export default function AtmoFrame({ className, children }: AtmoFrameProps) {
  return <div className={[styles.atmo, className].filter(Boolean).join(" ")}>{children}</div>;
}
