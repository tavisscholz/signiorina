import { getArea, getZone } from "@/config/delivery";
import { getWeddingPackage, getWeddingPreset, grazingTables, type WeddingPreset } from "@/config/events";
import { isISODate } from "@/lib/dates";
import { kindForOption, type EstimateState } from "@/lib/estimate-params";
import type { EventEstimateInput } from "@/lib/event-estimate";
import type { ZoneId } from "@/lib/types";

/**
 * Build Your Table (weddings) and the event package planner share one state shape, kept in
 * the URL so a plan survives refresh, Back/Forward and sharing. Parameter names match
 * estimate-params, so a planner link still means something to /weddings and /inquire if
 * the three-journey flag is turned off. Prices come only from event-estimate.
 */

export type PlannerJourney = "weddings" | "events";

export interface PlannerState {
  journey: PlannerJourney;
  /** 1-based step number. */
  step: number;
  /** Weddings: began from a favorite or from scratch. */
  start?: "preset" | "custom";
  preset?: string;
  /** Wedding package id or grazing tier id. */
  optionId?: string;
  /** Wedding moment or event occasion id. */
  occasion?: string;
  guests?: number;
  date?: string;
  /**
   * Delivery area id, "other" (beyond our zones), "zone-A|B|C" (a link that only knew the
   * zone, e.g. from the classic estimators) or undefined (not sure yet).
   */
  area?: string;
  dopUpgrade: boolean;
  glutenConscious: boolean;
  servingPieceRental: boolean;
  bundle: boolean;
  pickup: "next-day" | "same-night";
  attendantHours: number;
  addOns: Array<{ id: string; quantity: number }>;
}

export const plannerSteps: Record<PlannerJourney, Array<{ id: string; title: string; short: string }>> = {
  weddings: [
    { id: "experience", title: "Choose an experience", short: "Experience" },
    { id: "details", title: "Tell us about your wedding", short: "Details" },
    { id: "customize", title: "Customize your table", short: "Customize" },
    { id: "review", title: "Review your experience", short: "Review" },
    { id: "request", title: "Request your proposal", short: "Request" },
  ],
  events: [
    { id: "details", title: "Tell us about your event", short: "Details" },
    { id: "upgrades", title: "Make it yours", short: "Upgrades" },
    { id: "review", title: "Review your estimate", short: "Review" },
    { id: "request", title: "Request your proposal", short: "Request" },
  ],
};

/** Add-ons offered in each planner (quantities); everything else is a flag or upgrade. */
export const plannerAddOnIds: Record<PlannerJourney, string[]> = {
  weddings: ["burrata-focaccia", "dolce-board", "panini-tray"],
  events: ["burrata-focaccia", "dolce-board", "panini-tray", "celebration-pack"],
};

const MAX_GUESTS = 400;
const MAX_ADDON_QTY = 10;
const MAX_ATTENDANT_HOURS = 10;

export function emptyPlanner(journey: PlannerJourney): PlannerState {
  return {
    journey,
    step: 1,
    dopUpgrade: false,
    glutenConscious: false,
    servingPieceRental: false,
    bundle: false,
    pickup: "next-day",
    attendantHours: 0,
    addOns: [],
  };
}

export function isOptionFor(journey: PlannerJourney, optionId: string | undefined): boolean {
  if (!optionId) return false;
  return kindForOption(optionId) === (journey === "weddings" ? "wedding" : "grazing");
}

/** Delivery zone for an area choice; "other" is beyond our zones and travel is quoted. */
export function zoneForArea(area: string | undefined): ZoneId | "beyond" | undefined {
  if (!area) return undefined;
  if (area === "other") return "beyond";
  const zoneOnly = /^zone-([ABC])$/.exec(area);
  if (zoneOnly) return zoneOnly[1] as ZoneId;
  return getArea(area)?.zone;
}

/** Human label for an area choice, or undefined when not chosen. */
export function areaLabel(area: string | undefined): string | undefined {
  if (!area) return undefined;
  if (area === "other") return "Somewhere else (travel quoted)";
  const zone = zoneForArea(area);
  if (area.startsWith("zone-") && zone && zone !== "beyond") return getZone(zone).label;
  return getArea(area)?.name;
}

