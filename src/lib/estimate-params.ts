import { z } from "zod";

import { addOns } from "@/config/catalog";
import { grazingTables, weddingPackages } from "@/config/events";
import { isISODate } from "@/lib/dates";
import type { EventEstimateInput, EventKind } from "@/lib/event-estimate";

/**
 * The event-estimate state that travels between the estimators and the inquiry form,
 * in the URL (shareable, survives refresh) and in the inquiry payload. The server
 * recomputes the estimate from this input — the client's totals are never trusted.
 */

export type EstimateState = Omit<EventEstimateInput, "today">;

/** Add-ons the event estimate prices per item (the rental and custom sign are flags/quotes, not line items). */
const EVENT_ADD_ON_IDS = addOns
  .filter((a) => a.scope.includes("event") && a.priceUnit === "each" && a.id !== "serving-piece-rental" && a.id !== "custom-sign")
  .map((a) => a.id);

export const estimateStateSchema = z.object({
  kind: z.enum(["wedding", "grazing"]),
  optionId: z.string().max(40),
  guests: z.number().int().min(1).max(2000),
  date: z
    .string()
    .optional()
    .refine((v) => v === undefined || isISODate(v), "Invalid date"),
  zone: z.enum(["A", "B", "C", "beyond"]).optional(),
  dopUpgrade: z.boolean().optional(),
  glutenConscious: z.boolean().optional(),
  attendantHours: z.number().int().min(0).max(24).optional(),
  pickup: z.enum(["next-day", "same-night"]).optional(),
  servingPieceRental: z.boolean().optional(),
  bundle: z.boolean().optional(),
  addOns: z
    .array(z.object({ id: z.string().max(40), quantity: z.number().int().min(0).max(50) }))
    .max(12)
    .optional(),
});

/** Which estimator a package or tier id belongs to. */
export function kindForOption(optionId: string): EventKind | undefined {
  if (weddingPackages.some((p) => p.id === optionId)) return "wedding";
  if (grazingTables.tiers.some((t) => t.id === optionId)) return "grazing";
  return undefined;
}

/** Estimate state → URL params. `type` keeps the inquiry form's event-type prefill working. */
export function toEstimateParams(state: EstimateState): URLSearchParams {
  const p = new URLSearchParams();
  p.set("type", state.kind === "wedding" ? "wedding" : "event");
  p.set("service", state.optionId);
  p.set("guests", String(state.guests));
  if (state.date) p.set("date", state.date);
  if (state.zone) p.set("zone", state.zone);
  if (state.dopUpgrade) p.set("dop", "1");
  if (state.glutenConscious) p.set("gluten", "1");
  if (state.bundle) p.set("bundle", "1");
  if (state.servingPieceRental) p.set("rental", "1");
  if (state.pickup && state.pickup !== "next-day") p.set("pickup", state.pickup);
  if (state.attendantHours) p.set("attendant", String(state.attendantHours));
  const extras = (state.addOns ?? []).filter((a) => a.quantity > 0).map((a) => `${a.id}:${a.quantity}`);
  if (extras.length) p.set("addons", extras.join(","));
  return p;
}

type ParamReader = { get(name: string): string | null };

/** URL params → estimate state, or null when the params don't describe an estimate. Invalid values are dropped. */
export function fromEstimateParams(params: ParamReader): EstimateState | null {
  const optionId = params.get("service") ?? "";
  const kind = kindForOption(optionId);
  const guests = Number(params.get("guests"));
  if (!kind || !Number.isInteger(guests) || guests < 1) return null;
  const date = params.get("date") ?? undefined;
  const zone = params.get("zone");
  const pickup = params.get("pickup");
  const attendant = Number(params.get("attendant") ?? 0);
  const addOnList = (params.get("addons") ?? "")
    .split(",")
    .map((pair) => pair.split(":"))
    .map(([id, qty]) => ({ id, quantity: Number(qty) }))
    .filter((a) => EVENT_ADD_ON_IDS.includes(a.id) && Number.isInteger(a.quantity) && a.quantity > 0 && a.quantity <= 50);

  const state: EstimateState = {
    kind,
    optionId,
    guests: Math.min(guests, 2000),
    date: date && isISODate(date) ? date : undefined,
    zone: zone === "A" || zone === "B" || zone === "C" || zone === "beyond" ? zone : undefined,
    dopUpgrade: params.get("dop") === "1",
    glutenConscious: params.get("gluten") === "1",
    bundle: kind === "wedding" && params.get("bundle") === "1",
    servingPieceRental: kind === "grazing" && params.get("rental") === "1",
    pickup: pickup === "same-night" ? "same-night" : "next-day",
    attendantHours: Number.isInteger(attendant) && attendant > 0 ? Math.min(attendant, 24) : 0,
    addOns: addOnList,
  };
  return state;
}
