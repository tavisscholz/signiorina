import { getProduct } from "@/config/catalog";
import { capacity, deliveryWindows, getZone, holidays, scheduling } from "@/config/delivery";
import {
  addDays,
  businessNow,
  earliestDateFor,
  formatDateShort,
  isBeforeCutoff,
  weekdayOf,
} from "@/lib/dates";
import { feeForWindow, isRouteDay, routeDayNames, stopPoints } from "@/lib/delivery-fees";
import { holidayForDate } from "@/lib/holidays";
import { formatDollars } from "@/lib/money";
import type { Booking, ISODate, OperationsCalendar, WindowId, ZoneId } from "@/lib/types";

/**
 * Delivery availability: which dates and windows a given cart can be delivered in.
 * Runs on the server against live bookings; the checkout calendar renders its output
 * and the order endpoint re-runs it before taking payment.
 */

export type WindowStatus = "available" | "few-left" | "sold-out" | "event-blocked" | "not-offered";

export type WindowReasonCode = "product-window" | "off-route" | "manual" | "event" | "capacity";

export interface WindowAvailability {
  id: WindowId;
  status: WindowStatus;
  reason?: string;
  code?: WindowReasonCode;
  /** Stops still bookable after this one, for "few left" messaging. */
  remainingStops: number;
  /** Delivery fee in cents for this window. */
  fee: number;
  routeStop: boolean;
  points: number;
}

export type DayStatus =
  | "available"
  | "few-left"
  | "sold-out"
  | "closed"
  | "too-soon"
  | "product-unavailable"
  | "route-only"
  | "past"
  | "beyond-horizon";

export interface DayAvailability {
  date: ISODate;
  weekday: number;
  status: DayStatus;
  /** Short label for calendar cells and screen readers. */
  label: string;
  detail?: string;
  rush: boolean;
  routeDay: boolean;
  holiday?: { id: string; name: string; preorderOnly: boolean; fee: number };
  /** Lowest delivery fee (cents) among bookable windows. */
  fromFee?: number;
  unavailableProducts?: Array<{ productId: string; name: string; earliestDate: ISODate }>;
  windows: WindowAvailability[];
}

export interface AvailabilityRequest {
  lines: Array<{ productId: string; quantity: number }>;
  zoneId: ZoneId;
  isCorporate: boolean;
  /** Cents. */
  merchandiseSubtotal: number;
  from: ISODate;
  days: number;
}

export interface AvailabilityContext {
  now: Date;
  bookings: Booking[];
  ops: OperationsCalendar;
}

export function isBookable(status: DayStatus | WindowStatus): boolean {
  return status === "available" || status === "few-left";
}

function closedDay(date: ISODate, status: DayStatus, label: string, detail?: string): DayAvailability {
  return { date, weekday: weekdayOf(date), status, label, detail, rush: false, routeDay: false, windows: [] };
}

