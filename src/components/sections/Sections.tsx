import clsx from "clsx";
import type { ReactNode } from "react";

import { OliveSprig } from "@/components/brand/OliveSprig";
import { Photo } from "@/components/brand/Photo";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Notice";
import { testimonials } from "@/config/content";
import { site } from "@/config/site";

/* ------------------------------------------------------------------ */
/* Page hero for inner pages                                           */
/* ------------------------------------------------------------------ */

export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  media,
  mediaSecondary,
  tone = "light",
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  media: string;
  mediaSecondary?: string;
  tone?: "light" | "dark";
  children?: ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <section className={clsx("relative overflow-hidden", dark ? "on-dark bg-olive text-cream" : "bg-cream")}>
      <div className="container-page grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <div className="lg:col-span-6">
          <Reveal>
            <p className={clsx("eyebrow mb-5 flex items-center gap-3", dark ? "text-prosecco" : "text-olive-soft")}>
              <span aria-hidden="true" className={clsx("h-px w-8", dark ? "bg-prosecco/60" : "bg-olive/40")} />
              {eyebrow}
            </p>
            <h1 className={clsx("display-xl", dark ? "text-cream" : "text-olive")}>{title}</h1>
            {lede ? <div className={clsx("lede mt-6 max-w-xl", dark ? "text-cream/80" : "text-muted")}>{lede}</div> : null}
            {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
            {children}
          </Reveal>
        </div>
        <div className="relative lg:col-span-6">
          <Reveal variant="oval" className="relative">
            <Photo media={media} shape="arch" priority className="aspect-[4/5] w-full max-w-[34rem] lg:ml-auto" sizes="(min-width: 1024px) 40vw, 92vw" />
          </Reveal>
          {mediaSecondary ? (
            <Reveal delay={250} className="absolute -bottom-6 left-0 w-[38%] max-w-[13rem] sm:left-6 lg:-left-4">
              <Photo
                media={mediaSecondary}
                shape="oval"
                className={clsx("aspect-[4/5] border-[6px] shadow-[var(--shadow-lift)]", dark ? "border-olive" : "border-cream")}
                sizes="220px"
              />
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final call to action                                                */
/* ------------------------------------------------------------------ */

export function CTABand({
  title = "Bring everyone to the table.",
  lede = "Tell us what you're gathering for, or order a box for tonight — either way, we'll take it from here.",
  primary = { href: "/inquire", label: "Plan your gathering" },
  secondary = { href: "/order", label: "Order online" },
}: {
  title?: ReactNode;
  lede?: ReactNode;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
}) {
  return (
    <section className="container-page py-20 md:py-28">
      <Reveal className="relative mx-auto flex max-w-4xl flex-col items-center overflow-hidden rounded-[50%/22%] border border-olive/20 bg-paper px-6 py-16 text-center shadow-[var(--shadow-card)] md:rounded-[50%/30%] md:px-16 md:py-20">
        <OliveSprig className="mb-6 w-24 text-olive/70" />
        <h2 className="display-lg text-olive">{title}</h2>
        <p className="lede mt-5 max-w-xl text-muted">{lede}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={primary.href} size="lg">
            {primary.label}
          </ButtonLink>
          <ButtonLink href={secondary.href} variant="secondary" size="lg">
            {secondary.label}
          </ButtonLink>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Process                                                             */
/* ------------------------------------------------------------------ */

export function ProcessSteps({
  steps,
  className,
  tone = "light",
}: {
  steps: Array<{ title: string; body: string }>;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <ol className={clsx("grid gap-8", steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2", className)}>
      {steps.map((s, i) => (
        <Reveal as="li" key={s.title} delay={i * 120} className="flex flex-col gap-3">
          <span className={clsx("price text-[3rem] leading-none", tone === "dark" ? "text-prosecco" : "text-olive-soft/80")} aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className={clsx("display-sm", tone === "dark" ? "text-cream" : "text-olive")}>{s.title}</h3>
          <p className={clsx("text-[0.98rem]", tone === "dark" ? "text-cream/75" : "text-muted")}>{s.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Social proof (placeholder-aware)                                    */
/* ------------------------------------------------------------------ */

export function Testimonials({ className }: { className?: string }) {
  const real = testimonials.filter((t) => !t.placeholder);
  const visible = real.length > 0 ? real : site.showPlaceholders ? testimonials : [];
  if (visible.length === 0) return null;
  return (
    <section className={clsx("container-page py-20", className)} aria-labelledby="kind-words">
      <SectionHeading eyebrow="Kind words" title="From around the table" align="center" size="md" />
      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {visible.map((t, i) => (
          <Reveal as="li" key={i} delay={i * 100}>
            <figure className="relative flex h-full flex-col justify-between gap-6 rounded-[1.5rem] border border-dashed border-olive/30 bg-paper p-7">
              {t.placeholder ? (
                <Badge tone="fig" className="absolute -top-3 left-6">
                  Placeholder — dev only
                </Badge>
              ) : null}
              <blockquote className="font-display text-[1.3rem] italic leading-snug text-olive">“{t.quote}”</blockquote>
              <figcaption className="text-[0.85rem] uppercase tracking-[0.16em] text-muted">
                {t.attribution} · {t.context}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Small facts row                                                      */
/* ------------------------------------------------------------------ */

export function FactList({
  facts,
  className,
  tone = "light",
}: {
  facts: Array<{ icon: ReactNode; title: string; body: ReactNode }>;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <ul className={clsx("grid gap-6 sm:grid-cols-2", className)}>
      {facts.map((f) => (
        <li key={f.title} className="flex gap-4">
          <span
            className={clsx(
              "grid size-11 shrink-0 place-items-center rounded-full border",
              tone === "dark" ? "border-prosecco/40 text-prosecco" : "border-olive/25 text-olive",
            )}
          >
            {f.icon}
          </span>
          <div>
            <p className={clsx("font-medium", tone === "dark" ? "text-cream" : "text-espresso")}>{f.title}</p>
            <div className={clsx("text-[0.94rem]", tone === "dark" ? "text-cream/75" : "text-muted")}>{f.body}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Editorial split: image + copy                                        */
/* ------------------------------------------------------------------ */

export function EditorialSection({
  media,
  shape = "rounded",
  reverse = false,
  children,
  className,
  aspect = "aspect-[4/5]",
  mediaClassName,
}: {
  media: string;
  shape?: "rounded" | "oval" | "arch" | "rect";
  reverse?: boolean;
  children: ReactNode;
  className?: string;
  aspect?: string;
  mediaClassName?: string;
}) {
  return (
    <section className={clsx("container-page grid items-center gap-10 py-16 md:py-24 lg:grid-cols-2 lg:gap-20", className)}>
      <Reveal variant={shape === "oval" || shape === "arch" ? "oval" : "rise"} className={clsx(reverse && "lg:order-2")}>
        <Photo media={media} shape={shape} className={clsx(aspect, "w-full", mediaClassName)} sizes="(min-width: 1024px) 45vw, 92vw" />
      </Reveal>
      <Reveal delay={120}>{children}</Reveal>
    </section>
  );
}
