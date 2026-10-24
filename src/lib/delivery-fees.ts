import { capacity, getZone, scheduling } from "@/config/delivery";
import { WEEKDAY_NAMES, weekdayOf } from "@/lib/dates";
import { formatDollars, toCents } from "@/lib/money";
import type { ISODate, WindowId, ZoneId } from "@/lib/types";

export interface WindowFee {
  /** Fee in cents. */
  fee: number;
  label: string;
  /** This stop rides the Zone C route. */
  routeStop: boolean;
  /** Free-delivery threshold reached. */
  waived: boolean;
  /** Off-route Zone C order below the off-route minimum — not offered online. */
  belowOffRouteMinimum: boolean;
}

export function isRouteDay(zoneId: ZoneId, date: ISODate): boolean {
  const route = getZone(zoneId).routeDays;
  return Boolean(route && route.weekdays.includes(weekdayOf(date)));
}

/**
 * Delivery fee for one stop. `merchandiseSubtotal` is in cents.
 */
export function feeForWindow(args: {
  zoneId: ZoneId;
  /** Omit when the date isn't chosen yet — route pricing then doesn't apply. */
  date?: ISODate;
  windowId?: WindowId;
  merchandiseSubtotal: number;
  isCorporate: boolean;
}): WindowFee {
  const zone = getZone(args.zoneId);
  const route = zone.routeDays;
  const routeStop = Boolean(
    route && args.date && args.windowId && isRouteDay(args.zoneId, args.date) && route.windows.includes(args.windowId),
  );

  if (routeStop && route) {
    const waived = args.isCorporate && args.merchandiseSubtotal >= toCents(route.corporateFreeDeliveryAt);
    return {
      fee: waived ? 0 : toCents(route.fee),
      label: waived ? `Free on route days for corporate orders over ${formatDollars(route.corporateFreeDeliveryAt)}` : `${zone.label}, route day`,
      routeStop: true,
      waived,
      belowOffRouteMinimum: false,
    };
  }

  const belowOffRouteMinimum =
    zone.offRouteMinimumSubtotal !== undefined && args.merchandiseSubtotal < toCents(zone.offRouteMinimumSubtotal);
  const waived = zone.freeDeliveryAt !== null && args.merchandiseSubtotal >= toCents(zone.freeDeliveryAt);
  return {
    fee: waived ? 0 : toCents(zone.fee),
    label: waived ? `Free over ${formatDollars(zone.freeDeliveryAt ?? 0)} in ${zone.label}` : zone.label,
    routeStop: false,
    waived,
    belowOffRouteMinimum,
  };
}

/** Capacity points one stop consumes in a window. */
export function stopPoints(zoneId: ZoneId, windowId: WindowId, routeStop: boolean): number {
  if (routeStop) {
    const routePoints = capacity.routeDayZonePoints[zoneId];
    if (routePoints !== undefined) return routePoints;
  }
  return capacity.zonePointsByWindow?.[windowId]?.[zoneId] ?? capacity.zonePoints[zoneId];
}

/** "Tuesday + Thursday" */
export function routeDayNames(zoneId: ZoneId = "C", short = false, separator = " + "): string {
  const route = getZone(zoneId).routeDays;
  if (!route) return "";
  return route.weekdays.map((d) => (short ? WEEKDAY_NAMES[d].slice(0, 3) : WEEKDAY_NAMES[d])).join(separator);
}

/** Human summary of a zone's fee rules, e.g. for the cart before a date is chosen. */
export function zoneFeeSummary(zoneId: ZoneId): string {
  const zone = getZone(zoneId);
  const parts = [`${formatDollars(zone.fee)} delivery`];
  if (zone.freeDeliveryAt !== null) parts.push(`free over ${formatDollars(zone.freeDeliveryAt)}`);
  if (zone.routeDays) {
    parts.push(`${formatDollars(zone.routeDays.fee)} on ${routeDayNames(zoneId)} route days`);
    parts.push(`corporate orders over ${formatDollars(zone.routeDays.corporateFreeDeliveryAt)} free on route days`);
  }
  return parts.join(" · ");
}

export const minimumOrderCents = toCents(scheduling.minimumOrder);