export function computeDay(date: ISODate, req: AvailabilityRequest, ctx: AvailabilityContext): DayAvailability {
  const today = businessNow(ctx.now).date;
  const weekday = weekdayOf(date);
  const zone = getZone(req.zoneId);
  const products = req.lines
    .map((l) => ({ line: l, product: getProduct(l.productId) }))
    .filter((p): p is { line: AvailabilityRequest["lines"][number]; product: NonNullable<ReturnType<typeof getProduct>> } =>
      Boolean(p.product),
    );

  if (date < today) return closedDay(date, "past", "Past");
  if (date > addDays(today, scheduling.bookingHorizonDays)) return closedDay(date, "beyond-horizon", "Not yet open");
  if (ctx.ops.blackoutDates.includes(date)) return closedDay(date, "closed", "Closed");
  if (weekday === 0 && !scheduling.sunday.directDelivery) {
    return closedDay(date, "closed", "Events only", "Sundays are reserved for events.");
  }

  const dayEvents = ctx.ops.eventBlocks.filter((e) => e.date === date);
  const significant = dayEvents.filter((e) => e.significant).length;
  if (weekday === 6 && significant >= scheduling.saturday.closeAtSignificantEvents) {
    return closedDay(date, "sold-out", "Fully booked", "That date is fully booked.");
  }

  const holiday = holidayForDate(date, holidays);
  const holidayInfo = holiday
    ? { id: holiday.id, name: holiday.name, preorderOnly: holiday.preorderOnly, fee: holiday.directOrderFee * 100 }
    : undefined;

  // Lead times (rush where allowed).
  let rush = false;
  const tooSoon: NonNullable<DayAvailability["unavailableProducts"]> = [];
  for (const { product } of products) {
    if (isBeforeCutoff(ctx.now, date, product.leadTimeDays, scheduling.cutoffHour)) continue;
    const rushPossible =
      scheduling.rush.enabled &&
      product.allowRush &&
      !holiday?.preorderOnly &&
      isBeforeCutoff(ctx.now, date, scheduling.rush.minimumLeadDays, scheduling.cutoffHour);
    if (rushPossible) {
      rush = true;
    } else if (!tooSoon.some((t) => t.productId === product.id)) {
      tooSoon.push({
        productId: product.id,
        name: product.name,
        earliestDate: earliestDateFor(ctx.now, product.leadTimeDays, scheduling.cutoffHour),
      });
    }
  }
  if (tooSoon.length > 0) {
    const allBlocked = tooSoon.length === new Set(products.map((p) => p.product.id)).size;
    const names = tooSoon.map((t) => t.name).join(", ");
    return {
      ...closedDay(
        date,
        allBlocked ? "too-soon" : "product-unavailable",
        allBlocked ? "Too soon" : "Not for every item",
        allBlocked
          ? `Your order needs more notice. Earliest: ${formatDateShort(tooSoon.map((t) => t.earliestDate).sort().at(-1)!)}.`
          : `This one isn't available for your selected date: ${names}.`,
      ),
      unavailableProducts: tooSoon,
      holiday: holidayInfo,
    };
  }

  // Bookings on this date.
  const dayBookings = ctx.bookings.filter((b) => b.date === date);
  if (holiday) {
    const orders = new Set(dayBookings.map((b) => b.orderId)).size;
    if (orders >= holiday.maxOrdersPerDay) {
      return { ...closedDay(date, "sold-out", "Preorders full", "Holiday preorders for this date are full."), holiday: holidayInfo };
    }
    for (const { line, product } of products) {
      const cap = holiday.productCaps?.[product.id];
      if (cap === undefined) continue;
      const booked = dayBookings.reduce((sum, b) => sum + (b.productQuantities[product.id] ?? 0), 0);
      if (booked + line.quantity > cap) {
        return {
          ...closedDay(date, "sold-out", "Preorders full", `${product.name} preorders for this date are full.`),
          holiday: holidayInfo,
        };
      }
    }
  }

  const routeDay = isRouteDay(req.zoneId, date);
  const override = ctx.ops.capacityOverrides.find((o) => o.date === date);

  const windows: WindowAvailability[] = deliveryWindows.map((w) => {
    const fee = feeForWindow({
      zoneId: req.zoneId,
      date,
      windowId: w.id,
      merchandiseSubtotal: req.merchandiseSubtotal,
      isCorporate: req.isCorporate,
    });
    const points = stopPoints(req.zoneId, w.id, fee.routeStop);
    const base = { id: w.id, fee: fee.fee, routeStop: fee.routeStop, points, remainingStops: 0 };

    const restricted = products.find(({ product }) => product.allowedWindows && !product.allowedWindows.includes(w.id));
    if (restricted) {
      const allowed = restricted.product.allowedWindows!.map((id) => deliveryWindows.find((x) => x.id === id)!.label.toLowerCase());
      return {
        ...base,
        status: "not-offered" as const,
        code: "product-window" as const,
        reason: `${restricted.product.name} travels in the ${allowed.join(" or ")} window.`,
      };
    }
    if (fee.belowOffRouteMinimum && !fee.routeStop && zone.offRouteMinimumSubtotal !== undefined) {
      return {
        ...base,
        status: "not-offered" as const,
        code: "off-route" as const,
        reason: `${zone.name} orders under ${formatDollars(zone.offRouteMinimumSubtotal)} travel on our ${routeDayNames(req.zoneId)} route.`,
      };
    }
    const manual = ctx.ops.soldOut.find(
      (s) =>
        s.date === date &&
        (!s.windows || s.windows.includes(w.id)) &&
        (!s.zones || s.zones.includes(req.zoneId)),
    );
    if (manual) return { ...base, status: "sold-out" as const, code: "manual" as const, reason: "That window filled up." };
    const event = dayEvents.find((e) => e.windows === "all" || e.windows.includes(w.id));
    if (event) return { ...base, status: "event-blocked" as const, code: "event" as const, reason: "Reserved for an event." };

    const total = override?.windowPoints[w.id] ?? capacity.windowPoints[w.id];
    const inWindow = dayBookings.filter((b) => b.windowId === w.id);
    const used = inWindow.reduce((sum, b) => sum + b.points, 0);
    const reserve = routeDay ? (capacity.routeDayCorporateReserve[w.id] ?? 0) : 0;
    let available = total - used;
    if (reserve > 0 && !req.isCorporate) {
      const corporateUsed = inWindow.filter((b) => b.corporate).reduce((sum, b) => sum + b.points, 0);
      available = total - (used - corporateUsed) - Math.max(reserve, corporateUsed);
    }
    if (available < points) {
      return { ...base, status: "sold-out" as const, code: "capacity" as const, reason: "That window filled up." };
    }
    const remainingStops = Math.floor((available - points) / points);
    return {
      ...base,
      remainingStops,
      status: remainingStops <= capacity.fewLeftStops ? ("few-left" as const) : ("available" as const),
    };
  });

  const bookable = windows.filter((w) => isBookable(w.status));
  const fromFee = bookable.length ? Math.min(...bookable.map((w) => w.fee)) : undefined;
  const common = { date, weekday, rush, routeDay, holiday: holidayInfo, windows, fromFee };

  if (bookable.length === 0) {
    const offRoute = windows.find((w) => w.code === "off-route");
    const onlyRouteRules = windows.every((w) => w.code === "off-route" || w.code === "product-window");
    if (offRoute && onlyRouteRules) {
      return {
        ...common,
        status: "route-only",
        label: routeDay ? "Unavailable" : "Route days only",
        detail: offRoute.reason,
      };
    }
    return { ...common, status: "sold-out", label: "Fully booked", detail: "That date is fully booked." };
  }
  const allFew = bookable.every((w) => w.status === "few-left");
  return {
    ...common,
    status: allFew ? "few-left" : "available",
    label: allFew ? "Few left" : rush ? "Rush" : holiday?.preorderOnly ? "Preorder" : "Available",
  };
}