/** The enhancements a preset sets. Details (date, place, guests) are never part of it. */
function presetEnhancements(preset: WeddingPreset) {
  return {
    optionId: preset.packageId,
    dopUpgrade: preset.dopUpgrade,
    glutenConscious: false,
    bundle: false,
    pickup: "next-day" as const,
    attendantHours: 0,
    addOns: preset.addOns.map((a) => ({ ...a })),
  };
}

/**
 * Load a favorite: replaces the package and enhancements, keeps the couple's details, and
 * fills a starting guest count and moment only where none was given.
 */
export function applyPreset(state: PlannerState, presetId: string): PlannerState {
  const preset = getWeddingPreset(presetId);
  if (!preset) return state;
  return {
    ...state,
    ...presetEnhancements(preset),
    start: "preset",
    preset: preset.id,
    guests: state.guests ?? preset.guests,
    occasion: state.occasion ?? preset.moment,
  };
}

/** Start from a package with no extras. */
export function applyCustomStart(state: PlannerState, optionId: string): PlannerState {
  return {
    ...state,
    start: "custom",
    preset: undefined,
    optionId,
    dopUpgrade: false,
    glutenConscious: false,
    servingPieceRental: false,
    bundle: false,
    pickup: "next-day",
    attendantHours: 0,
    addOns: [],
  };
}

function sameAddOns(a: PlannerState["addOns"], b: PlannerState["addOns"]): boolean {
  const norm = (list: PlannerState["addOns"]) =>
    list
      .filter((x) => x.quantity > 0)
      .map((x) => `${x.id}:${x.quantity}`)
      .sort()
      .join(",");
  return norm(a) === norm(b);
}

/**
 * Has the couple changed anything a new starting point would overwrite? True means: ask
 * before replacing their selections.
 */
export function hasCustomSelections(state: PlannerState): boolean {
  if (!state.optionId) return false;
  const preset = state.start === "preset" && state.preset ? getWeddingPreset(state.preset) : undefined;
  const baseline = preset
    ? presetEnhancements(preset)
    : { optionId: state.optionId, dopUpgrade: false, glutenConscious: false, bundle: false, pickup: "next-day", attendantHours: 0, addOns: [] };
  return (
    state.optionId !== baseline.optionId ||
    state.dopUpgrade !== baseline.dopUpgrade ||
    state.glutenConscious !== baseline.glutenConscious ||
    state.bundle !== baseline.bundle ||
    state.pickup !== baseline.pickup ||
    state.attendantHours !== baseline.attendantHours ||
    !sameAddOns(state.addOns, baseline.addOns)
  );
}

/** Steps a visitor may open: anything up to the first one whose prerequisites are missing. */
export function maxReachableStep(state: PlannerState): number {
  const total = plannerSteps[state.journey].length;
  const hasOption = isOptionFor(state.journey, state.optionId);
  const hasGuests = (state.guests ?? 0) >= 1;
  if (state.journey === "weddings") {
    if (!hasOption) return 1;
    if (!hasGuests) return 2;
    return total;
  }
  if (!hasOption || !hasGuests) return 1;
  return total;
}

export function clampStep(state: PlannerState, step: number): number {
  return Math.min(Math.max(1, Math.floor(step) || 1), maxReachableStep(state));
}

/** The estimate engine's input, or null until there is a package and a guest count. */
export function toEstimateState(state: PlannerState): EstimateState | null {
  if (!isOptionFor(state.journey, state.optionId) || !state.guests || state.guests < 1) return null;
  const wedding = state.journey === "weddings";
  const pkg = wedding ? getWeddingPackage(state.optionId!) : undefined;
  return {
    kind: wedding ? "wedding" : "grazing",
    optionId: state.optionId!,
    guests: state.guests,
    date: state.date,
    zone: zoneForArea(state.area),
    dopUpgrade: state.dopUpgrade,
    glutenConscious: state.glutenConscious,
    attendantHours: state.attendantHours,
    pickup: pkg?.pieceReturn === "fee" ? state.pickup : "next-day",
    servingPieceRental: !wedding && state.servingPieceRental,
    bundle: wedding && state.bundle,
    addOns: state.addOns.filter((a) => a.quantity > 0 && plannerAddOnIds[state.journey].includes(a.id)),
  };
}

export function toEstimateInput(state: PlannerState, today: string): EventEstimateInput | null {
  const s = toEstimateState(state);
  return s ? { ...s, today } : null;
}

/* ------------------------------------------------------------------ */
/* URL                                                                 */
/* ------------------------------------------------------------------ */

