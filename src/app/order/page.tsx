import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ShopCatalog, ShopCatalogFallback } from "@/components/commerce/ShopCatalog";
import { StoreExtras, StoreFacts } from "@/components/commerce/StoreSections";
import { activeProducts, categories } from "@/config/catalog";
import { grazingTables, weddingPackages } from "@/config/events";
import { formatDollars } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Order Online — Charcuterie Boxes, Boards + Lunch Delivery",
  description:
    "Order Italian-inspired charcuterie boxes, boards, cabin welcome boxes, gift boxes and office lunches online. Fixed prices and delivery across Sevierville, Pigeon Forge and Gatlinburg.",
  path: "/order",
});

export default function OrderPage() {
  const products = activeProducts();
  return (
    <>
      <section className="container-page pb-10 pt-12 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="hero-enter lg:col-span-7">
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
          </div>
          <div className="hero-enter lg:col-span-5" style={{ ["--hero-delay" as string]: "120ms" }}>
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
          </div>
        </div>

        <StoreFacts />
      </section>

      <section className="container-page" aria-label="Products">
        <Suspense fallback={<ShopCatalogFallback products={products} />}>
          <ShopCatalog products={products} categories={categories} />
        </Suspense>
      </section>

      <StoreExtras />
    </>
  );
}
