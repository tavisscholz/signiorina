import { describe, expect, it, vi } from "vitest";

import sitemap from "@/app/sitemap";
import { activeProducts } from "@/config/catalog";
import { robotsHeaders } from "@/config/indexing";
import { site } from "@/config/site";

describe("sitemap", () => {
  const urls = sitemap().map((e) => e.url);
  const paths = urls.map((u) => u.slice(site.url.length) || "/");

  it("lists unique URLs on the configured origin", () => {
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((u) => u.startsWith(`${site.url}/`) || u === site.url)).toBe(true);
  });

  it("leaves out the planners, redirects and transactional pages", () => {
    for (const p of ["/weddings/build", "/events/plan", "/order", "/gatherings", "/cart", "/inquire?type=wedding"]) {
      expect(paths).not.toContain(p);
    }
    expect(paths.some((p) => p.startsWith("/checkout") || p.startsWith("/api") || p.includes("?"))).toBe(false);
  });

  it("keeps the landing pages and every active product, with no build-date lastmod", () => {
    for (const p of ["/", "/weddings", "/events", "/everyday", "/delivery"]) expect(paths).toContain(p);
    for (const product of activeProducts()) expect(paths).toContain(`/order/${product.slug}`);
    expect(sitemap().some((e) => e.lastModified)).toBe(false);
  });
});

describe("robots headers", () => {
  it("marks both planners noindex, follow in production", () => {
    expect(robotsHeaders()).toEqual([
      { source: "/weddings/build", headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }] },
      { source: "/events/plan", headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }] },
    ]);
  });

  it("keeps the whole site out of search when SITE_NOINDEX=true (staging on another host)", async () => {
    vi.stubEnv("SITE_NOINDEX", "true");
    vi.resetModules();
    try {
      const staging = await import("@/config/indexing");
      expect(staging.indexable).toBe(false);
      expect(staging.robotsHeaders()).toEqual([{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }]);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
