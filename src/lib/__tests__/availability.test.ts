import { describe, expect, it } from "vitest";

import { checkSlot, computeDay, suggestDates, type AvailabilityRequest } from "@/lib/availability";
import type { Booking, OperationsCalendar } from "@/lib/types";

// Monday, November 2, 2026 at 10:00 AM Eastern.
const NOW = new Date("2026-11-02T15:00:00Z");
const EMPTY: OperationsCalendar = { eventBlocks: [], soldOut: [], blackoutDates: [], capacityOverrides: [] };

function req(partial: Partial<AvailabilityRequest> = {}): AvailabilityRequest {
  return {
    lines: [{ productId: "box-for-two", quantity: 1 }],
    zoneId: "A",
    isCorporate: false,
    merchandiseSubtotal: 5500,
    from: "2026-11-02",
    days: 1,
    ...partial,
  };
}

function booking(date: string, windowId: Booking["windowId"], points: number, extra: Partial<Booking> = {}): Booking {
  return { orderId: `o-${Math.random()}`, date, windowId, zoneId: "A", points, corporate: false, productQuantities: {}, ...extra };
}

const ctx = (bookings: Booking[] = [], ops: OperationsCalendar = EMPTY) => ({ now: NOW, bookings, ops });

describe("computeDay — calendar rules", () => {
  it("never offers Sundays", () => {
    expect(computeDay("2026-11-08", req(), ctx()).status).toBe("closed");
  });

  it("respects 48-hour lead time and offers rush inside it", () => {
    const wednesday = computeDay("2026-11-04", req(), ctx());
    expect(wednesday.status).toBe("available");
    expect(wednesday.rush).toBe(false);
    const tuesday = computeDay("2026-11-03", req(), ctx());
    expect(tuesday.rush).toBe(true);
    expect(computeDay("2026-11-02", req(), ctx()).status).toBe("too-soon");
  });

  it("does not rush 72-hour products and names the blocker", () => {
    const day = computeDay(
      "2026-11-04",
      req({ lines: [{ productId: "box-for-two", quantity: 1 }, { productId: "cabin-welcome-box", quantity: 1 }] }),
      ctx(),
    );
    expect(day.status).toBe("product-unavailable");
    expect(day.unavailableProducts?.[0]).toMatchObject({ productId: "cabin-welcome-box", earliestDate: "2026-11-05" });
  });

  it("sends the Cabin Welcome Box in the afternoon only", () => {
    const day = computeDay("2026-11-06", req({ lines: [{ productId: "cabin-welcome-box", quantity: 1 }] }), ctx());
    const byId = Object.fromEntries(day.windows.map((w) => [w.id, w.status]));
    expect(byId).toEqual({ morning: "not-offered", midday: "not-offered", afternoon: "available" });
  });

  it("closes a Saturday with two significant events and blocks event windows", () => {
    const busy: OperationsCalendar = {
      ...EMPTY,
      eventBlocks: [
        { date: "2026-11-07", windows: "all", significant: true },
        { date: "2026-11-07", windows: ["afternoon"], significant: true },
        { date: "2026-11-14", windows: ["afternoon"], significant: true },
      ],
    };
    expect(computeDay("2026-11-07", req(), ctx([], busy)).status).toBe("sold-out");
    const oneEvent = computeDay("2026-11-14", req(), ctx([], busy));
    expect(oneEvent.status).toBe("available");
    expect(oneEvent.windows.find((w) => w.id === "afternoon")?.status).toBe("event-blocked");
  });

  it("holds holiday dates to preorder rules and daily caps", () => {
    const lateNow = new Date("2026-12-22T15:00:00Z"); // Tue Dec 22, 10 AM
    const day = computeDay("2026-12-23", req(), { now: lateNow, bookings: [], ops: EMPTY });
    expect(day.status).toBe("too-soon"); // no rush on preorder-only dates
    const full = Array.from({ length: 12 }, (_, i) => booking("2026-12-28", "morning", 0, { orderId: `h${i}` }));
    expect(computeDay("2026-12-28", req(), ctx(full)).label).toBe("Preorders full");
  });
});

describe("computeDay — capacity", () => {
  it("counts stop points per window and shows few-left then sold out", () => {
    const three = [1, 2, 3].map(() => booking("2026-11-06", "morning", 3));
    const nearlyFull = computeDay("2026-11-06", req(), ctx(three));
    expect(nearlyFull.windows.find((w) => w.id === "morning")?.status).toBe("few-left");
    const four = [1, 2, 3, 4].map(() => booking("2026-11-06", "morning", 3));
    expect(computeDay("2026-11-06", req(), ctx(four)).windows.find((w) => w.id === "morning")?.status).toBe("sold-out");
  });

  it("costs more for mountain stops", () => {
    const two = [booking("2026-11-06", "morning", 6), booking("2026-11-06", "morning", 3)];
    const mountain = computeDay("2026-11-06", req({ zoneId: "B" }), ctx(two));
    expect(mountain.windows.find((w) => w.id === "morning")?.status).toBe("sold-out");
    const core = computeDay("2026-11-06", req({ zoneId: "A" }), ctx(two));
    expect(core.windows.find((w) => w.id === "morning")?.status).toBe("few-left");
  });

  it("has no route days while they're turned off", () => {
    for (const zoneId of ["A", "B"] as const) {
      const tuesday = computeDay("2026-11-10", req({ zoneId }), ctx());
      expect(tuesday.routeDay).toBe(false);
      expect(tuesday.windows.some((w) => w.routeStop)).toBe(false);
    }
  });
});

describe("slot checks and suggestions", () => {
  it("rejects a sold-out window and suggests the next open dates", () => {
    const sold: OperationsCalendar = { ...EMPTY, soldOut: [{ date: "2026-11-06" }] };
    const result = checkSlot("2026-11-06", "afternoon", req(), ctx([], sold));
    expect(result.ok).toBe(false);
    const next = suggestDates("2026-11-06", req(), ctx([], sold));
    expect(next.map((d) => d.date)).toEqual(["2026-11-07", "2026-11-09", "2026-11-10"]);
  });
});
