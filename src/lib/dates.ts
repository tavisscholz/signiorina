import type { ISODate } from "@/lib/types";

/**
 * Date-only helpers. Delivery dates are calendar dates in the business time zone
 * (America/New_York) represented as YYYY-MM-DD strings, so arithmetic is done in
 * UTC on midnight values and never drifts with the viewer's own time zone.
 */

export const BUSINESS_TIME_ZONE = "America/New_York";

const DAY_MS = 86_400_000;

export function toUTCDate(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function fromUTCDate(date: Date): ISODate {
  return date.toISOString().slice(0, 10);
}

export function isISODate(value: unknown): value is ISODate {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return fromUTCDate(toUTCDate(value)) === value;
}

export function addDays(iso: ISODate, days: number): ISODate {
  return fromUTCDate(new Date(toUTCDate(iso).getTime() + days * DAY_MS));
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUTCDate(to).getTime() - toUTCDate(from).getTime()) / DAY_MS);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(iso: ISODate): number {
  return toUTCDate(iso).getUTCDay();
}

export function monthOf(iso: ISODate): number {
  return Number(iso.slice(5, 7));
}

export function yearOf(iso: ISODate): number {
  return Number(iso.slice(0, 4));
}

export function makeISO(year: number, month: number, day: number): ISODate {
  return fromUTCDate(new Date(Date.UTC(year, month - 1, day)));
}

/** Current calendar date and minutes past midnight in the business time zone. */
export function businessNow(now: Date, timeZone = BUSINESS_TIME_ZONE): { date: ISODate; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return {
    date: makeISO(get("year"), get("month"), get("day")),
    minutes: get("hour") * 60 + get("minute"),
  };
}

/**
 * True while an order for `deliveryDate` can still be placed with `leadDays` notice:
 * i.e. before `cutoffHour` local time, `leadDays` days before delivery.
 */
export function isBeforeCutoff(now: Date, deliveryDate: ISODate, leadDays: number, cutoffHour: number): boolean {
  const { date, minutes } = businessNow(now);
  const cutoffDate = addDays(deliveryDate, -leadDays);
  if (date < cutoffDate) return true;
  if (date > cutoffDate) return false;
  return minutes < cutoffHour * 60;
}

/** Earliest delivery date reachable with `leadDays` notice from now. */
export function earliestDateFor(now: Date, leadDays: number, cutoffHour: number): ISODate {
  const { date, minutes } = businessNow(now);
  return addDays(date, leadDays + (minutes < cutoffHour * 60 ? 0 : 1));
}

/** Nth (1-based) weekday of a month, e.g. 2nd Sunday of May. */
export function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): ISODate {
  const first = makeISO(year, month, 1);
  const offset = (weekday - weekdayOf(first) + 7) % 7;
  return addDays(first, offset + (n - 1) * 7);
}

export function lastWeekdayOfMonth(year: number, month: number, weekday: number): ISODate {
  const nextMonthFirst = month === 12 ? makeISO(year + 1, 1, 1) : makeISO(year, month + 1, 1);
  const last = addDays(nextMonthFirst, -1);
  const offset = (weekdayOf(last) - weekday + 7) % 7;
  return addDays(last, -offset);
}

const longFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const shortFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const fullFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

/** "Tuesday, November 3" */
export function formatDateLong(iso: ISODate): string {
  return longFormatter.format(toUTCDate(iso));
}

/** "Tue, Nov 3" */
export function formatDateShort(iso: ISODate): string {
  return shortFormatter.format(toUTCDate(iso));
}

/** "Tuesday, November 3, 2026" */
export function formatDateFull(iso: ISODate): string {
  return fullFormatter.format(toUTCDate(iso));
}

/** "November 2026" */
export function formatMonth(iso: ISODate): string {
  return monthFormatter.format(toUTCDate(iso));
}

export const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
