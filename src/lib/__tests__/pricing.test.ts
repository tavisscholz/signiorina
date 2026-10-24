import { describe, expect, it } from "vitest";

import { priceCart } from "@/lib/pricing";
import type { CartLine, DeliverySelection } from "@/lib/types";

let n = 0;
function line(productId: string, quantity: number, extra: Partial<CartLine> = {}): CartLine {
  return { lineId: `l${n++}`, productId, quantity, dietary: [], addOns: [], ...extra };
}

// Monday, November 2, 2026 at 10:00 AM Eastern.
const NOW = new Date("2026-11-02T15:00:00Z");
const issueCodes = (p: ReturnType<typeof priceCart>) => p.issues.map((i) => i.code);

describe("priceCart — items and minimums", () => {
  it("flags an empty cart", () => {
    const p = priceCart({ lines: [] });
    expect(p.canCheckout).toBe(false);
    expect(issueCodes(p)).toEqual(["empty"]);
  });

  it("prices a Box for Two and meets the $55 minimum", () => {
    const p = priceCart({ lines: [line("box-for-two", 1)] });
    expect(p.merchandiseSubtotal).toBe(5500);
    expect(p.amountToMinimum).toBe(0);
    expect(p.canCheckout).toBe(true);
  });

  it("requires 4 Aperitivo Boxes unless the cart reaches $55", () => {
    expect(issueCodes(priceCart({ lines: [line("aperitivo-box", 3)] }))).toEqual(["delivery-bundle"]);
    expect(priceCart({ lines: [line("aperitivo-box", 4)] }).canCheckout).toBe(true);
    const withFocaccia = priceCart({
      lines: [line("aperitivo-box", 3, { addOns: [{ addOnId: "whole-focaccia", quantity: 1 }] })],
    });
    expect(withFocaccia.merchandiseSubtotal).toBe(6800);
    expect(withFocaccia.canCheckout).toBe(true);
  });

  it("tracks the amount to the $55 minimum without doubling up messages", () => {
    const low = priceCart({ lines: [line("aperitivo-box", 2)] });
    expect(low.amountToMinimum).toBe(1900);
    expect(issueCodes(low)).toEqual(["delivery-bundle"]);
  });

  it("enforces product minimums across lines", () => {
    expect(issueCodes(priceCart({ lines: [line("pranzo-lunch-box", 9, { variantId: "classic" })] }))).toContain("product-minimum");
    const mixed = priceCart({
      lines: [line("pranzo-lunch-box", 7, { variantId: "classic" }), line("pranzo-lunch-box", 3, { variantId: "caprese" })],
    });
    expect(mixed.canCheckout).toBe(true);
    expect(mixed.merchandiseSubtotal).toBe(22000);
    expect(issueCodes(priceCart({ lines: [line("office-grazing-spread", 14)] }))).toContain("product-minimum");
  });

  it("applies Gift Box volume pricing at 10+", () => {
    expect(priceCart({ lines: [line("gift-box", 9)] }).merchandiseSubtotal).toBe(9 * 8500);
    const ten = priceCart({ lines: [line("gift-box", 6), line("gift-box", 4)] });
    expect(ten.merchandiseSubtotal).toBe(10 * 7900);
    expect(ten.lines.every((l) => l.volumeApplied)).toBe(true);
  });

  it("charges gluten-conscious per board and per person", () => {
    const boards = priceCart({ lines: [line("box-for-two", 2, { dietary: ["gluten-conscious", "nut-free"] })] });
    expect(boards.itemsSubtotal).toBe(11000 + 1000);
    const spread = priceCart({ lines: [line("office-grazing-spread", 20, { dietary: ["gluten-conscious"] })] });
    expect(spread.itemsSubtotal).toBe(36000 + 2000);
  });

  it("requires personalization on welcome boxes", () => {
    expect(issueCodes(priceCart({ lines: [line("wedding-welcome-box", 12)] }))).toContain("personalization-required");
    expect(priceCart({ lines: [line("wedding-welcome-box", 12, { personalization: "Lucia + Ben" })] }).canCheckout).toBe(true);
  });

  it("ignores add-ons that are event-only", () => {
    const p = priceCart({ lines: [line("box-for-two", 1, { addOns: [{ addOnId: "dop-upgrade", quantity: 2 }] })] });
    expect(p.addOnsTotal).toBe(0);
  });
});

describe("priceCart — delivery, fees and tax", () => {
  const at = (delivery: DeliverySelection, lines: CartLine[]) => priceCart({ lines, delivery, now: NOW });

  it("quotes Zone A at $15 and taxes food + delivery at 9.75%", () => {
    const p = at({ areaId: "sevierville", date: "2026-11-06", windowId: "afternoon" }, [line("box-for-two", 1)]);
    expect(p.delivery.fee).toBe(1500);
    expect(p.tax).toBe(Math.round(7000 * 0.0975));
    expect(p.total).toBe(5500 + 1500 + p.tax);
  });

  it("waives Zone A at $250+ and Zone B at $500+", () => {
    const a = at({ areaId: "pigeon-forge", date: "2026-11-06", windowId: "afternoon" }, [line("gathering-board-large", 2)]);
    expect(a.delivery.fee).toBe(0);
    const b = at({ areaId: "gatlinburg", date: "2026-11-06", windowId: "afternoon" }, [line("gathering-board-large", 2)]);
    expect(b.delivery.fee).toBe(3000);
    const b3 = at({ areaId: "gatlinburg", date: "2026-11-06", windowId: "afternoon" }, [line("gathering-board-large", 3)]);
    expect(b3.delivery.fee).toBe(0);
  });

  it("uses Knoxville route pricing on Tuesday/Thursday and blocks small off-route stops", () => {
    const route = at({ areaId: "knoxville", date: "2026-11-10", windowId: "midday" }, [line("box-for-two", 1)]);
    expect(route.delivery.fee).toBe(2500);
    expect(route.canCheckout).toBe(true);
    expect(route.taxRate).toBe(0.0925);

    const offRoute = at({ areaId: "knoxville", date: "2026-11-11", windowId: "midday" }, [line("box-for-two", 1)]);
    expect(offRoute.delivery.fee).toBe(4500);
    expect(issueCodes(offRoute)).toContain("off-route-minimum");

    const corporate = at({ areaId: "knoxville", date: "2026-11-10", windowId: "midday" }, [
      line("pranzo-lunch-box", 16, { variantId: "classic" }),
    ]);
    expect(corporate.isCorporate).toBe(true);
    expect(corporate.delivery.fee).toBe(0);
  });

  it("adds the rush fee inside 48 hours and the holiday fee on holiday dates", () => {
    const rushNow = new Date("2026-11-02T18:00:00Z"); // Monday 1:00 PM Eastern
    const rush = priceCart({
      lines: [line("box-for-two", 1)],
      delivery: { areaId: "sevierville", date: "2026-11-04", windowId: "afternoon" },
      now: rushNow,
    });
    expect(rush.rushRequired).toBe(true);
    expect(rush.rushFee).toBe(2500);

    const holiday = at({ areaId: "sevierville", date: "2026-12-23", windowId: "afternoon" }, [line("box-for-two", 1)]);
    expect(holiday.holidayFee).toBe(1500);
    expect(holiday.holiday?.id).toBe("december");
  });
});
