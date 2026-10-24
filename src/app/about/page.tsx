import type { Metadata } from "next";

import { OliveSprig } from "@/components/brand/OliveSprig";
import { Photo } from "@/components/brand/Photo";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { CTABand, EditorialSection } from "@/components/sections/Sections";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Notice";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Signiorina — Modern Aperitivo in the Smokies",
  description:
    "Signiorina brings modern Italian-inspired hospitality to Smoky Mountain weddings, cabins and offices. The best part is usually around the table.",
  path: "/about",
});

const signatures = [
  { title: "Prosciutto + a salame", body: "Finocchiona or soppressata alongside the prosciutto." },
  { title: "Parmigiano + a soft cheese", body: "Chunks of the good stuff, and something creamy beside it." },
  { title: "Focaccia or grissini", body: "Bread worth tearing, next to the crackers." },
  { title: "Antipasti", body: "Castelvetrano olives, marinated artichoke, roasted peppers." },
  { title: "Dolce, fruit + herbs", body: "Amaretti, biscotti or chocolate, with seasonal fruit, rosemary and basil." },
];

const promises = [
  { title: "Prices you can see", body: "Fixed prices for everything we deliver, and per-guest prices for events — published, not hidden behind a form." },
  { title: "Fees before you pay", body: "Delivery, rush and holiday fees are shown before checkout. No service charge, no mandatory gratuity, no card surcharge." },
  { title: "Honest about allergens", body: "We'll leave ingredients off, but our kitchen is shared — so we never promise allergen-free." },
  { title: "Food, not drinks", body: "We don't sell, serve or deliver alcohol. The table is ours; the glasses are yours." },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-page grid items-end gap-10 pb-12 pt-12 md:pt-20 lg:grid-cols-12">
        <Reveal className="lg:col-span-8">
          <p className="eyebrow flex items-center gap-3 text-olive-soft">
            <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
            About
          </p>
          <h1 className="display-xl mt-5 text-olive">
            The best part is usually <span className="accent">around the table.</span>
          </h1>
        </Reveal>
        <Reveal delay={150} className="lg:col-span-4">
          <p className="lede text-muted">
            Signiorina is modern Italian-inspired hospitality made mobile — generous, polished, social food that makes any
            gathering feel beautifully hosted.
          </p>
        </Reveal>
      </section>

      <section className="container-page" aria-hidden="true">
        <div className="grid grid-cols-12 gap-3 md:gap-5">
          <Reveal variant="oval" className="col-span-7 md:col-span-5">
            <Photo media="abundantBoard" shape="rounded" className="aspect-[4/3] w-full" sizes="40vw" alt="" />
          </Reveal>
          <Reveal delay={100} className="col-span-5 md:col-span-3">
            <Photo media="figsProsciutto" shape="arch" className="aspect-[3/4] w-full" sizes="25vw" alt="" />
          </Reveal>
          <Reveal delay={200} className="col-span-6 md:col-span-2 md:mt-16">
            <Photo media="waxSeal" shape="oval" className="aspect-square w-full" sizes="18vw" alt="" />
          </Reveal>
          <Reveal delay={300} className="col-span-6 md:col-span-2">
            <Photo media="apron" shape="rounded" className="aspect-[3/4] w-full" sizes="18vw" alt="" />
          </Reveal>
        </div>
      </section>

      <EditorialSection media="weddingTable" shape="arch" aspect="aspect-[4/5]">
        <SectionHeading eyebrow="Modern aperitivo" title={<>A ritual, more than a menu.</>} size="md" />
        <div className="mt-6 flex flex-col gap-4 text-[1.05rem] text-muted">
          <p>
            In Italy, aperitivo is the hour between the day and the evening — a drink in hand, something good on a small plate,
            nobody in a hurry. It&apos;s less about any particular dish than about the ritual: slowing down, sharing good things,
            making people feel looked after.
          </p>
          <p>
            That&apos;s what we bring to the Smokies. To the wedding between the vows and the dancing, to the cabin on the
            first night, to the conference room at noon on a Tuesday. Pranzo, aperitivo, the long table — we borrow the
            rituals, not the clichés.
          </p>
        </div>
      </EditorialSection>

      <section className="border-y border-line bg-paper" aria-labelledby="signatures">
        <div className="container-page py-20 md:py-28">
          <SectionHeading
            eyebrow="The Signiorina standard"
            title={<span id="signatures">Five things on every table.</span>}
            lede="Whether it's an $18 box or a wedding for eighty, each build carries the same signatures — so it always tastes, and looks, like us."
            align="center"
          />
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {signatures.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 90} className="menu-card flex flex-col items-center gap-3 rounded-sm px-5 py-8 text-center">
                <span className="price text-[1.8rem] text-pistachio">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-[1.25rem] leading-tight text-olive">{s.title}</h3>
                <p className="text-[0.9rem] text-muted">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="founder">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Who we are" title={<span id="founder">Behind Signiorina</span>} size="md" />
        </div>
        <div className="lg:col-span-7">
          {site.showPlaceholders ? (
            <div className="relative rounded-[1.5rem] border border-dashed border-olive/30 bg-paper p-8">
              <Badge tone="fig" className="absolute -top-3 left-6">
                Placeholder — founder story to come
              </Badge>
              <p className="text-muted">
                This space is reserved for the founder&apos;s story, in their own words — who they are, why Italian hosting, and
                why the Smokies. It&apos;s hidden on the live site until the real story is supplied.
              </p>
            </div>
          ) : (
            <p className="text-[1.05rem] text-muted">
              Signiorina serves the Smokies and Knoxville. We&apos;d love to feed your next gathering.
            </p>
          )}
        </div>
      </section>

      <section className="on-dark bg-olive text-cream" aria-labelledby="promises">
        <div className="container-page py-20 md:py-28">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading tone="light" eyebrow="What you can count on" title={<span id="promises">Good food, plainly priced.</span>} />
            <OliveSprig className="w-28 text-prosecco/70" />
          </div>
          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {promises.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 100} className="flex flex-col gap-3 border-t border-cream/20 pt-6">
                <h3 className="font-display text-[1.4rem]">{p.title}</h3>
                <p className="text-[0.95rem] text-cream/75">{p.body}</p>
              </Reveal>
            ))}
          </ul>
          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href="/delivery" variant="outline-light">
              Delivery areas + fees
            </ButtonLink>
            <ButtonLink href="/faq" variant="outline-light">
              Questions, answered
            </ButtonLink>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
