import type { Metadata } from "next";
import { Suspense } from "react";

import { Photo } from "@/components/brand/Photo";
import { InquiryForm } from "@/components/events/InquiryForm";
import { ButtonLink } from "@/components/ui/Button";
import { eventFees, grazingTables, weddingPackages, weddingRules } from "@/config/events";
import { flags } from "@/config/flags";
import { routes } from "@/config/journeys";
import { site } from "@/config/site";
import { formatDollars } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Plan Your Gathering — Wedding + Event Inquiry",
  description:
    "Tell Signiorina about your wedding, shower, celebration or corporate event. We reply with availability and a written quote.",
  path: "/inquire",
});

export default function InquirePage() {
  return (
    <section className="container-page grid gap-14 pb-20 pt-12 md:pt-16 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="eyebrow flex items-center gap-3 text-olive-soft">
          <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
          Plan your gathering
        </p>
        <h1 className="display-lg mt-5 text-olive">
          Tell us what you&apos;re <span className="accent">gathering for.</span>
        </h1>
        <p className="lede mt-5 max-w-xl text-muted">
          Weddings, showers, celebrations and corporate events. Share the basics and we&apos;ll come back with availability and
          a written quote.
        </p>
        {flags.threeJourneyArchitectureV2 ? (
          <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-line bg-paper p-5 text-[0.95rem] sm:grid-cols-2">
            <p className="sm:col-span-2 text-muted">Want an instant, itemized estimate first?</p>
            <ButtonLink href="/weddings/build" size="sm">
              Build Your Table — weddings
            </ButtonLink>
            <ButtonLink href="/events/plan" variant="secondary" size="sm">
              Plan an event
            </ButtonLink>
          </div>
        ) : null}
        <div className="mt-12">
          <Suspense fallback={<div className="h-[60rem] animate-pulse rounded-2xl bg-linen/60" />}>
            <InquiryForm />
          </Suspense>
        </div>
      </div>

      <aside className="flex flex-col gap-6 lg:col-span-5" aria-label="Before you write">
        <Photo media="menuCard" shape="arch" className="hidden aspect-[4/3] w-full lg:block" sizes="35vw" />
        <div className="rounded-[1.75rem] border border-line bg-paper p-7">
          <h2 className="display-sm text-olive">Prices, up front</h2>
          <ul className="mt-5 divide-y divide-line text-[0.95rem]">
            {weddingPackages.map((p) => (
              <li key={p.id} className="flex justify-between gap-4 py-2.5">
                <span>{p.name}</span>
                <span className="tabular text-olive">
                  {formatDollars(p.pricePerPerson)}/guest · {formatDollars(p.minimumFood)} min
                </span>
              </li>
            ))}
            <li className="flex justify-between gap-4 py-2.5">
              <span>Styled grazing tables</span>
              <span className="tabular text-olive">
                {grazingTables.tiers.map((t) => formatDollars(t.pricePerPerson)).join(" / ")}/guest
              </span>
            </li>
          </ul>
          <p className="mt-4 text-[0.85rem] text-muted">
            Weddings book {weddingRules.bookingLeadDays}+ days ahead; grazing tables {grazingTables.leadTimeDays} days. A{" "}
            {eventFees.retainerPercent}% nonrefundable retainer reserves your date.
          </p>
        </div>
        <div className="rounded-[1.75rem] bg-olive p-7 text-cream on-dark">
          <h2 className="display-sm">What happens next</h2>
          <ol className="mt-5 flex flex-col gap-3 text-[0.95rem] text-cream/85">
            <li>01 — We read every detail and check the date.</li>
            <li>02 — You get availability and a written, itemized quote.</li>
            <li>03 — A retainer reserves the date; the final count is due later.</li>
          </ol>
        </div>
        <div className="rounded-[1.75rem] border border-line p-7">
          <p className="font-display text-[1.3rem] text-olive">Looking for boxes, lunch or cabin delivery?</p>
          <p className="mt-2 text-[0.92rem] text-muted">Those order online — no inquiry needed.</p>
          <ButtonLink href={routes.store} variant="secondary" className="mt-4">
            Order online
          </ButtonLink>
          {site.contact.email ? (
            <p className="mt-4 text-[0.9rem] text-muted">
              Or email <a href={`mailto:${site.contact.email}`} className="text-olive underline">{site.contact.email}</a>
            </p>
          ) : null}
        </div>
      </aside>
    </section>
  );
}
