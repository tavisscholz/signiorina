import type { Metadata } from "next";
import { Suspense } from "react";

import { SectionHeading } from "@/components/brand/SectionHeading";
import { ProductCard } from "@/components/commerce/ProductCard";
import { EventEstimator, EventEstimatorFromUrl } from "@/components/events/EventEstimator";
import { Reveal } from "@/components/motion/Reveal";
import { CTABand, PageHero } from "@/components/sections/Sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/Icons";
import { addOns, getProduct } from "@/config/catalog";
import { zones } from "@/config/delivery";
import { eventFees, grazingTables } from "@/config/events";
import { formatDollars } from "@/lib/money";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Grazing Tables + Charcuterie Boards — Showers, Birthdays + Gatherings in East Tennessee",
  description:
    "Order a charcuterie board for 6–15 online, or book a styled grazing table for 20+ from $22 per guest. Bridal showers, birthdays, reunions and cabin groups across Sevier County and the Smokies.",
  path: "/gatherings",
});

const occasions = [
  "Bridal showers",
  "Baby showers",
  "Birthdays",
  "Anniversaries",
  "Family gatherings",
  "Private celebrations",
  "Cabin groups",
  "Reunions",
];

export default function GatheringsPage() {
  const small = getProduct("gathering-board-small")!;
  const large = getProduct("gathering-board-large")!;
  const cabin = getProduct("cabin-welcome-box")!;
  const forTwo = getProduct("box-for-two")!;
  const examples = [20, 40, 60];
  const eventAddOns = addOns.filter((a) => a.scope.includes("event"));

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Styled grazing tables",
          description: "Italian-inspired grazing tables for showers, birthdays, reunions and private celebrations.",
          path: "/gatherings",
          priceFrom: grazingTables.tiers[0].pricePerPerson,
        })}
      />
      <PageHero
        eyebrow="Gatherings + grazing"
        title={
          <>
            Pass it <span className="accent">around.</span>
          </>
        }
        lede="Bridal showers, baby showers, birthdays, anniversaries, reunions and cabin weekends — with a board you can order tonight, or a styled grazing table we set up for you."
        actions={
          <>
            <ButtonLink href="/order?category=gather" size="lg">
              Order a board
            </ButtonLink>
            <ButtonLink href="/inquire?type=event&service=generous" variant="secondary" size="lg">
              Plan a grazing table
            </ButtonLink>
          </>
        }
        media="gatheringBoardLarge"
        mediaSecondary="abundantBoard"
      />

      <section className="container-page py-20 md:py-24" aria-labelledby="two-ways">
        <SectionHeading
          eyebrow="Two ways to host"
          title={<span id="two-ways">Order it, or have it styled.</span>}
          lede={`A simple rule of thumb: under about ${grazingTables.minimumGuests} guests, a board. ${grazingTables.minimumGuests} or more, a table.`}
          align="center"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="flex flex-col rounded-[2rem] border border-line bg-paper p-8 md:p-10">
            <p className="label-caps text-olive">Order online · fixed price</p>
            <h3 className="display-md mt-3 text-olive">Boards, delivered</h3>
            <p className="mt-3 text-muted">You set it out; we&apos;ve done the rest. Delivered in a window you choose.</p>
            <ul className="mt-7 divide-y divide-line border-y border-line">
              {[forTwo, small, cabin, large].map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-4 py-3">
                  <span>
                    {p.name} <span className="text-[0.88rem] text-muted">· {p.serves}</span>
                  </span>
                  <span className="price text-[1.2rem] text-olive">{formatDollars(p.price)}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-col gap-2 text-[0.92rem] text-muted">
              <li className="flex gap-2"><IconCheck size={18} className="mt-0.5 text-olive" /> 48–72 hours&apos; notice</li>
              <li className="flex gap-2"><IconCheck size={18} className="mt-0.5 text-olive" /> Delivery from {formatDollars(Math.min(...zones.map((z) => z.fee)))}, shown before you pay</li>
              <li className="flex gap-2"><IconCheck size={18} className="mt-0.5 text-olive" /> Vegetarian, pork-free, gluten-conscious + nut-free versions</li>
            </ul>
            <ButtonLink href="/order?category=gather" className="mt-8 self-start" size="lg">
              Order a board
            </ButtonLink>
          </Reveal>
          <Reveal delay={120} className="on-dark flex flex-col rounded-[2rem] bg-olive p-8 text-cream md:p-10">
            <p className="label-caps text-prosecco">Plan with us · per guest</p>
            <h3 className="display-md mt-3">Styled grazing tables</h3>
            <p className="mt-3 text-cream/80">
              We arrive, build and style the table on site. For {grazingTables.minimumGuests}+ guests.
            </p>
            <ul className="mt-7 divide-y divide-cream/15 border-y border-cream/15">
              {grazingTables.tiers.map((t) => (
                <li key={t.id} className="flex items-baseline justify-between gap-4 py-3">
                  <span>
                    {t.name} <span className="text-[0.88rem] text-cream/80">· {t.portion}</span>
                  </span>
                  <span className="price text-[1.2rem]">{formatDollars(t.pricePerPerson)}/guest</span>
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-col gap-2 text-[0.92rem] text-cream/80">
              <li className="flex gap-2"><IconCheck size={18} className="mt-0.5 text-prosecco" /> {formatDollars(grazingTables.minimumFood)} food minimum · {grazingTables.leadTimeDays} days&apos; notice</li>
              <li className="flex gap-2"><IconCheck size={18} className="mt-0.5 text-prosecco" /> Setup {formatDollars(grazingTables.setupFee.A)} (Zones A + B) or {formatDollars(grazingTables.setupFee.C)} (Zone C)</li>
              <li className="flex gap-2"><IconCheck size={18} className="mt-0.5 text-prosecco" /> Eco plates, napkins, picks, menu + allergen card</li>
            </ul>
            <ButtonLink href="/inquire?type=event&service=generous" variant="light" className="mt-8 self-start" size="lg">
              Plan a grazing table
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-paper" aria-labelledby="occasions-title">
        <div className="container-page grid gap-10 py-16 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Occasions" title={<span id="occasions-title">Whatever you&apos;re celebrating.</span>} size="md" />
          </div>
          <ul className="flex flex-wrap content-start gap-3 lg:col-span-8">
            {occasions.map((o) => (
              <li key={o} className="rounded-full border border-olive/30 bg-cream px-5 py-2.5 font-display text-[1.15rem] text-olive">
                {o}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-20 md:py-28" aria-labelledby="table-prices">
        <SectionHeading
          eyebrow="Grazing table pricing"
          title={<span id="table-prices">What a table costs.</span>}
          lede={`Per guest, with a ${formatDollars(grazingTables.minimumFood)} food minimum. Setup and delivery are added by zone.`}
        />
        {/* Focusable so keyboard users can scroll the table sideways on small screens. */}
        <div
          className="mt-10 overflow-x-auto rounded-[1.5rem] border border-line"
          tabIndex={0}
          role="region"
          aria-label="Grazing table totals by guest count"
        >
          <table className="w-full min-w-[34rem] text-left text-[0.95rem]">
            <caption className="sr-only">Food totals for styled grazing tables by guest count</caption>
            <thead className="bg-paper">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">Tier</th>
                {examples.map((g) => (
                  <th key={g} scope="col" className="px-5 py-4 text-right font-medium">
                    {g} guests
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {grazingTables.tiers.map((t) => (
                <tr key={t.id}>
                  <th scope="row" className="px-5 py-4 font-normal">
                    <span className="font-display text-[1.15rem] text-olive">{t.name}</span>{" "}
                    <span className="text-muted">· {formatDollars(t.pricePerPerson)}/guest</span>
                  </th>
                  {examples.map((g) => {
                    const food = Math.max(t.pricePerPerson * g, grazingTables.minimumFood);
                    return (
                      <td key={g} className="tabular px-5 py-4 text-right">
                        {formatDollars(food)}
                        {food === grazingTables.minimumFood && t.pricePerPerson * g < grazingTables.minimumFood ? "*" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[0.85rem] text-muted">* Food minimum applies. Food only — setup, delivery and tax are itemized in your quote.</p>
      </section>

      <section id="estimate" className="scroll-mt-24 border-t border-line bg-paper" aria-labelledby="grazing-estimate">
        <div className="container-page py-20 md:py-28">
          <SectionHeading
            eyebrow="Price your table"
            title={<span id="grazing-estimate">Run the numbers.</span>}
            lede="Pick a tier, a headcount and where you're gathering."
          />
          <div className="mt-12">
            {/* Restores a shared or "Edit estimate" link's state from the URL. */}
          <Suspense fallback={<EventEstimator kind="grazing" />}>
            <EventEstimatorFromUrl kind="grazing" />
          </Suspense>
          </div>
        </div>
      </section>

      <section className="container-page py-20" aria-labelledby="addons-title">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Make it yours" title={<span id="addons-title">Add-ons</span>} size="md" />
          </div>
          <ul className="grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:col-span-8">
            {eventAddOns.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                <span>
                  {a.name}
                  {a.serves ? <span className="ml-2 text-[0.85rem] text-muted">{a.serves}</span> : null}
                </span>
                <span className="price shrink-0 text-[1.1rem] text-olive">
                  {a.priceUnit === "person" ? `+${formatDollars(a.price)}/guest` : a.priceUnit === "hour" ? `${formatDollars(a.price)}/hr` : formatDollars(a.price)}
                </span>
              </li>
            ))}
            <li className="flex items-baseline justify-between gap-4 border-b border-line py-3">
              <span>Gluten-conscious</span>
              <span className="price text-[1.1rem] text-olive">+{formatDollars(eventFees.perPerson.glutenConscious)}/guest</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="container-page pb-8" aria-labelledby="boards-title">
        <h2 id="boards-title" className="display-md text-olive">
          Boards you can order tonight
        </h2>
        <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {[small, large, cabin].map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
