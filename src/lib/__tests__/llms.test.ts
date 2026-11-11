import { describe, expect, it } from "vitest";

import { activeProducts } from "@/config/catalog";
import { deliveryAreas, pausedAreaIds } from "@/config/delivery";
import { eventPackages, weddingPackages } from "@/config/events";
import { site } from "@/config/site";
import { llmsTxt } from "@/lib/llms";

describe("llms.txt", () => {
  const text = llmsTxt();

  it("opens with the business name and a summary line", () => {
    expect(text.startsWith(`# ${site.name}\n\n> `)).toBe(true);
  });

  it("lists every active product, wedding package and served area", () => {
    for (const p of activeProducts()) expect(text).toContain(`${site.url}/order/${p.slug}`);
    for (const p of weddingPackages) expect(text).toContain(p.name);
    for (const a of deliveryAreas) expect(text).toContain(a.name);
  });

  it("leaves out paused areas and unapproved package names", () => {
    for (const id of pausedAreaIds) expect(text.toLowerCase()).not.toContain(id.replace("-", " "));
    if (!eventPackages.namesApproved) {
      for (const p of eventPackages.packages) expect(text).not.toContain(p.proposedName);
    }
  });

  it("links only to the configured origin", () => {
    const links = text.match(/https?:\/\/\S+/g) ?? [];
    expect(links.length).toBeGreaterThan(10);
    expect(links.every((l) => l.startsWith(site.url))).toBe(true);
  });
});
