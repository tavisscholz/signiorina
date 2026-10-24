import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ShopCatalog, ShopCatalogFallback } from "@/components/commerce/ShopCatalog";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { IconCalendar, IconClock, IconTruck } from "@/components/ui/Icons";
import { activeProducts, addOns, categories } from "@/config/catalog";
import { ALLERGEN_STATEMENT } from "@/config/content";
import { deliveryWindows, scheduling, zones } from "@/config/delivery";
import { grazingTables, weddingPackages } from "@/config/events";
import { routeDayNames } from "@/lib/delivery-fees";
import { formatDollars } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Order Online — Charcuterie Boxes, Boards + Lunch Delivery",
  description:
    "Order Italian-inspired charcuterie boxes, boards, cabin welcome boxes, gift boxes and office lunches online. Fixed prices and delivery across Sevierville, Pigeon Forge, Gatlinburg and Knoxville.",
  path: "/order",
});

export default function OrderPage() {
  const products = activeProducts();
  const cartAddOns = addOns.filter((a) => a.scope.includes("cart"));
  return (
    <>
      <section className="container-page pb-10 pt-12 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-olive-soft">
              <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
              Order online
            </p>
            <h1 className="display-xl mt-5 text-olive">
              Choose. Schedule. <span className="accent">We deliver.</span>
            </h1>
            <p className="lede mt-6 max-w-xl text-muted">
              Boxes, boards and lunches at fixed prices, delivered in a window you choose. Every fee is shown before you pay.
            </p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-5">
            <div className="grid gap-px overflow-hidden rounded-[1.5rem] border border-line bg-line sm:grid-cols-2">
              <div className="bg-paper p-5">
                <p className="label-caps text-[0.66rem] text-olive">Order online</p>
                <p className="mt-2 text-[0.92rem] text-muted">
                  Boxes, boards, cabin arrivals, office lunches and gifts. Fixed price, delivered.
                </p>
              </div>
              <div className="bg-paper p-5">
                <p className="label-caps text-[0.66rem] text-olive">Plan with us</p>
                <p className="mt-2 text-[0.92rem] text-muted">
                  Weddings from {formatDollars(weddingPackages[0].pricePerPerson)}/guest and styled tables for{" "}
                  {grazingTables.minimumGuests}+.{" "}
                  <Link href="/inquire" className="text-olive underline underline-offset-4">
                    Start planning
                  </Link>
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <ul className="mt-10 grid gap-4 border-y border-line py-5 text-[0.9rem] text-muted md:grid-cols-3">
          <li className="flex items-start gap-3">
            <IconTruck size={20} className="mt-0.5 shrink-0 text-olive" />
            <span>
              Delivery {zones.map((z) => `${formatDollars(z.fee)}`).join(" / ")} by zone · free over{" "}
              {formatDollars(zones[0].freeDeliveryAt!)} nearby · {formatDollars(zones[2].routeDays!.fee)} Knoxville on{" "}
              {routeDayNames("C", true)}.{" "}
              <Link href="/delivery" className="text-olive underline underline-offset-4">
                See areas
              </Link>
            </span>
          </li>
          <li className="flex items-start gap-3">
            <IconClock size={20} className="mt-0.5 shrink-0 text-olive" />
            <span>{deliveryWindows.map((w) => `${w.label} ${w.display}`).join(" · ")}</span>
          </li>
          <li className="flex items-start gap-3">
            <IconCalendar size={20} className="mt-0.5 shrink-0 text-olive" />
            <span>
              Order by noon two days ahead for most boxes. {formatDollars(scheduling.minimumOrder)} delivery minimum. No Sunday
              delivery.
            </span>
          </li>
        </ul>
      </section>

      <section className="container-page" aria-label="Products">
        <Suspense fallback={<ShopCatalogFallback products={products} />}>
          <ShopCatalog products={products} categories={categories} />
        </Suspense>
      </section>

      <section className="container-page mt-24 grid gap-12 lg:grid-cols-2">
        <Reveal className="rounded-[1.75rem] border border-line bg-paper p-8">
          <h2 className="display-sm text-olive">Add to any board</h2>
          <p className="mt-2 text-[0.95rem] text-muted">Choose add-ons on each product page.</p>
          <ul className="mt-6 divide-y divide-line">
            {cartAddOns.map((a) => (
              <li key={a.id} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  {a.name}
                  {a.serves ? <span className="ml-2 text-[0.85rem] text-muted">{a.serves}</span> : null}
                </span>
                <span className="price text-[1.15rem] text-olive">{formatDollars(a.price)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120} className="flex flex-col justify-between gap-8 rounded-[1.75rem] bg-olive p-8 text-cream on-dark">
          <div>
            <h2 className="display-sm">Dietary needs &amp; allergies</h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/80">{ALLERGEN_STATEMENT}</p>
          </div>
          <ButtonLink href="/inquire?type=allergy" variant="outline-light" className="self-start">
            Ask about an allergy
          </ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
