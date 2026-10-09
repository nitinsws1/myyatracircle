import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "secondaryDark" | "tertiary";

const variantClass: Record<Variant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  secondaryDark: styles.secondaryDark,
  tertiary: styles.tertiary,
};

function withArrow(children: ReactNode) {
  return (
    <>
      {children}
      <span aria-hidden="true" className="cta-arrow">
        →
      </span>
    </>
  );
}

type CommonProps = {
  variant?: Variant;
  sm?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

// A Button with an `href` renders as a Next.js <Link> (internal routes) or a
// plain <a> (external / mailto / tel) — never a <button> masquerading as a
// navigation control.
export function Button({ href, variant = "primary", sm, className, children, ...rest }: LinkButtonProps) {
  const classes = [variantClass[variant], sm ? styles.sm : "", className].filter(Boolean).join(" ");
  const isInternal = href.startsWith("/") || href.startsWith("#");
  const content = variant === "tertiary" ? withArrow(children) : withArrow(children);

  if (isInternal) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {content}
    </a>
  );
}

type ActionButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

// A Button with no `href` renders as an actual <button> for in-page actions
// (form submits, toggles) — see FeaturedBlogs' newsletter submit.
export function ActionButton({ variant = "primary", sm, className, children, ...rest }: ActionButtonProps) {
  const classes = [variantClass[variant], sm ? styles.sm : "", className].filter(Boolean).join(" ");
  return (
    <button className={classes} {...rest}>
      {withArrow(children)}
    </button>
  );
}