type ParamReader = { get(name: string): string | null };

function int(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isInteger(n) ? n : undefined;
}

/** URL → state. Unknown or invalid values are dropped, never trusted. */
export function parsePlanner(journey: PlannerJourney, params: ParamReader): PlannerState {
  let state = emptyPlanner(journey);

  const service = params.get("service") ?? undefined;
  const optionId = isOptionFor(journey, service) ? service : undefined;
  const guests = int(params.get("guests"));
  const date = params.get("date") ?? undefined;
  const areaParam = params.get("area") ?? undefined;
  const zoneParam = params.get("zone");
  const area =
    areaParam === "other" || (areaParam && (getArea(areaParam) || /^zone-[ABC]$/.test(areaParam)))
      ? areaParam
      : // A link from the classic estimators carries only a zone.
        zoneParam === "beyond"
        ? "other"
        : zoneParam === "A" || zoneParam === "B" || zoneParam === "C"
          ? `zone-${zoneParam}`
          : undefined;
  const attendant = int(params.get("attendant")) ?? 0;
  const addOns = (params.get("addons") ?? "")
    .split(",")
    .map((pair) => pair.split(":"))
    .map(([id, qty]) => ({ id, quantity: Number(qty) }))
    .filter(
      (a) => plannerAddOnIds[journey].includes(a.id) && Number.isInteger(a.quantity) && a.quantity > 0 && a.quantity <= MAX_ADDON_QTY,
    );

  state = {
    ...state,
    optionId,
    guests: guests !== undefined && guests >= 1 ? Math.min(guests, MAX_GUESTS) : undefined,
    date: date && isISODate(date) ? date : undefined,
    area,
    occasion: params.get("occasion")?.slice(0, 40) || undefined,
    dopUpgrade: params.get("dop") === "1",
    glutenConscious: params.get("gluten") === "1",
    servingPieceRental: journey === "events" && params.get("rental") === "1",
    bundle: journey === "weddings" && params.get("bundle") === "1",
    pickup: params.get("pickup") === "same-night" ? "same-night" : "next-day",
    attendantHours: attendant > 0 ? Math.min(attendant, MAX_ATTENDANT_HOURS) : 0,
    addOns,
  };

  if (journey === "weddings") {
    const preset = params.get("preset");
    const start = params.get("start");
    if (preset && getWeddingPreset(preset)) {
      // A bare favorite link (?preset=…) loads that favorite; with a package it records where the plan began.
      state = optionId ? { ...state, start: "preset", preset } : applyPreset(state, preset);
    } else if (optionId) {
      state = { ...state, start: start === "preset" ? "preset" : "custom" };
    }
  }

  return { ...state, step: clampStep(state, int(params.get("step")) ?? 1) };
}

/** State → URL. Only meaningful values are written, so links stay short. */
export function serializePlanner(state: PlannerState): URLSearchParams {
  const p = new URLSearchParams();
  const wedding = state.journey === "weddings";
  p.set("type", wedding ? "wedding" : "event");
  if (state.step > 1) p.set("step", String(state.step));
  if (wedding && state.start) p.set("start", state.start);
  if (wedding && state.preset) p.set("preset", state.preset);
  if (state.optionId) p.set("service", state.optionId);
  if (state.occasion) p.set("occasion", state.occasion);
  if (state.guests) p.set("guests", String(state.guests));
  if (state.date) p.set("date", state.date);
  if (state.area) p.set("area", state.area);
  const zone = zoneForArea(state.area);
  if (zone) p.set("zone", zone);
  if (state.dopUpgrade) p.set("dop", "1");
  if (state.glutenConscious) p.set("gluten", "1");
  if (!wedding && state.servingPieceRental) p.set("rental", "1");
  if (wedding && state.bundle) p.set("bundle", "1");
  if (state.pickup === "same-night") p.set("pickup", "same-night");
  if (state.attendantHours > 0) p.set("attendant", String(state.attendantHours));
  const extras = state.addOns.filter((a) => a.quantity > 0).map((a) => `${a.id}:${a.quantity}`);
  if (extras.length) p.set("addons", extras.join(","));
  return p;
}

/** Below this guest count a styled table is the wrong tool; boards from Everyday fit better. */
export function suggestsBoards(state: PlannerState): boolean {
  return state.journey === "events" && state.guests !== undefined && state.guests < grazingTables.minimumGuests;
}

