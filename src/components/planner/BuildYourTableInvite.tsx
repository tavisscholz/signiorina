import Link from "next/link";

import { TrackedLink } from "@/components/journeys/Tracking";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrow } from "@/components/ui/Icons";
import { getAddOn } from "@/config/catalog";
import { getWeddingPackage, weddingPresets } from "@/config/events";
import { formatDollars } from "@/lib/money";

/** Two ways into Build Your Table, for the weddings page (threeJourneyArchitectureV2). */
export function BuildYourTableInvite() {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-8">
        <h3 className="display-sm text-olive">Start with a favorite</h3>
        <ul className="mt-5 grid gap-4 md:grid-cols-3">
          {weddingPresets.map((p) => {
            const base = getWeddingPackage(p.packageId)!;
            const extras = [...(p.dopUpgrade ? ["DOP upgrade"] : []), ...p.addOns.map((a) => getAddOn(a.id)?.name ?? a.id)];
            return (
              <li key={p.id}>
                <TrackedLink
                  href={`/weddings/build?preset=${p.id}&step=2`}
                  event="journey_selected"
                  props={{ journey: "weddings", location: "weddings-favorites", preset: p.id }}
                  className="group flex h-full flex-col gap-2 rounded-[1.5rem] border border-line-strong bg-paper p-5 transition-colors hover:border-olive"
                >
                  <span className="font-display text-[1.4rem] leading-tight text-olive">{p.name}</span>
                  <span className="text-[0.92rem] text-muted">{p.line}</span>
                  <span className="mt-auto border-t border-line pt-3 text-[0.85rem] text-muted">
                    {base.name} · {formatDollars(base.pricePerPerson)}/guest
                    {extras.length ? <span className="block">With {extras.join(", ")}</span> : null}
                  </span>
                  <span className="label-caps mt-1 inline-flex items-center gap-2 text-[0.68rem] text-olive">
                    Start here <IconArrow size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </TrackedLink>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col justify-between gap-5 rounded-[1.5rem] bg-olive p-7 text-cream on-dark lg:col-span-4">
        <div>
          <h3 className="display-sm">Build my own</h3>
          <p className="mt-2 text-[0.95rem] text-cream/85">
            Pick a package and make every decision yourself, with the estimate updating as you go.
          </p>
        </div>
        <ButtonLink href="/weddings/build" variant="light" className="self-start">
          Build Your Table
        </ButtonLink>
        <p className="text-[0.85rem] text-cream/80">
          Planner or venue?{" "}
          <Link href="/inquire?type=wedding" className="text-cream underline underline-offset-4">
            Send us a note instead
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
