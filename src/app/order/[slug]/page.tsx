import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { OliveSprig } from "@/components/brand/OliveSprig";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import { ProductPurchasePanel } from "@/components/commerce/ProductPurchasePanel";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Notice";
import { activeProducts, getProduct, getProductBySlug } from "@/config/catalog";
import { ALLERGEN_STATEMENT } from "@/config/content";
import { deliveryWindows, zones } from "@/config/delivery";
import { getMedia } from "@/config/media";
import { routeDayNames } from "@/lib/delivery-fees";
import { leadTimeLabel, priceLabel } from "@/lib/format";
import { formatDollars } from "@/lib/money";
import { breadcrumbJsonLd, pageMetadata, productJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  return activeProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/order/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return pageMetadata({
    title: product.seo.title,
    description: product.seo.description,
    path: `/order/${product.slug}`,
    image: getMedia(product.images[0]).src.src,
  });
}

export default function ProductPage({ params }: PageProps<"/order/[slug]">) {
  return (
    <Suspense fallback={<div className="container-page min-h-[70vh] py-16" aria-busy="true" />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}

async function ProductDetail({ params }: { params: PageProps<"/order/[slug]">["params"] }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const alternatives = (product.alternatives ?? []).map((id) => getProduct(id)).filter((p) => p && p.status === "active");
  const windows = product.allowedWindows
    ? deliveryWindows.filter((w) => product.allowedWindows!.includes(w.id))
    : deliveryWindows;

  return (
    <>
      <JsonLd data={productJsonLd(product, getMedia(product.images[0]).src.src)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Order online", path: "/order" },
          { name: product.name, path: `/order/${product.slug}` },
        ])}
      />
      <div className="container-page pt-6">
        <nav aria-label="Breadcrumb" className="text-[0.85rem] text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/order" className="hover:text-olive hover:underline">
                Order online
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-espresso">
              {product.name}
            </li>
          </ol>
        </nav>
      </div>

      <section className="container-page grid gap-10 pb-16 pt-6 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-32">
            <ProductGallery images={product.images} name={product.name} />
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="flex flex-wrap gap-2">
            {product.badge ? <Badge tone={product.signature ? "olive" : "pistachio"}>{product.badge}</Badge> : null}
            <Badge tone="outline" className="text-olive">
              {leadTimeLabel(product.leadTimeDays)}
            </Badge>
          </div>
          <h1 className="display-lg mt-5 text-olive">{product.name}</h1>
          <p className="mt-3 accent text-[1.35rem] text-olive-soft">{product.tagline}</p>
          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-y border-line py-4">
            <span className="price text-[2.4rem] leading-none text-olive">{priceLabel(product)}</span>
            <span className="text-[0.95rem] text-muted">{product.serves}</span>
          </div>
          <div className="mt-6 flex flex-col gap-4 text-[1.02rem] text-espresso/90">
            {product.description.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          {product.notes?.length ? (
            <ul className="mt-6 flex flex-col gap-2 rounded-2xl bg-pistachio-soft/60 px-5 py-4 text-[0.92rem] text-olive-deep">
              {product.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-10">
            <ProductPurchasePanel productId={product.id} />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper">
        <div className="container-page grid gap-10 py-16 md:grid-cols-3 md:py-20">
          <Reveal className="menu-card rounded-sm px-8 py-10 text-center">
            <OliveSprig className="mx-auto w-16 text-olive/60" />
            <h2 className="eyebrow mt-4 text-olive">What&apos;s typically inside</h2>
            <ul className="mt-5 space-y-2 font-display text-[1.15rem] italic leading-snug text-olive">
              {product.contents.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="mt-6 text-[0.8rem] text-muted">Indicative — fruit and a few pieces change with the season.</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="display-sm text-olive">Good for</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {product.useCases.map((u) => (
                <li key={u} className="rounded-full border border-olive/30 px-4 py-1.5 text-[0.9rem] text-olive">
                  {u}
                </li>
              ))}
            </ul>
            <h2 className="display-sm mt-10 text-olive">Delivery</h2>
            <ul className="mt-4 space-y-2 text-[0.95rem] text-muted">
              {zones.map((z) => (
                <li key={z.id}>
                  <span className="text-espresso">{z.label}:</span> {formatDollars(z.fee)}
                  {z.freeDeliveryAt ? `, free over ${formatDollars(z.freeDeliveryAt)}` : ""}
                  {z.routeDays ? `, ${formatDollars(z.routeDays.fee)} on ${routeDayNames(z.id)} route days` : ""}
                </li>
              ))}
              <li>
                <span className="text-espresso">Windows:</span> {windows.map((w) => `${w.label} ${w.display}`).join(" · ")}
              </li>
            </ul>
            <Link href="/delivery" className="mt-4 inline-block text-[0.9rem] text-olive underline underline-offset-4">
              Check your delivery area
            </Link>
          </Reveal>
          <Reveal delay={200}>
            <h2 className="display-sm text-olive">Allergies &amp; dietary needs</h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{ALLERGEN_STATEMENT}</p>
            <Link href="/inquire?type=allergy" className="mt-4 inline-block text-[0.9rem] text-olive underline underline-offset-4">
              Contact us about an allergy
            </Link>
          </Reveal>
        </div>
      </section>

      {alternatives.length > 0 ? (
        <section className="container-page py-20" aria-labelledby="also-good">
          <h2 id="also-good" className="display-md text-olive">
            Also good on the table
          </h2>
          <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {alternatives.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
