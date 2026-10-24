import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SectionHeading } from "@/components/brand/SectionHeading";
import { ProductCard } from "@/components/commerce/ProductCard";
import { CTABand, PageHero } from "@/components/sections/Sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/Icons";
import { areaPages, getAreaPage } from "@/config/areas";
import { getProduct } from "@/config/catalog";
import { deliveryWindows, getArea, getZone } from "@/config/delivery";
import { routeDayNames } from "@/lib/delivery-fees";
import { formatDollars } from "@/lib/money";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  return areaPages.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/areas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getAreaPage(slug);
  if (!page) return { title: "Not found" };
  return pageMetadata({ title: page.metaTitle, description: page.metaDescription, path: `/areas/${page.slug}` });
}

export default function AreaPage({ params }: PageProps<"/areas/[slug]">) {
  return (
    <Suspense fallback={<div className="container-page min-h-[70vh] py-16" aria-busy="true" />}>
      <AreaContent params={params} />
    </Suspense>
  );
}

async function AreaContent({ params }: { params: PageProps<"/areas/[slug]">["params"] }) {
  const { slug } = await params;
  const page = getAreaPage(slug);
  const area = page ? getArea(page.areaId) : undefined;
  if (!page || !area) notFound();
  const zone = getZone(area.zone);
  const products = page.productIds.map((id) => getProduct(id)).filter((p) => p && p.status === "active");
  const zoneFacts = [
    `${zone.label}: ${formatDollars(zone.fee)} delivery${zone.freeDeliveryAt ? `, free over ${formatDollars(zone.freeDeliveryAt)}` : ""}`,
    ...(zone.routeDays
      ? [`${formatDollars(zone.routeDays.fee)} on ${routeDayNames(zone.id)} route days; corporate orders over ${formatDollars(zone.routeDays.corporateFreeDeliveryAt)} ship free`]
      : []),
    `Windows: ${deliveryWindows.map((w) => w.display).join(" · ")}`,
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Delivery", path: "/delivery" },
          { name: area.name, path: `/areas/${page.slug}` },
        ])}
      />
      <PageHero
        eyebrow={`${area.name}, Tennessee`}
        title={page.title}
        lede={page.intro}
        actions={
          <>
            <ButtonLink href="/order" size="lg">
              Order online
            </ButtonLink>
            <ButtonLink href="/inquire" variant="secondary" size="lg">
              Plan a gathering
            </ButtonLink>
          </>
        }
        media={page.media}
      >
        <ul className="mt-8 flex flex-col gap-2 text-[0.95rem] text-muted">
          {[...zoneFacts, ...page.highlights].map((h) => (
            <li key={h} className="flex gap-2">
              <IconCheck size={18} className="mt-0.5 shrink-0 text-olive" />
              {h}
            </li>
          ))}
        </ul>
      </PageHero>
      <section className="container-page py-16" aria-labelledby="area-products">
        <SectionHeading eyebrow={`Popular in ${area.name}`} title={<span id="area-products">Good places to start.</span>} size="md" />
        <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p!.id} product={p!} />
          ))}
        </div>
      </section>
      <CTABand />
    </>
  );
}
