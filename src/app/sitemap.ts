import type { MetadataRoute } from "next";

import { areaPages } from "@/config/areas";
import { activeProducts } from "@/config/catalog";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/weddings", "/gatherings", "/corporate", "/cabin-delivery", "/order", "/about", "/faq", "/inquire", "/delivery"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 })),
    ...activeProducts().map((p) => ({ url: `${site.url}/order/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...areaPages.map((a) => ({ url: `${site.url}/areas/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
