import { getAddOn } from "@/config/catalog";
import { beyondZoneC, getZone, tax, zones } from "@/config/delivery";
import { eventFees, getWeddingPackage, grazingTables, weddingRules } from "@/config/events";
import { daysBetween, monthOf, weekdayOf } from "@/lib/dates";
import { federalHolidayOn } from "@/lib/holidays";
import { formatDollars, percentOf, toCents } from "@/lib/money";
import type { ISODate, ZoneId } from "@/lib/types";

/**
 * Event estimator for weddings and styled grazing tables. Produces a transparent,
 * itemized estimate (integer cents) that the inquiry form carries along. Final
 * quotes still come from Signiorina after the details are confirmed.
 */

export type EventKind = "wedding" | "grazing";
export type PickupChoice = "next-day" | "same-night";

export interface EventEstimateInput {
  kind: EventKind;
  /** Wedding package id or grazing tier id. */
  optionId: string;
  guests: number;
  date?: ISODate;
  zone?: ZoneId | "beyond";
  today: ISODate;
  dopUpgrade?: boolean;
  glutenConscious?: boolean;
  /** Extra attendant hours beyond anything included. */
  attendantHours?: number;
  pickup?: PickupChoice;
  servingPieceRental?: boolean;
  /** Couple is booking 2+ Signiorina events the same wedding weekend. */
  bundle?: boolean;
  addOns?: Array<{ id: string; quantity: number }>;
}

export interface EstimateLine {
  id: string;
  label: string;
  detail?: string;
  amount: number;
  kind: "food" | "discount" | "fee" | "delivery" | "labor";
  quoted?: boolean;
}

