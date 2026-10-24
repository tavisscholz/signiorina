import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Photo } from "@/components/brand/Photo";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { TrackView, TrackedLink } from "@/components/journeys/Tracking";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck, IconPlus } from "@/components/ui/Icons";
import { Badge } from "@/components/ui/Notice";
import { getAddOn } from "@/config/catalog";
import { zones } from "@/config/delivery";
import { eventFees, eventOccasions, eventPackages, grazingTables } from "@/config/events";
import { flags } from "@/config/flags";
import { eventPackageViews } from "@/lib/event-packages";
import { formatDollars } from "@/lib/money";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Events — Styled Grazing Tables for Birthdays, Showers + Corporate Gatherings",
  description: `Choose a styled grazing table for your birthday, shower, graduation, anniversary or office gathering of ${grazingTables.minimumGuests}+ guests, from ${formatDollars(grazingTables.tiers[0].pricePerPerson)} per guest. See your estimate before you request a proposal.`,
  path: "/events",
});

/** Events journey (threeJourneyArchitectureV2): three packages to choose between, then a short planner. */
export default function EventsPage() {
  // With the flag off, next.config redirects /events to /gatherings before this renders.
  if (!flags.threeJourneyArchitectureV2) notFound();
  const packages = eventPackageViews();
  const examples = [20, 40, 60];
  const upgrades = [
    `DOP upgrade +${formatDollars(eventFees.perPerson.dopUpgrade)}/guest`,
    `Gluten-conscious +${formatDollars(eventFees.perPerson.glutenConscious)}/guest`,
    `Serving-piece rental ${formatDollars(eventFees.servingPieceRental)}`,
    `Attendant ${formatDollars(eventFees.attendant.hourly)}/hr (${eventFees.attendant.minimumHours}-hr min)`,
    ...["burrata-focaccia", "dolce-board", "panini-tray", "celebration-pack"].map((id) => {
      const a = getAddOn(id)!;
      return `${a.name} ${formatDollars(a.price)}`;
    }),
  ];

  return (
    <>
      <TrackView event="journey_landing_view" props={{ journey: "events" }} />
      <JsonLd
        data={serviceJsonLd({
          name: "Styled grazing tables for events",
          description: "Italian-inspired grazing tables for birthdays, showers, graduations, anniversaries and corporate gatherings.",
          path: "/events",
          priceFrom: grazingTables.tiers[0].pricePerPerson,
        })}
      />

      <section className="container-page pb-12 pt-10 md:pt-14">
        <div className="hero-enter max-w-3xl">
          <p className="eyebrow flex items-center gap-3 text-olive-soft">
            <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
            Events
          </p>
          <h1 className="display-xl mt-5 text-olive">
            Gatherings, <span className="accent">beautifully catered.</span>
          </h1>
          <p className="lede mt-6 text-muted">
            Three styled grazing tables for {grazingTables.minimumGuests} guests or more, priced per guest and set up on site.
            Pick one, tell us about your event, and see the estimate before you ask for a proposal.
          </p>
        </div>
        <div className="hero-enter mt-8" style={{ ["--hero-delay" as string]: "120ms" }}>
          <p className="text-[0.92rem] text-muted">What are you celebrating?</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {eventOccasions.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/events/plan?occasion=${o.id}`}
                  className="inline-block rounded-full border border-olive/30 bg-paper px-4 py-2 text-[0.92rem] text-olive transition-colors hover:border-olive"
                >
                  {o.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="packages" className="container-page scroll-mt-28" aria-labelledby="packages-title">
        <h2 id="packages-title" className="sr-only">
          Event packages
        </h2>
        <ul className="grid gap-6 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <Reveal as="li" key={pkg.tierId} delay={i * 110}>
              <article
                id={`package-${pkg.tierId}`}
                className="flex h-full scroll-mt-28 flex-col overflow-hidden rounded-[1.75rem] border border-line bg-paper"
              >
                <Photo media={pkg.image} className="aspect-[3/2] w-full" sizes="(min-width: 1024px) 30vw, 92vw" priority={i === 0} />
                <div className="flex flex-1 flex-col p-6 md:p-7">
                  {pkg.proposed ? (
                    <Badge tone="fig" className="self-start">
                      Proposed name — pending approval
                    </Badge>
                  ) : null}
                  <h3 className="display-sm mt-3 text-olive">{pkg.name}</h3>
                  <p className="mt-1 text-[0.98rem] text-muted">{pkg.subline}</p>
                  <p className="mt-5 flex items-baseline gap-2">
                    <span className="price text-[2.4rem] leading-none text-olive">{formatDollars(pkg.tier.pricePerPerson)}</span>
                    <span className="text-[0.9rem] text-muted">per guest</span>
                  </p>
                  <p className="mt-1 text-[0.88rem] text-muted">
                    {pkg.tier.portion} · {grazingTables.minimumGuests}+ guests · {formatDollars(grazingTables.minimumFood)} food
                    minimum
                  </p>

                  <h4 className="label-caps mt-6 text-[0.68rem] text-olive">Included</h4>
                  <ul className="mt-2 flex flex-col gap-1.5 text-[0.9rem]">
                    {eventPackages.includes.map((x) => (
                      <li key={x} className="flex gap-2">
                        <IconCheck size={16} className="mt-0.5 shrink-0 text-olive" /> {x}
                      </li>
                    ))}
                  </ul>
                  <h4 className="label-caps mt-5 text-[0.68rem] text-olive">Added to every table</h4>
                  <ul className="mt-2 flex flex-col gap-1.5 text-[0.9rem] text-muted">
                    <li className="flex gap-2">
                      <IconPlus size={16} className="mt-0.5 shrink-0" /> Setup + styling {formatDollars(grazingTables.setupFee.A)}{" "}
                      (Zones A + B) or {formatDollars(grazingTables.setupFee.C)} (Zone C)
                    </li>
                    <li className="flex gap-2">
                      <IconPlus size={16} className="mt-0.5 shrink-0" /> Delivery{" "}
                      {zones.map((z) => formatDollars(z.fee)).join(" / ")} by zone, plus tax
                    </li>
                  </ul>

                  <div className="mt-auto pt-7">
                    <TrackedLink
                      href={`/events/plan?service=${pkg.tierId}`}
                      event="event_package_selected"
                      props={{ package: pkg.tierId, location: "events-catalog" }}
                      className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-olive px-6 py-3.5 label-caps text-[0.72rem] text-cream transition-colors hover:bg-olive-deep"
                    >
                      Select {pkg.name}
                    </TrackedLink>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </ul>
        <p className="mt-6 text-[0.88rem] text-muted">
          Optional for any package: {upgrades.join(" · ")}. No service charge, no mandatory gratuity, no card surcharge.
        </p>
      </section>

      <section className="container-page py-20 md:py-24" aria-labelledby="compare-title">
        <SectionHeading
          eyebrow="Compare"
          title={<span id="compare-title">Food totals at a glance.</span>}
          lede={`Per guest, with a ${formatDollars(grazingTables.minimumFood)} food minimum. Setup, delivery and tax are added in your estimate.`}
          size="md"
        />
        {/* Focusable so keyboard users can scroll the table sideways on small screens. */}
        <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-line" tabIndex={0} role="region" aria-label="Food totals by guest count">
          <table className="w-full min-w-[30rem] text-left text-[0.95rem]">
            <caption className="sr-only">Food totals for each package by guest count</caption>
            <thead className="bg-paper">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium text-olive">
                  Guests
                </th>
                {packages.map((p) => (
                  <th key={p.tierId} scope="col" className="px-5 py-4 font-medium text-olive">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {examples.map((g) => (
                <tr key={g}>
                  <th scope="row" className="px-5 py-4 font-normal">
                    {g} guests
                  </th>
                  {packages.map((p) => (
                    <td key={p.tierId} className="tabular px-5 py-4">
                      {formatDollars(Math.max(p.tier.pricePerPerson * g, grazingTables.minimumFood))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-line bg-paper" aria-labelledby="good-to-know">
        <div className="container-page grid gap-12 py-16 md:py-20 lg:grid-cols-2">
          <div>
            <h2 id="good-to-know" className="display-sm text-olive">
              Good to know
            </h2>
            <ul className="mt-6 flex flex-col gap-3 text-[0.95rem] text-muted">
              <li>Book at least {grazingTables.leadTimeDays} days ahead. Inside {eventFees.rush.underDays} days, if we can take it, food is +{eventFees.rush.foodPercent}%.</li>
              <li>Federal holidays add {eventFees.federalHolidayFoodPercent}% to food.</li>
              <li>We confirm availability and send a written quote; a {eventFees.retainerPercent}% nonrefundable retainer reserves your date.</li>
              <li>
                Allergies in the group? Tell us when you request your proposal, or{" "}
                <Link href="/inquire?type=allergy" className="text-olive underline underline-offset-4">
                  ask us first
                </Link>
                .
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <div className="rounded-[1.5rem] border border-line bg-cream p-6">
              <h3 className="display-sm text-olive">Fewer than {grazingTables.minimumGuests} guests?</h3>
              <p className="mt-2 text-[0.95rem] text-muted">A board or two from Everyday is the better fit — fixed price, delivered.</p>
              <ButtonLink href="/everyday?category=gather" variant="secondary" className="mt-4">
                Shop boards
              </ButtonLink>
            </div>
            <div className="rounded-[1.5rem] border border-line bg-cream p-6">
              <h3 className="display-sm text-olive">Office lunch, not an event?</h3>
              <p className="mt-2 text-[0.95rem] text-muted">
                Lunch boxes and drop-off spreads order online.{" "}
                <Link href="/corporate" className="text-olive underline underline-offset-4">
                  Corporate options
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
