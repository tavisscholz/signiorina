import type { Metadata } from "next";

import { deliveryAreas } from "@/config/delivery";
import { site } from "@/config/site";
import type { Product } from "@/lib/types";

/**
 * Metadata + JSON-LD builders. Only fields Signiorina has confirmed are emitted:
 * no address, hours, ratings, reviews or permits until the owner supplies them.
 */

/**
 * The site-wide share card (src/app/opengraph-image.jpg). A page that sets its own `openGraph`
 * replaces the root one entirely, so pages without a specific image fall back to this explicitly.
 */
const defaultShareImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "Signiorina — modern Italian-inspired charcuterie and hospitality in the Smokies",
};

export function pageMetadata({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      type: "website",
      locale: "en_US",
      images: [image ? { url: image } : defaultShareImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [image ?? defaultShareImage.url] },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    description: site.positioning,
    ...(site.contact.email ? { email: site.contact.email } : {}),
    ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
    ...(site.contact.instagram ? { sameAs: [site.contact.instagram] } : {}),
  };
}

export function localBusinessJsonLd() {
  const cities = Array.from(new Set(deliveryAreas.map((a) => a.city)));
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${site.url}/#business`,
    name: site.name,
    url: site.url,
    description: site.positioning,
    parentOrganization: { "@id": `${site.url}/#organization` },
    priceRange: "$$",
    currenciesAccepted: "USD",
    // Service-area business: areas served instead of a storefront address.
    areaServed: cities.map((name) => ({ "@type": "City", name, containedInPlace: { "@type": "State", name: "Tennessee" } })),
    ...(site.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: site.address.street,
            addressLocality: site.address.city,
            addressRegion: site.address.region,
            postalCode: site.address.postalCode,
            addressCountry: "US",
          },
        }
      : {}),
    ...(site.openingHours ? { openingHours: site.openingHours } : {}),
    ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
  };
}

export function serviceJsonLd({ name, description, path, priceFrom }: { name: string; description: string; path: string; priceFrom?: number }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${site.url}${path}`,
    provider: { "@id": `${site.url}/#business` },
    areaServed: Array.from(new Set(deliveryAreas.map((a) => a.city))).map((name) => ({ "@type": "City", name })),
    ...(priceFrom
      ? { offers: { "@type": "Offer", priceCurrency: "USD", price: priceFrom, priceSpecification: { "@type": "UnitPriceSpecification", price: priceFrom, priceCurrency: "USD", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: "guest" } } } }
      : {}),
  };
}

export function productJsonLd(product: Product, imageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.join(" "),
    url: `${site.url}/order/${product.slug}`,
    brand: { "@type": "Brand", name: site.name },
    ...(imageUrl ? { image: `${site.url}${imageUrl}` } : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
      url: `${site.url}/order/${product.slug}`,
      seller: { "@id": `${site.url}/#business` },
      ...(product.priceUnit === "person"
        ? { priceSpecification: { "@type": "UnitPriceSpecification", price: product.price, priceCurrency: "USD", unitText: "guest" } }
        : {}),
    },
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}
