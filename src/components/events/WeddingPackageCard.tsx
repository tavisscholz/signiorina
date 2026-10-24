import clsx from "clsx";

import { Photo } from "@/components/brand/Photo";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/Icons";
import { weddingRules, type WeddingPackage } from "@/config/events";
import { formatDollars } from "@/lib/money";

export function WeddingPackageCard({
  pkg,
  tone = "light",
  detailed = true,
  featured = false,
  className,
  action,
}: {
  pkg: WeddingPackage;
  tone?: "light" | "dark";
  detailed?: boolean;
  featured?: boolean;
  className?: string;
  /** Optional button under the card, e.g. into Build Your Table with this package. */
  action?: { href: string; label: string };
}) {
  const dark = tone === "dark";
  return (
    <article
      className={clsx(
        "relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border",
        dark ? "border-cream/15 bg-olive-deep/60 text-cream" : "border-line bg-paper",
        featured && !dark && "ring-1 ring-olive/40",
        className,
      )}
    >
      <Photo media={pkg.image} className="aspect-[16/10] w-full" sizes="(min-width: 1024px) 30vw, 92vw" zoom />
      <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
        <div>
          <h3 className={clsx("display-sm", dark ? "text-cream" : "text-olive")}>{pkg.name}</h3>
          <p className={clsx("mt-2 accent text-[1.12rem] leading-snug", dark ? "text-cream/80" : "text-muted")}>{pkg.line}</p>
        </div>
        <div className={clsx("flex items-end justify-between gap-4 border-y py-4", dark ? "border-cream/15" : "border-line")}>
          <p>
            <span className={clsx("price text-[2.6rem] leading-none", dark ? "text-cream" : "text-olive")}>
              {formatDollars(pkg.pricePerPerson)}
            </span>
            <span className={clsx("ml-1 text-[0.9rem]", dark ? "text-cream/80" : "text-muted")}>/ guest</span>
          </p>
          <p className={clsx("text-right text-[0.82rem] leading-snug", dark ? "text-cream/85" : "text-muted")}>
            {formatDollars(pkg.minimumFood)} food minimum
            {pkg.peakSaturdayMinimum ? (
              <>
                <br />
                {formatDollars(pkg.peakSaturdayMinimum)} on peak Saturdays
              </>
            ) : null}
          </p>
        </div>
        <dl className={clsx("grid grid-cols-2 gap-3 text-[0.85rem]", dark ? "text-cream/85" : "text-muted")}>
          <div>
            <dt className="label-caps text-[0.62rem]">Portion</dt>
            <dd className="mt-1">{pkg.portion}</dd>
          </div>
          <div>
            <dt className="label-caps text-[0.62rem]">Guests</dt>
            <dd className="mt-1">{pkg.recommendedGuests}</dd>
          </div>
          <div className="col-span-2">
            <dt className="label-caps text-[0.62rem]">Best for</dt>
            <dd className="mt-1">{pkg.bestFor.join(" · ")}</dd>
          </div>
        </dl>
        {detailed ? (
          <ul className="mt-1 flex flex-col gap-2 text-[0.92rem]">
            {pkg.includes.map((item) => (
              <li key={item} className="flex gap-2.5">
                <IconCheck size={18} className={clsx("mt-0.5 shrink-0", dark ? "text-prosecco" : "text-olive")} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className={clsx("mt-auto pt-2 text-[0.8rem]", dark ? "text-cream/80" : "text-muted")}>
          Setup + styling included. Delivery and tax additional. Book {weddingRules.bookingLeadDays}+ days ahead.
        </p>
        {action ? (
          <ButtonLink href={action.href} variant={dark ? "light" : "primary"} className="mt-4 self-start">
            {action.label}
          </ButtonLink>
        ) : null}
      </div>
    </article>
  );
}
