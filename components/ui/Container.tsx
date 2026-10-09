import type { ElementType, ReactNode } from "react";
import styles from "./Container.module.css";

type ContainerProps = {
  as?: ElementType;
  width?: "default" | "editorial" | "wide";
  bleed?: boolean;
  className?: string;
  children: ReactNode;
};

export default function Container({ as: Tag = "div", width = "default", bleed, className, children }: ContainerProps) {
  const widthClass = width === "editorial" ? styles.editorial : width === "wide" ? styles.wide : "";
  const classes = [styles.container, widthClass, bleed ? styles.bleed : "", className].filter(Boolean).join(" ");
  return <Tag className={classes}>{children}</Tag>;
}
