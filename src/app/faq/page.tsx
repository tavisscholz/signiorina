import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/brand/SectionHeading";
import { FaqList } from "@/components/sections/FaqList";
import { CTABand } from "@/components/sections/Sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqSections } from "@/config/content";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ — Ordering, Delivery, Weddings + Corporate",
  description:
    "How much notice Signiorina needs, where we deliver, delivery windows, cabin delivery, allergies, wedding minimums and Knoxville corporate route days.",
  path: "/faq",
});

export default function FaqPage() {
  const confirmed = faqSections.flatMap((s) => s.items).filter((i) => !i.clientInput);
  return (
    <>
      <JsonLd data={faqJsonLd(confirmed)} />
      <section className="container-page pb-10 pt-12 md:pt-20">
        <SectionHeading
          as="h1"
          size="xl"
          eyebrow="FAQ"
          title={
            <>
              Good <span className="accent">questions.</span>
            </>
          }
          lede="Who we are, ordering, delivery, weddings and office lunches. Still wondering? Send us a note."
        />
        <nav aria-label="FAQ sections" className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {faqSections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="inline-block rounded-full border border-olive/40 px-4 py-2 text-[0.9rem] text-olive hover:bg-olive hover:text-cream">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <div className="container-narrow flex flex-col gap-16 pb-10">
        {faqSections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-32" aria-labelledby={`${s.id}-title`}>
            <h2 id={`${s.id}-title`} className="eyebrow mb-4 text-olive-soft">
              {s.title}
            </h2>
            <FaqList items={s.items} />
          </section>
        ))}
        <p className="text-[0.95rem] text-muted">
          Didn&apos;t see your question?{" "}
          <Link href="/inquire" className="text-olive underline underline-offset-4">
            Ask us directly
          </Link>
          .
        </p>
      </div>
      <CTABand />
    </>
  );
}