export interface EventEstimate {
  optionName: string;
  pricePerPerson: number;
  guests: number;
  foodAtRate: number;
  minimumFood: number;
  minimumApplied: boolean;
  peakSaturday: boolean;
  lines: EstimateLine[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  retainer: number;
  includedAttendants: number;
  notes: string[];
  warnings: string[];
  deliveryQuoted: boolean;
}

export function estimateEvent(input: EventEstimateInput): EventEstimate | null {
  const guests = Math.max(0, Math.floor(input.guests || 0));
  const isWedding = input.kind === "wedding";
  const pkg = isWedding ? getWeddingPackage(input.optionId) : undefined;
  const tier = !isWedding ? grazingTables.tiers.find((t) => t.id === input.optionId) : undefined;
  if (!pkg && !tier) return null;

  const optionName = pkg?.name ?? `${tier!.name} grazing table`;
  const pricePerPerson = pkg?.pricePerPerson ?? tier!.pricePerPerson;
  const notes: string[] = [];
  const warnings: string[] = [];
  const lines: EstimateLine[] = [];

  const date = input.date;
  const peakSaturday = Boolean(
    isWedding && date && weekdayOf(date) === 6 && weddingRules.peakMonths.includes(monthOf(date)),
  );
  const minimumDollars = pkg
    ? peakSaturday && pkg.peakSaturdayMinimum
      ? pkg.peakSaturdayMinimum
      : pkg.minimumFood
    : grazingTables.minimumFood;
  const minimumFood = toCents(minimumDollars);
  const foodAtRate = toCents(pricePerPerson) * guests;
  const minimumApplied = foodAtRate < minimumFood;
  const baseFood = Math.max(foodAtRate, minimumFood);

  lines.push({
    id: "food",
    label: `${optionName} · ${guests} guests × ${formatDollars(pricePerPerson)}`,
    detail: minimumApplied
      ? `${peakSaturday ? "Peak-Saturday minimum" : "Minimum food spend"} of ${formatDollars(minimumDollars)} applies`
      : undefined,
    amount: baseFood,
    kind: "food",
  });

  let food = baseFood;
  if (input.dopUpgrade) {
    const amount = toCents(eventFees.perPerson.dopUpgrade) * guests;
    lines.push({ id: "dop", label: `DOP upgrade · ${formatDollars(eventFees.perPerson.dopUpgrade)}/guest`, amount, kind: "food" });
    food += amount;
  }
  if (input.glutenConscious) {
    const amount = toCents(eventFees.perPerson.glutenConscious) * guests;
    lines.push({
      id: "gluten",
      label: `Gluten-conscious · ${formatDollars(eventFees.perPerson.glutenConscious)}/guest`,
      amount,
      kind: "food",
    });
    food += amount;
  }
  for (const a of input.addOns ?? []) {
    const addOn = getAddOn(a.id);
    if (!addOn || !addOn.scope.includes("event") || addOn.priceUnit !== "each" || a.quantity <= 0) continue;
    if (addOn.id === "serving-piece-rental" || addOn.id === "custom-sign") continue;
    const amount = toCents(addOn.price) * a.quantity;
    lines.push({ id: `addon-${addOn.id}`, label: `${addOn.name}${a.quantity > 1 ? ` × ${a.quantity}` : ""}`, amount, kind: "food" });
    food += amount;
  }

  if (isWedding && input.bundle) {
    const discount = percentOf(food, weddingRules.bundle.foodDiscountPercent);
    lines.push({
      id: "bundle",
      label: `${weddingRules.bundle.name} · ${weddingRules.bundle.foodDiscountPercent}% off food`,
      amount: -discount,
      kind: "discount",
    });
  }

  const holidayName = date ? federalHolidayOn(date) : undefined;
  if (holidayName) {
    lines.push({
      id: "holiday",
      label: `Federal holiday · +${eventFees.federalHolidayFoodPercent}% food`,
      detail: holidayName,
      amount: percentOf(food, eventFees.federalHolidayFoodPercent),
      kind: "fee",
    });
  }

  const daysOut = date ? daysBetween(input.today, date) : undefined;
  if (daysOut !== undefined && daysOut < 0) warnings.push("That date has already passed.");
  if (daysOut !== undefined && daysOut >= 0 && daysOut < eventFees.rush.underDays) {
    lines.push({
      id: "rush",
      label: `Short-notice event · +${eventFees.rush.foodPercent}% food`,
      detail: "Only if we can accept it",
      amount: percentOf(food, eventFees.rush.foodPercent),
      kind: "fee",
    });
  }
  if (isWedding && daysOut !== undefined && daysOut >= 0 && daysOut < weddingRules.bookingLeadDays) {
    warnings.push(
      `We book weddings ${weddingRules.bookingLeadDays}+ days ahead. Ask us about your date — we'll tell you honestly if we can do it well.`,
    );
  }
  if (!isWedding && daysOut !== undefined && daysOut >= eventFees.rush.underDays) {
    notes.push(`Grazing tables need ${grazingTables.leadTimeDays} days' notice.`);
  }

  // Delivery, setup, pickup, labor
  let deliveryQuoted = false;
  const zone = input.zone;
  if (zone === "beyond") {
    deliveryQuoted = true;
    lines.push({
      id: "delivery",
      label: "Travel beyond our metro zone",
      detail: `${formatDollars(getZone("C").fee)} + ${formatDollars(beyondZoneC.perMileRoundTrip)}/mile round trip beyond the zone — quoted`,
      amount: toCents(getZone("C").fee),
      kind: "delivery",
      quoted: true,
    });
  } else if (zone) {
    lines.push({ id: "delivery", label: `Delivery · ${getZone(zone).label}`, amount: toCents(getZone(zone).fee), kind: "delivery" });
  } else {
    const fees = zones.map((z) => z.fee);
    notes.push(`Delivery is ${formatDollars(Math.min(...fees))}–${formatDollars(Math.max(...fees))} depending on where you're gathering.`);
  }

  if (!isWedding) {
    const setupZone = zone === "beyond" ? "C" : zone;
    if (setupZone) {
      lines.push({
        id: "setup",
        label: "Setup + styling",
        amount: toCents(grazingTables.setupFee[setupZone]),
        kind: "labor",
      });
    } else {
      notes.push(
        `Setup is ${formatDollars(grazingTables.setupFee.A)} in Zones A and B, ${formatDollars(grazingTables.setupFee.C)} in Zone C.`,
      );
    }
    if (input.servingPieceRental) {
      lines.push({ id: "rental", label: "Serving-piece rental", amount: toCents(eventFees.servingPieceRental), kind: "fee" });
    }
    if (guests > 0 && guests < grazingTables.minimumGuests) {
      warnings.push(
        `Styled grazing tables start at ${grazingTables.minimumGuests} guests. For smaller groups, a Gathering Board is a better fit.`,
      );
    }
  }

  if (pkg?.pieceReturn === "fee") {
    const choice = input.pickup ?? "next-day";
    const amount = toCents(choice === "same-night" ? eventFees.pickup.sameNight : eventFees.pickup.nextDay);
    lines.push({
      id: "pickup",
      label: choice === "same-night" ? "Same-night teardown + piece pickup" : "Next-day serving-piece pickup",
      amount,
      kind: "fee",
    });
  }

  let includedAttendants = 0;
  if (pkg?.attendants && guests > 0) {
    includedAttendants = Math.ceil(guests / pkg.attendants.perGuests);
    notes.push(
      `Includes ${includedAttendants} attendant${includedAttendants > 1 ? "s" : ""} for ${pkg.attendants.hours} hours.`,
    );
  }
  const hours = Math.max(0, Math.floor(input.attendantHours ?? 0));
  if (hours > 0) {
    const billed = Math.max(hours, eventFees.attendant.minimumHours);
    lines.push({
      id: "attendant",
      label: `Event attendant · ${billed} hrs × ${formatDollars(eventFees.attendant.hourly)}`,
      detail: hours < eventFees.attendant.minimumHours ? `${eventFees.attendant.minimumHours}-hour minimum` : undefined,
      amount: toCents(eventFees.attendant.hourly) * billed,
      kind: "labor",
    });
  }

  if (pkg) {
    if (pkg.id === "aperitivo-hour" && guests > 0 && guests < 40) {
      notes.push(`${pkg.name} is designed for 40+ guests; the ${formatDollars(pkg.minimumFood)} minimum covers smaller groups.`);
    }
    notes.push("Setup and styling are included. A custom menu sign / name flag is included.");
  }

  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
  const taxable = lines
    .filter((l) => (l.kind === "labor" ? eventFees.taxSetupAndLabor : true))
    .reduce((sum, l) => sum + l.amount, 0);
  const taxRate = tax.defaultRate;
  const taxAmount = Math.round(Math.max(0, taxable) * taxRate);
  const total = subtotal + taxAmount;

  return {
    optionName,
    pricePerPerson,
    guests,
    foodAtRate,
    minimumFood,
    minimumApplied,
    peakSaturday,
    lines,
    subtotal,
    taxRate,
    tax: taxAmount,
    total,
    retainer: percentOf(total, eventFees.retainerPercent),
    includedAttendants,
    notes,
    warnings,
    deliveryQuoted,
  };
}
