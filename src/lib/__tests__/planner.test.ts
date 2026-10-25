import { describe, expect, it } from "vitest";

import { weddingPresets } from "@/config/events";
import { fromEstimateParams } from "@/lib/estimate-params";
import { estimateEvent } from "@/lib/event-estimate";
import {
  applyCustomStart,
  applyPreset,
  emptyPlanner,
  hasCustomSelections,
  maxReachableStep,
  parsePlanner,
  serializePlanner,
  suggestsBoards,
  toEstimateInput,
  toEstimateState,
  zoneForArea,
} from "@/lib/planner";

const TODAY = "2026-11-02";
const q = (s: string) => new URLSearchParams(s);

describe("wedding presets", () => {
  it("map onto the existing wedding packages only", () => {
    expect(weddingPresets.map((p) => p.packageId)).toEqual(["aperitivo-hour", "gathering-table", "hosted-table"]);
  });

  it("load package and enhancements, and keep the couple's details", () => {
    const withDetails = { ...emptyPlanner("weddings"), guests: 42, date: "2027-10-16", area: "gatlinburg", occasion: "welcome-party" };
    const s = applyPreset(withDetails, "celebration-table");
    expect(s).toMatchObject({
      start: "preset",
      preset: "celebration-table",
      optionId: "gathering-table",
      guests: 42,
      date: "2027-10-16",
      area: "gatlinburg",
      occasion: "welcome-party",
      addOns: [{ id: "dolce-board", quantity: 1 }],
    });
  });

  it("fill a starting guest count and moment only when none was given", () => {
    const s = applyPreset(emptyPlanner("weddings"), "full-reception");
    expect(s).toMatchObject({ guests: 80, occasion: "reception", optionId: "hosted-table", dopUpgrade: true });
  });

  it("price through the shared engine — a favorite is the same as building it by hand", () => {
    const viaPreset = toEstimateInput({ ...applyPreset(emptyPlanner("weddings"), "celebration-table"), area: "sevierville", date: "2027-10-16" }, TODAY)!;
    const byHand = toEstimateInput(
      {
        ...applyCustomStart({ ...emptyPlanner("weddings"), guests: 60, area: "sevierville", date: "2027-10-16" }, "gathering-table"),
        addOns: [{ id: "dolce-board", quantity: 1 }],
      },
      TODAY,
    )!;
    const a = estimateEvent(viaPreset)!;
    const b = estimateEvent(byHand)!;
    expect(a.total).toBe(b.total);
    // Gathering Table, 60 guests, peak Saturday (min $1,500 < $1,920), Zone A, next-day pickup, 1 Dolce Board.
    expect(a.lines.find((l) => l.id === "food")?.amount).toBe(192000);
    expect(a.lines.find((l) => l.id === "addon-dolce-board")?.amount).toBe(4500);
    expect(a.lines.find((l) => l.id === "delivery")?.amount).toBe(1500);
    expect(a.lines.find((l) => l.id === "pickup")?.amount).toBe(7500);
  });
});

describe("custom selections", () => {
  it("are detected against the loaded favorite", () => {
    const loaded = applyPreset(emptyPlanner("weddings"), "cocktail-hour");
    expect(hasCustomSelections(loaded)).toBe(false);
    expect(hasCustomSelections({ ...loaded, guests: 70, date: "2027-05-01" })).toBe(false); // details aren't selections
    expect(hasCustomSelections({ ...loaded, glutenConscious: true })).toBe(true);
    expect(hasCustomSelections({ ...loaded, addOns: [{ id: "panini-tray", quantity: 1 }] })).toBe(true);
    expect(hasCustomSelections({ ...loaded, optionId: "hosted-table" })).toBe(true);
  });

  it("are detected for a build-my-own start", () => {
    const custom = applyCustomStart(emptyPlanner("weddings"), "hosted-table");
    expect(hasCustomSelections(custom)).toBe(false);
    expect(hasCustomSelections({ ...custom, attendantHours: 3 })).toBe(true);
  });
});

