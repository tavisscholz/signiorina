import { describe, expect, it } from "vitest";

import {
  estimateStateSchema,
  fromEstimateParams,
  kindForOption,
  toEstimateParams,
  type EstimateState,
} from "@/lib/estimate-params";
import { inquirySchema } from "@/lib/validation";

const wedding: EstimateState = {
  kind: "wedding",
  optionId: "gathering-table",
  guests: 60,
  date: "2027-10-16",
  zone: "A",
  dopUpgrade: true,
  glutenConscious: false,
  attendantHours: 2,
  pickup: "same-night",
  servingPieceRental: false,
  bundle: true,
  addOns: [
    { id: "dolce-board", quantity: 2 },
    { id: "panini-tray", quantity: 1 },
  ],
};

describe("estimate params", () => {
  it("round-trips the full wedding estimate (date, zone, options, add-ons)", () => {
    const params = toEstimateParams(wedding);
    expect(params.get("type")).toBe("wedding");
    expect(params.get("zone")).toBe("A");
    expect(params.get("addons")).toBe("dolce-board:2,panini-tray:1");
    expect(fromEstimateParams(new URLSearchParams(params.toString()))).toEqual(wedding);
  });

  it("round-trips a grazing-table estimate with the serving-piece rental", () => {
    const grazing: EstimateState = {
      kind: "grazing",
      optionId: "generous",
      guests: 20,
      date: "2027-05-05",
      zone: "beyond",
      dopUpgrade: false,
      glutenConscious: true,
      attendantHours: 0,
      pickup: "next-day",
      servingPieceRental: true,
      bundle: false,
      addOns: [],
    };
    const params = toEstimateParams(grazing);
    expect(params.get("type")).toBe("event");
    expect(params.has("pickup")).toBe(false);
    expect(fromEstimateParams(params)).toEqual(grazing);
  });

  it("returns null when the params don't describe an estimate", () => {
    expect(fromEstimateParams(new URLSearchParams("type=wedding"))).toBeNull();
    expect(fromEstimateParams(new URLSearchParams("service=not-a-package&guests=40"))).toBeNull();
    expect(fromEstimateParams(new URLSearchParams("service=hosted-table&guests=0"))).toBeNull();
    expect(fromEstimateParams(new URLSearchParams("service=hosted-table&guests=abc"))).toBeNull();
  });

  it("drops invalid values instead of trusting them", () => {
    const state = fromEstimateParams(
      new URLSearchParams(
        "service=aperitivo-hour&guests=35&date=2027-02-30&zone=Z&pickup=never&attendant=-3&bundle=1&rental=1" +
          "&addons=dolce-board:3,serving-piece-rental:1,custom-sign:1,made-up:2,panini-tray:0,burrata-focaccia:99",
      ),
    );
    expect(state).toMatchObject({ kind: "wedding", guests: 35, date: undefined, zone: undefined, pickup: "next-day", attendantHours: 0 });
    // Bundle is a wedding option; the rental flag only applies to grazing tables.
    expect(state?.bundle).toBe(true);
    expect(state?.servingPieceRental).toBe(false);
    expect(state?.addOns).toEqual([{ id: "dolce-board", quantity: 3 }]);
  });

  it("maps options to their estimator", () => {
    expect(kindForOption("hosted-table")).toBe("wedding");
    expect(kindForOption("generous")).toBe("grazing");
    expect(kindForOption("nope")).toBeUndefined();
  });

  it("is accepted by the inquiry schema, which rejects tampered input", () => {
    expect(estimateStateSchema.safeParse(wedding).success).toBe(true);
    const base = {
      name: "Ada Guest",
      email: "ada@example.com",
      phone: "865-555-0100",
      eventType: "Wedding",
      eventLocation: "Gatlinburg",
      serviceInterest: "Gathering Table",
      message: "Looking at a fall weekend.",
    };
    expect(inquirySchema.safeParse({ ...base, estimateInput: wedding }).success).toBe(true);
    expect(inquirySchema.safeParse({ ...base, estimateInput: { ...wedding, guests: -4 } }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...base, estimateInput: { ...wedding, date: "next week" } }).success).toBe(false);
  });
});
