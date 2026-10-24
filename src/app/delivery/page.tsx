import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/brand/SectionHeading";
import { ZoneCalculator } from "@/components/commerce/ZoneCalculator";
import { CTABand } from "@/components/sections/Sections";
import { activeProducts } from "@/config/catalog";
import { beyondZoneC, deliveryAreas, deliveryWindows, holidays, scheduling, zones } from "@/config/delivery";
import { eventFees, grazingTables } from "@/config/events";
import { routeDayNames } from "@/lib/delivery-fees";
import { leadTimeLabel } from "@/lib/format";
import { formatDollars } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Delivery Areas + Fees — Sevierville, Pigeon Forge, Gatlinburg + Knoxville",
  description: `Every Signiorina delivery fee, published: ${zones.map((z) => `Zone ${z.id} ${formatDollars(z.fee)}`).join(", ")} or ${formatDollars(zones.find((z) => z.routeDays)!.routeDays!.fee)} on Knoxville route days. Delivery windows, lead times, holiday rules and minimums.`,
  path: "/delivery",
});

export default function DeliveryPage() {
  const leadTimes = Array.from(
    activeProducts().reduce((map, p) => {
      map.set(p.leadTimeDays, [...(map.get(p.leadTimeDays) ?? []), p.name]);
      return map;
    }, new Map<number, string[]>()),
  ).sort((a, b) => a[0] - b[0]);

  return (
    <>
      <section className="container-page pb-12 pt-12 md:pt-20">
        <SectionHeading
          as="h1"
          size="xl"
          eyebrow="Delivery"
          title={
            <>
              Every fee, <span className="accent">published.</span>
            </>
          }
          lede="Where we deliver, when, and exactly what it costs — before you add a thing to your cart."
        />
      </section>

      <section className="container-page grid gap-10 lg:grid-cols-12" aria-labelledby="zones-title">
        <div className="lg:col-span-7">
          <h2 id="zones-title" className="sr-only">
            Delivery zones
          </h2>
          <div className="overflow-hidden rounded-[1.5rem] border border-line">
            <table className="w-full text-left text-[0.95rem]">
              <caption className="sr-only">Delivery fees by zone</caption>
              <thead className="bg-paper">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">Zone</th>
                  <th scope="col" className="px-5 py-4 font-medium">Fee</th>
                  <th scope="col" className="hidden px-5 py-4 font-medium sm:table-cell">Free at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {zones.map((z) => (
                  <tr key={z.id} className="align-top">
                    <th scope="row" className="px-5 py-4 font-normal">
                      <span className="font-display text-[1.2rem] text-olive">{z.label}</span>
                      <span className="mt-1 block text-[0.88rem] text-muted">
                        {deliveryAreas
                          .filter((a) => a.zone === z.id)
                          .map((a) => a.name)
                          .join(", ")}
                      </span>
                    </th>
                    <td className="tabular px-5 py-4">
                      {formatDollars(z.fee)}
                      {z.routeDays ? (
                        <span className="block text-[0.85rem] text-muted">
                          {formatDollars(z.routeDays.fee)} on {routeDayNames(z.id)} route days
                        </span>
                      ) : null}
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell">
                      {z.freeDeliveryAt ? `${formatDollars(z.freeDeliveryAt)}+` : z.routeDays ? `Corporate ${formatDollars(z.routeDays.corporateFreeDeliveryAt)}+ on route days` : "—"}
                    </td>
                  </tr>
                ))}
                <tr className="align-top">
                  <th scope="row" className="px-5 py-4 font-normal">
                    <span className="font-display text-[1.2rem] text-olive">Beyond Zone C</span>
                    <span className="mt-1 block text-[0.88rem] text-muted">Events only, by quote</span>
                  </th>
                  <td className="px-5 py-4" colSpan={2}>
                    Zone C fee + {formatDollars(beyondZoneC.perMileRoundTrip)}/mile round trip beyond the boundary
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[0.9rem] text-muted">
            Metro orders under {formatDollars(zones.find((z) => z.id === "C")!.offRouteMinimumSubtotal!)} travel on our{" "}
            {routeDayNames()} route. We deliver to towns, cabins, venues and resorts around Great Smoky Mountains National Park —
            not inside the park.
          </p>
        </div>
        <div className="lg:col-span-5">
          <ZoneCalculator />
        </div>
      </section>

      <section className="container-page mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-3" aria-label="Delivery rules">
        <div>
          <h2 className="display-sm text-olive">Windows</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line text-[0.95rem]">
            {deliveryWindows.map((w) => (
              <li key={w.id} className="py-3">
                <span className="font-medium">{w.label}</span> · {w.display}
                <span className="block text-[0.85rem] text-muted">{w.uses.join(", ")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.88rem] text-muted">We deliver within your window; we can&apos;t promise an exact minute.</p>
        </div>
        <div>
          <h2 className="display-sm text-olive">Notice</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line text-[0.95rem]">
            {leadTimes.map(([days, names]) => (
              <li key={days} className="py-3">
                <span className="font-medium">{leadTimeLabel(days)}</span>
                <span className="block text-[0.85rem] text-muted">{names.join(", ")}</span>
              </li>
            ))}
            <li className="py-3">
              <span className="font-medium">{grazingTables.leadTimeDays} days</span>
              <span className="block text-[0.85rem] text-muted">Styled grazing tables</span>
            </li>
          </ul>
          <p className="mt-3 text-[0.88rem] text-muted">Orders are due by noon on the cutoff day.</p>
        </div>
        <div>
          <h2 className="display-sm text-olive">Weekends + holidays</h2>
          <ul className="mt-4 flex flex-col gap-3 text-[0.95rem] text-muted">
            <li>Saturdays: online delivery in windows not reserved for events.</li>
            <li>Sundays: events only — no online delivery.</li>
            <li>
              Preorder only, with limited quantities and a {formatDollars(holidays[0].directOrderFee)} holiday fee:{" "}
              {holidays.map((h) => h.name).join(", ")}.
            </li>
            <li>No pickup at the moment — every order is delivered.</li>
          </ul>
        </div>
      </section>

      <section className="container-page mt-20" aria-labelledby="fees-title">
        <h2 id="fees-title" className="display-md text-olive">
          Other fees, in full
        </h2>
        <dl className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {[
            ["Online delivery minimum", formatDollars(scheduling.minimumOrder)],
            ["Rush (inside 48 hours, if there's room)", formatDollars(scheduling.rush.fee)],
            ["Holiday preorder fee", formatDollars(holidays[0].directOrderFee)],
            ["Grazing table setup (Zones A + B / Zone C)", `${formatDollars(grazingTables.setupFee.A)} / ${formatDollars(grazingTables.setupFee.C)}`],
            ["Serving-piece pickup (next day / same night)", `${formatDollars(eventFees.pickup.nextDay)} / ${formatDollars(eventFees.pickup.sameNight)}`],
            ["Event attendant", `${formatDollars(eventFees.attendant.hourly)}/hr, ${eventFees.attendant.minimumHours}-hr minimum`],
            ["Events on federal holidays", `+${eventFees.federalHolidayFoodPercent}% food`],
            [`Events inside ${eventFees.rush.underDays} days (if accepted)`, `+${eventFees.rush.foodPercent}% food`],
            ["Wedding + event retainer", `${eventFees.retainerPercent}%, nonrefundable`],
            ["Service charge · mandatory gratuity · card surcharge", "None"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
              <dt className="text-[0.95rem]">{label}</dt>
              <dd className="tabular shrink-0 text-olive">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[0.9rem] text-muted">
          Sales tax is calculated at checkout. Questions?{" "}
          <Link href="/faq#ordering" className="text-olive underline underline-offset-4">
            See the ordering FAQ
          </Link>
          .
        </p>
      </section>

      <CTABand />
    </>
  );
}