describe("planner URL state", () => {
  it("round-trips a full wedding plan", () => {
    const state = {
      ...applyPreset({ ...emptyPlanner("weddings"), guests: 55, date: "2027-09-18", area: "wears-valley", occasion: "reception" }, "full-reception"),
      glutenConscious: true,
      attendantHours: 2,
      bundle: true,
      addOns: [{ id: "panini-tray", quantity: 2 }],
      step: 4,
    };
    const back = parsePlanner("weddings", q(serializePlanner(state).toString()));
    expect(back).toEqual(state);
  });

  it("round-trips an event plan", () => {
    const state = {
      ...emptyPlanner("events"),
      optionId: "generous",
      occasion: "birthday",
      guests: 30,
      date: "2027-04-10",
      area: "newport",
      servingPieceRental: true,
      addOns: [{ id: "celebration-pack", quantity: 1 }],
      step: 3,
    };
    expect(parsePlanner("events", q(serializePlanner(state).toString()))).toEqual(state);
  });

  it("loads a favorite from a bare link", () => {
    const s = parsePlanner("weddings", q("preset=cocktail-hour"));
    expect(s).toMatchObject({ optionId: "aperitivo-hour", guests: 50, start: "preset", step: 1 });
  });

  it("never lets a link skip ahead of its prerequisites", () => {
    expect(parsePlanner("weddings", q("step=5")).step).toBe(1);
    expect(parsePlanner("weddings", q("step=4&service=hosted-table")).step).toBe(2);
    expect(parsePlanner("events", q("step=3&service=premium")).step).toBe(1);
    expect(parsePlanner("events", q("step=3&service=premium&guests=25")).step).toBe(3);
  });

  it("keeps each journey to its own packages and add-ons", () => {
    expect(parsePlanner("events", q("service=hosted-table&guests=30")).optionId).toBeUndefined();
    expect(parsePlanner("weddings", q("service=generous&guests=30")).optionId).toBeUndefined();
    expect(parsePlanner("weddings", q("service=hosted-table&addons=celebration-pack:1,dolce-board:2")).addOns).toEqual([
      { id: "dolce-board", quantity: 2 },
    ]);
    expect(parsePlanner("weddings", q("service=hosted-table&rental=1")).servingPieceRental).toBe(false);
    expect(parsePlanner("events", q("service=light&bundle=1")).bundle).toBe(false);
  });

  it("drops invalid values", () => {
    const s = parsePlanner("events", q("service=light&guests=-4&date=2027-02-31&area=atlantis&attendant=99&addons=dolce-board:400"));
    expect(s).toMatchObject({ guests: undefined, date: undefined, area: undefined, attendantHours: 10, addOns: [] });
  });

  it("understands links from the classic estimators, which only carry a zone", () => {
    const s = parsePlanner("weddings", q("type=wedding&service=gathering-table&guests=60&date=2027-10-16&zone=B&dop=1&addons=dolce-board:2"));
    expect(s.area).toBe("zone-B");
    expect(zoneForArea(s.area)).toBe("B");
    expect(s.start).toBe("custom");
    expect(maxReachableStep(s)).toBe(5);
  });

  it("stays readable by the classic pages if the flag is turned off", () => {
    const state = { ...applyPreset({ ...emptyPlanner("weddings"), area: "pigeon-forge" }, "celebration-table"), step: 3 };
    // /weddings/build → /weddings and /events/plan → /inquire keep the query string.
    expect(fromEstimateParams(serializePlanner(state))).toEqual(toEstimateState(state));
  });
});

describe("estimate hand-off", () => {
  it("waits for a package and a guest count", () => {
    expect(toEstimateState(emptyPlanner("weddings"))).toBeNull();
    expect(toEstimateState({ ...emptyPlanner("events"), optionId: "light" })).toBeNull();
    expect(toEstimateState({ ...emptyPlanner("events"), optionId: "light", guests: 20 })).not.toBeNull();
  });

  it("maps an area to its delivery zone and 'somewhere else' to quoted travel", () => {
    expect(zoneForArea("gatlinburg")).toBe("B");
    expect(zoneForArea("newport")).toBe("B");
    // Paused areas are not offered anywhere.
    expect(zoneForArea("knoxville")).toBeUndefined();
    expect(zoneForArea("other")).toBe("beyond");
    expect(zoneForArea(undefined)).toBeUndefined();
  });

  it("points small parties toward boards", () => {
    expect(suggestsBoards({ ...emptyPlanner("events"), optionId: "light", guests: 12 })).toBe(true);
    expect(suggestsBoards({ ...emptyPlanner("events"), optionId: "light", guests: 20 })).toBe(false);
  });
});
