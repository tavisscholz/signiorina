import clsx from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "olive" | "fig" | "pistachio";

const tones: Record<Tone, string> = {
  neutral: "border-line bg-paper text-espresso",
  olive: "border-olive/25 bg-olive/[0.06] text-espresso",
  fig: "border-fig/30 bg-fig/[0.06] text-espresso",
  pistachio: "border-pistachio bg-pistachio-soft/60 text-espresso",
};

export function Notice({
  tone = "neutral",
  title,
  children,
  className,
  role,
  action,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "status" | "alert";
  action?: ReactNode;
}) {
  return (
    <div className={clsx("rounded-2xl border px-5 py-4", tones[tone], className)} role={role}>
      {title ? <p className="font-display text-[1.2rem] leading-snug">{title}</p> : null}
      {children ? <div className={clsx("text-[0.94rem] leading-relaxed", title && "mt-1 text-muted")}>{children}</div> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export function Badge({ children, tone = "cream", className }: { children: ReactNode; tone?: "cream" | "olive" | "pistachio" | "fig" | "outline"; className?: string }) {
  const t = {
    cream: "bg-paper/90 text-olive",
    olive: "bg-olive text-cream",
    pistachio: "bg-pistachio-soft text-olive-deep",
    fig: "bg-fig text-cream",
    outline: "border border-current",
  }[tone];
  return (
    <span className={clsx("inline-flex items-center rounded-full px-3 py-1 text-[0.66rem] font-medium uppercase tracking-[0.18em]", t, className)}>
      {children}
    </span>
  );
}
