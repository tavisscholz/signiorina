import type { MetadataRoute } from "next";

import { areaPages } from "@/config/areas";
import { activeProducts } from "@/config/catalog";
import { flags } from "@/config/flags";
import { site } from "@/config/site";

// Only routes that answer 200 for the current flag state; redirected ones are left out.
const classicPages = ["", "/weddings", "/gatherings", "/corporate", "/cabin-delivery", "/order", "/about", "/faq", "/inquire", "/delivery"];
const journeyPages = ["", "/everyday", "/events", "/weddings", "/weddings/build", "/corporate", "/cabin-delivery", "/about", "/faq", "/inquire", "/delivery"];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = flags.threeJourneyArchitectureV2 ? journeyPages : classicPages;
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...activeProducts().map((p) => ({ url: `${site.url}/order/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...areaPages.map((a) => ({ url: `${site.url}/areas/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
