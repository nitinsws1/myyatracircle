import styles from "./SectionLabel.module.css";

type SectionLabelProps = {
  tone?: "gold-dark" | "gold" | "navy";
  className?: string;
  children: string;
};

export default function SectionLabel({ tone = "gold-dark", className, children }: SectionLabelProps) {
  const toneClass = tone === "gold" ? styles.gold : tone === "navy" ? styles.navy : styles["gold-dark"];
  return <p className={[styles.eyebrow, toneClass, className].filter(Boolean).join(" ")}>{children}</p>;
}
