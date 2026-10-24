import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ShopCatalog, ShopCatalogFallback } from "@/components/commerce/ShopCatalog";
import { StoreExtras, StoreFacts } from "@/components/commerce/StoreSections";
import { ZoneCalculator } from "@/components/commerce/ZoneCalculator";
import { TrackView } from "@/components/journeys/Tracking";
import { ButtonLink } from "@/components/ui/Button";
import { activeProducts, categories } from "@/config/catalog";
import { grazingTables, weddingPackages } from "@/config/events";
import { flags } from "@/config/flags";
import { formatDollars } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Everyday — Charcuterie Boxes, Boards + Lunches Delivered",
  description:
    "Shop Italian-inspired charcuterie boxes, boards, cabin welcome boxes, gift boxes and office lunches. Fixed prices, guest checkout and delivery across Sevierville, Pigeon Forge, Gatlinburg and Knoxville.",
  path: "/everyday",
});

/** Everyday (threeJourneyArchitectureV2): the online store — browse, add to cart, schedule delivery, pay. */
export default function EverydayPage() {
  // With the flag off, next.config redirects /everyday to /order before this renders.
  if (!flags.threeJourneyArchitectureV2) notFound();
  const products = activeProducts();
  return (
    <>
      <TrackView event="journey_landing_view" props={{ journey: "everyday" }} />
      <section className="container-page pb-10 pt-10 md:pt-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="hero-enter lg:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-olive-soft">
              <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
              Shop
            </p>
            <h1 className="display-xl mt-5 text-olive">
              Boxes, boards <span className="accent">&amp; little indulgences.</span>
            </h1>
            <p className="lede mt-6 max-w-xl text-muted">
              Fixed prices, delivered in a window you choose. Add what you like, check out as a guest, and see every fee before
              you pay.
            </p>
          </div>
          <div className="hero-enter lg:col-span-5" style={{ ["--hero-delay" as string]: "120ms" }}>
            <ZoneCalculator source="everyday" showShopLink={false} label="Do we deliver to you?" />
          </div>
        </div>
      </section>

      <section className="container-page" aria-label="Products">
        <Suspense fallback={<ShopCatalogFallback products={products} />}>
          <ShopCatalog products={products} categories={categories} />
        </Suspense>
      </section>

      {/* Bigger groups belong in a planned journey, not the cart. */}
      <section className="container-page mt-24" aria-labelledby="bigger">
        <div className="grid gap-6 rounded-[1.75rem] border border-line bg-paper p-8 md:grid-cols-[1.2fr_1fr_1fr] md:items-center md:p-10">
          <div>
            <h2 id="bigger" className="display-sm text-olive">
              Feeding {grazingTables.minimumGuests} or more?
            </h2>
            <p className="mt-2 text-[0.95rem] text-muted">A styled table we set up on site is usually the better fit.</p>
          </div>
          <div>
            <p className="text-[0.92rem] text-muted">
              Events · from {formatDollars(grazingTables.tiers[0].pricePerPerson)}/guest
            </p>
            <ButtonLink href="/events" variant="secondary" className="mt-3">
              Explore Packages
            </ButtonLink>
          </div>
          <div>
            <p className="text-[0.92rem] text-muted">Weddings · from {formatDollars(weddingPackages[0].pricePerPerson)}/guest</p>
            <ButtonLink href="/weddings/build" className="mt-3">
              Build Your Table
            </ButtonLink>
          </div>
        </div>
      </section>

      <StoreExtras />
      <div className="container-page">
        <StoreFacts className="mt-12" />
      </div>
    </>
  );
}
