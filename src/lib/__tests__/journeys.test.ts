import { describe, expect, it } from "vitest";

import { eventPackages } from "@/config/events";
import { journeyRedirects, journeys } from "@/config/journeys";
import { eventPackageViews } from "@/lib/event-packages";

describe("three journeys", () => {
  it("use the three customer-facing names, in order", () => {
    expect(journeys.map((j) => j.name)).toEqual(["Everyday", "Events", "Weddings"]);
    expect(journeys.map((j) => j.cta)).toEqual(["Shop Everyday", "Explore Packages", "Build Your Table"]);
  });

  it("redirect old URLs into the journeys when on, and new URLs back when off", () => {
    const on = journeyRedirects(true);
    expect(on).toContainEqual({ source: "/order", destination: "/everyday", permanent: false });
    expect(on).toContainEqual({ source: "/gatherings", destination: "/events", permanent: false });
    // Classic estimate links (they always carry ?service=) open the planner, ahead of the plain redirect.
    const gatherings = on.filter((r) => r.source === "/gatherings");
    expect(gatherings[0]).toMatchObject({ has: [{ type: "query", key: "service" }], destination: "/events/plan?step=2" });
    expect(on.find((r) => r.source === "/weddings")).toMatchObject({ has: [{ type: "query", key: "service" }], destination: "/weddings/build?step=3" });
    // Product, cart and checkout URLs never move.
    expect(on.some((r) => r.source.startsWith("/order/") || r.source.startsWith("/checkout") || r.source === "/cart")).toBe(false);

    const off = journeyRedirects(false);
    expect(off.map((r) => [r.source, r.destination])).toEqual([
      ["/everyday", "/order"],
      ["/events", "/gatherings"],
      ["/events/plan", "/inquire"],
      ["/weddings/build", "/weddings"],
    ]);
    expect([...on, ...off].every((r) => r.permanent === false)).toBe(true);
  });
});

describe("event package names", () => {
  it("are proposals: unapproved names only appear where placeholders show, labelled", () => {
    expect(eventPackages.namesApproved).toBe(false);
    const live = eventPackageViews(false);
    expect(live.map((p) => p.name)).toEqual(["Light grazing table", "Generous grazing table", "Premium grazing table"]);
    expect(live.every((p) => !p.proposed)).toBe(true);
    const preview = eventPackageViews(true);
    expect(preview.map((p) => p.name)).toEqual(["The Spuntino", "The Festa", "The Abbondanza"]);
    expect(preview.every((p) => p.proposed)).toBe(true);
  });

  it("keep the published per-guest prices", () => {
    expect(eventPackageViews(false).map((p) => p.tier.pricePerPerson)).toEqual([22, 30, 38]);
  });
});

describe("inquiry payloads", () => {
  const base = {
    name: "Ada Guest",
    email: "ada@example.com",
    phone: "865-555-0100",
    eventType: "Wedding",
    eventLocation: "Gatlinburg",
    serviceInterest: "The Gathering Table",
  };

  it("still require a message from the classic form", async () => {
    const { inquirySchema } = await import("@/lib/validation");
    const r = inquirySchema.safeParse(base);
    expect(r.success).toBe(false);
    expect(r.error?.issues.map((i) => i.path.join("."))).toContain("message");
  });

  it("accept a planner submission without one, and reject a malformed planner block", async () => {
    const { inquirySchema } = await import("@/lib/validation");
    expect(inquirySchema.safeParse({ ...base, planner: { journey: "weddings", start: "preset", preset: "cocktail-hour" } }).success).toBe(true);
    expect(inquirySchema.safeParse({ ...base, planner: { journey: "brunch" } }).success).toBe(false);
  });
});
