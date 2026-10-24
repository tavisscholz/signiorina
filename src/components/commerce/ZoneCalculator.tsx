"use client";

import clsx from "clsx";
import Link from "next/link";
import { useId, useState } from "react";

import { SelectField } from "@/components/ui/Field";
import { IconPin } from "@/components/ui/Icons";
import { beyondZoneC, deliveryAreas, deliveryWindows, getArea, zones } from "@/config/delivery";
import { track } from "@/lib/analytics";
import { routeDayNames } from "@/lib/delivery-fees";
import { formatDollars } from "@/lib/money";
import { routes } from "@/config/journeys";

/** "Do you deliver to me, and what does it cost?" — answered before anyone builds a cart. */
export function ZoneCalculator({
  className,
  tone = "light",
  source = "calculator",
  showShopLink = true,
  label = "Where are you staying or gathering?",
}: {
  className?: string;
  tone?: "light" | "dark";
  /** Analytics: where the check happened. */
  source?: string;
  /** Hide the "shop" link where the visitor is already in the store. */
  showShopLink?: boolean;
  label?: string;
}) {
  const id = useId();
  const [areaId, setAreaId] = useState("");
  const area = areaId && areaId !== "other" ? getArea(areaId) : undefined;
  const zone = area ? zones.find((z) => z.id === area.zone) : undefined;
  return (
    <div className={clsx("rounded-[1.75rem] border p-6 md:p-8", tone === "dark" ? "border-cream/20 bg-olive-deep/40 text-cream" : "border-line bg-paper", className)}>
      <SelectField
        id={`${id}-area`}
        label={<span className={tone === "dark" ? "text-cream" : undefined}>{label}</span>}
        value={areaId}
        onChange={(e) => {
          setAreaId(e.target.value);
          const a = getArea(e.target.value);
          if (a) track("delivery_zone_validated", { zone: a.zone, area: a.id, source });
        }}
        className="text-espresso"
      >
        <option value="">Choose a town or area</option>
        {deliveryAreas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
        <option value="other">Somewhere else</option>
      </SelectField>
      <div aria-live="polite" className="mt-5">
        {zone && area ? (
          <div className="animate-rise flex flex-col gap-3">
            <p className="flex items-center gap-2 font-display text-[1.45rem]">
              <IconPin size={20} /> {zone.label}
            </p>
            <ul className={clsx("flex flex-col gap-1.5 text-[0.95rem]", tone === "dark" ? "text-cream/85" : "text-muted")}>
              <li>
                Delivery {formatDollars(zone.fee)}
                {zone.freeDeliveryAt ? `, free on orders over ${formatDollars(zone.freeDeliveryAt)}` : ""}.
              </li>
              {zone.routeDays ? (
                <li>
                  {formatDollars(zone.routeDays.fee)} on {routeDayNames(zone.id)} route days (morning + midday); corporate orders over{" "}
                  {formatDollars(zone.routeDays.corporateFreeDeliveryAt)} ship free on route days.
                </li>
              ) : null}
              {zone.offRouteMinimumSubtotal ? (
                <li>Other days: orders over {formatDollars(zone.offRouteMinimumSubtotal)}.</li>
              ) : null}
              <li>Windows: {deliveryWindows.map((w) => w.display).join(" · ")}.</li>
              {area.cabinCountry ? <li>Cabin deliveries: we&apos;ll ask about gate codes and steep or gravel driveways.</li> : null}
            </ul>
            {showShopLink ? (
              <Link href={routes.store} className={clsx("mt-1 self-start underline underline-offset-4", tone === "dark" ? "text-cream" : "text-olive")}>
                Order online
              </Link>
            ) : null}
          </div>
        ) : areaId === "other" ? (
          <p className={clsx("text-[0.95rem]", tone === "dark" ? "text-cream/85" : "text-muted")}>
            Looks like this one is outside our usual route. For events we travel by quote — the Zone C fee plus{" "}
            {formatDollars(beyondZoneC.perMileRoundTrip)} a mile round trip beyond it.{" "}
            <Link href={routes.eventPlanner} className={tone === "dark" ? "text-cream underline" : "text-olive underline"}>
              Ask about an event
            </Link>
          </p>
        ) : (
          <p className={clsx("text-[0.92rem]", tone === "dark" ? "text-cream/80" : "text-muted")}>
            Pick an area to see the fee, free-delivery threshold and windows.
          </p>
        )}
      </div>
    </div>
  );
}
