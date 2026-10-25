import type { MetadataRoute } from "next";

import { areaPages } from "@/config/areas";
import { activeProducts } from "@/config/catalog";
import { flags } from "@/config/flags";
import { noindexFollowRoutes } from "@/config/indexing";
import { journeyRedirects } from "@/config/journeys";
import { site } from "@/config/site";

// Landing, delivery and informational pages for both flag states. Paths the current flag state
// redirects, and the noindex planners, are dropped below rather than kept in a second list.
// Cart, checkout, confirmation and API routes are never listed.
const pages = [
  "",
  "/weddings",
  "/events",
  "/everyday",
  "/gatherings",
  "/order",
  "/corporate",
  "/cabin-delivery",
  "/delivery",
  "/about",
  "/faq",
  "/inquire",
  "/privacy",
  "/terms",
];

// No lastModified: there's no reliable per-page modification date, and a build date on every
// URL would be noise.
export default function sitemap(): MetadataRoute.Sitemap {
  const redirected = new Set(
    journeyRedirects(flags.threeJourneyArchitectureV2)
      .filter((r) => !r.has)
      .map((r) => r.source),
  );
  const indexablePages = pages.filter((p) => !redirected.has(p) && !noindexFollowRoutes.includes(p));
  return [
    ...indexablePages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...activeProducts().map((p) => ({ url: `${site.url}/order/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...areaPages.map((a) => ({ url: `${site.url}/areas/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
