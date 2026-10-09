import type { CSSProperties } from "react";
import styles from "./RingMotif.module.css";

type RingMotifProps = {
  size: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
};

// A decorative, non-interactive ring outline used as an ambient motif behind
// hero/section imagery. Purely visual — always aria-hidden — with a slow
// opacity "breathe" animation (see globals.css `ringBreathe`), disabled
// automatically under prefers-reduced-motion and hidden below 767px.
export default function RingMotif({ size, color = "rgba(255,255,255,0.2)", style, className }: RingMotifProps) {
  return (
    <div
      aria-hidden="true"
      className={[styles.ring, className].filter(Boolean).join(" ")}
      style={{
        width: size,
        height: size,
        borderColor: color,
        ...style,
      }}
    />
  );
}
