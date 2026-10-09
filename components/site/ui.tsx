import Link from "next/link";

// Same width as the template: 1200px content, 24px / 40px side space on small screens
export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1200px] px-6 md:px-10 xl:px-0 ${className}`}>{children}</div>;
}

// Small gold capital label, optionally followed by a thin gold line (on light backgrounds)
export function Eyebrow({ children, tone = "light", line = false }: { children: React.ReactNode; tone?: "light" | "dark"; line?: boolean }) {
  return (
    <p className={`flex items-center gap-4 text-[12px] font-semibold uppercase tracking-[0.2em] ${tone === "dark" ? "text-gold" : "text-gold-dark"}`}>
      {children}
      {line && <span className="h-px w-24 bg-gold" aria-hidden />}
    </p>
  );
}

type Variant = "gold" | "outline" | "outline-dark";
const VARIANTS: Record<Variant, string> = {
  gold: "bg-gold text-navy border border-gold hover:bg-gold-dark hover:border-gold-dark hover:text-white",
  outline: "border border-white/70 text-white hover:bg-white hover:text-navy",
  "outline-dark": "border border-navy text-navy hover:bg-navy hover:text-white",
};

// Square, uppercase, wide-spaced button with an arrow, like the template
export function Btn({ href, variant = "gold", children, className = "" }: {
  href: string; variant?: Variant; children: React.ReactNode; className?: string;
}) {
  return (
    <Link href={href}
      className={`inline-flex items-center justify-center gap-2 px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] transition-colors ${VARIANTS[variant]} ${className}`}>
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

// Text link with a gold underline, e.g. "View All Journeys →"
export function ArrowLink({ href, children, tone = "light" }: { href: string; children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <Link href={href}
      className={`inline-flex items-center gap-2 border-b border-gold pb-0.5 text-sm font-semibold transition-colors ${
        tone === "dark" ? "text-white hover:text-gold-light" : "text-navy hover:text-gold-dark"}`}>
      {children} <span aria-hidden>→</span>
    </Link>
  );
}

// Eyebrow + big heading + intro line, with an optional link on the right
export function SectionHeading({ eyebrow, title, subtitle, tone = "light", line = false, action }: {
  eyebrow?: string; title: string; subtitle?: string | null; tone?: "light" | "dark"; line?: boolean; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow tone={tone} line={line}>{eyebrow}</Eyebrow>}
        <h2 className={`mt-4 text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl ${tone === "dark" ? "text-white" : "text-navy"}`}>{title}</h2>
        {subtitle && <p className={`mt-4 text-lg font-light leading-relaxed ${tone === "dark" ? "text-white/70" : "text-grey"}`}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
