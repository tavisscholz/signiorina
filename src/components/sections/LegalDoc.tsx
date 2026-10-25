import type { ReactNode } from "react";

/** Plain, readable layout for the Privacy Policy and Terms of Use. */
export function LegalDoc({ title, updated, intro, children }: { title: string; updated: string; intro: ReactNode; children: ReactNode }) {
  return (
    <article className="container-narrow pb-20 pt-12 md:pt-20">
      <p className="eyebrow flex items-center gap-3 text-olive-soft">
        <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
        Last updated {updated}
      </p>
      <h1 className="display-lg mt-5 text-olive">{title}</h1>
      <div className="lede mt-6 text-muted">{intro}</div>
      <div className="mt-12 flex flex-col gap-10">{children}</div>
    </article>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 text-[1rem] leading-relaxed text-muted">
      <h2 className="display-sm text-olive">{title}</h2>
      {children}
    </section>
  );
}
