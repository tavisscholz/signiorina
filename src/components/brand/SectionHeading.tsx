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
  tone?: "dark" | "light";
}) {
  const sizeClass = { xl: "display-xl", lg: "display-lg", md: "display-md" }[size];
  return (
    <div className={clsx("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {eyebrow ? (
        <p className={clsx("eyebrow flex items-center gap-3", tone === "dark" ? "text-olive-soft" : "text-prosecco")}>
          <span aria-hidden="true" className={clsx("h-px w-8", tone === "dark" ? "bg-olive/40" : "bg-prosecco/60")} />
          {eyebrow}
        </p>
      ) : null}
      <Tag className={clsx(sizeClass, tone === "dark" ? "text-olive" : "text-cream")}>{title}</Tag>
      {lede ? (
        <div className={clsx("lede max-w-2xl", tone === "dark" ? "text-muted" : "text-cream/80", align === "center" && "mx-auto")}>
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
