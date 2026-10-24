import clsx from "clsx";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  as: Tag = "h2",
  size = "lg",
  className,
  tone = "dark",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md";
  className?: string;
  /** dark = on cream, light = on olive, white = over photography or video. */
  tone?: "dark" | "light" | "white";
}) {
  const sizeClass = { xl: "display-xl", lg: "display-lg", md: "display-md" }[size];
  const colors = {
    dark: { eyebrow: "text-olive-soft", rule: "bg-olive/40", title: "text-olive", lede: "text-muted" },
    light: { eyebrow: "text-prosecco", rule: "bg-prosecco/60", title: "text-cream", lede: "text-cream/80" },
    white: { eyebrow: "text-white/80", rule: "bg-white/50", title: "text-white", lede: "text-white/85" },
  }[tone];
  return (
    <div className={clsx("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {eyebrow ? (
        <p className={clsx("eyebrow flex items-center gap-3", colors.eyebrow)}>
          <span aria-hidden="true" className={clsx("h-px w-8", colors.rule)} />
          {eyebrow}
        </p>
      ) : null}
      <Tag className={clsx(sizeClass, colors.title)}>{title}</Tag>
      {lede ? (
        <div className={clsx("lede max-w-2xl", colors.lede, align === "center" && "mx-auto")}>
          {lede}
        </div>
      ) : null}
    </div>
  );
}

/** Small oval price label — one of the brand's recurring platter shapes. */
export function PriceOval({ children, className, tone = "cream" }: { children: ReactNode; className?: string; tone?: "cream" | "olive" }) {
  return (
    <span
      className={clsx(
        "inline-flex min-w-[4.5rem] items-center justify-center rounded-[50%] px-4 py-2 price text-[1.1rem] leading-none",
        tone === "cream" ? "border border-olive/35 bg-paper/95 text-olive" : "bg-olive text-cream",
        className,
      )}
    >
      {children}
    </span>
  );
}