export function computeAvailability(req: AvailabilityRequest, ctx: AvailabilityContext): DayAvailability[] {
  const days: DayAvailability[] = [];
  for (let i = 0; i < req.days; i++) days.push(computeDay(addDays(req.from, i), req, ctx));
  return days;
}

/** Next bookable dates after `date`, for "that date is fully booked" suggestions. */
export function suggestDates(
  date: ISODate,
  req: Omit<AvailabilityRequest, "from" | "days">,
  ctx: AvailabilityContext,
  count = 3,
  searchDays = 45,
): DayAvailability[] {
  const results: DayAvailability[] = [];
  for (let i = 1; i <= searchDays && results.length < count; i++) {
    const day = computeDay(addDays(date, i), { ...req, from: date, days: 1 }, ctx);
    if (isBookable(day.status)) results.push(day);
  }
  return results;
}

/** Validates one date + window for an order. Returns the window or a reason it can't be booked. */
export function checkSlot(
  date: ISODate,
  windowId: WindowId,
  req: Omit<AvailabilityRequest, "from" | "days">,
  ctx: AvailabilityContext,
): { ok: true; day: DayAvailability; window: WindowAvailability } | { ok: false; reason: string; day: DayAvailability } {
  const day = computeDay(date, { ...req, from: date, days: 1 }, ctx);
  if (!isBookable(day.status)) return { ok: false, reason: day.detail ?? "That date is no longer available.", day };
  const window = day.windows.find((w) => w.id === windowId);
  if (!window || !isBookable(window.status)) {
    return { ok: false, reason: window?.reason ?? "That window filled up.", day };
  }
  return { ok: true, day, window };
}
