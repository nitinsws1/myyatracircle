import type { ElementType, ReactNode } from "react";
import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  as?: ElementType;
  tone?: "navy" | "white";
  size?: "default" | "md";
  id?: string;
  className?: string;
  children: ReactNode;
};

export default function SectionHeading({ as: Tag = "h2", tone = "navy", size = "default", id, className, children }: SectionHeadingProps) {
  const toneClass = tone === "white" ? styles.white : styles.navy;
  const sizeClass = size === "md" ? styles.md : "";
  return (
    <Tag id={id} className={[styles.heading, toneClass, sizeClass, className].filter(Boolean).join(" ")}>
      {children}
    </Tag>
  );
}
