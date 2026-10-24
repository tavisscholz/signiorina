import type { ISODate, OperationsCalendar } from "@/lib/types";
import { addDays, weekdayOf } from "@/lib/dates";

/**
 * Live operations calendar: booked events, manual sell-outs, blackout dates and
 * per-date capacity changes. Owners update this (or the CMS/database that replaces it)
 * as events are booked — the delivery calendar reads it on every request.
 */
export const operationsCalendar: OperationsCalendar = {
  eventBlocks: [
    // { date: "2027-05-15", windows: "all", significant: true, label: "Wedding — Gathering Table" },
  ],
  soldOut: [
    // { date: "2026-11-24", windows: ["midday"] },
  ],
  blackoutDates: [
    // Thanksgiving Day / Christmas Day are open for preorders unless added here.
  ],
  capacityOverrides: [
    // { date: "2026-12-23", windowPoints: { morning: 18, afternoon: 18 } },
  ],
};

/**
 * Demo operations so sold-out, event-blocked and closed states can be seen in development.
 * Off in production unless DEMO_OPERATIONS=true.
 */
export function demoOperationsEnabled(): boolean {
  if (process.env.DEMO_OPERATIONS === "true") return true;
  if (process.env.DEMO_OPERATIONS === "false") return false;
  return process.env.NODE_ENV !== "production";
}

function nextWeekday(from: ISODate, weekday: number, skipWeeks = 0): ISODate {
  const offset = (weekday - weekdayOf(from) + 7) % 7 || 7;
  return addDays(from, offset + skipWeeks * 7);
}

export function demoOperations(today: ISODate): OperationsCalendar {
  const busySaturday = nextWeekday(today, 6, 1);
  const eventSaturday = nextWeekday(today, 6, 2);
  const fullWednesday = nextWeekday(today, 3, 1);
  return {
    eventBlocks: [
      { date: busySaturday, windows: "all", significant: true, label: "Demo: wedding — Gathering Table" },
      { date: busySaturday, windows: ["afternoon"], significant: true, label: "Demo: welcome party" },
      { date: eventSaturday, windows: ["afternoon"], significant: true, label: "Demo: cocktail hour setup" },
    ],
    soldOut: [{ date: fullWednesday, windows: ["midday"] }],
    blackoutDates: [],
    capacityOverrides: [],
  };
}

export function mergeCalendars(...calendars: OperationsCalendar[]): OperationsCalendar {
  return {
    eventBlocks: calendars.flatMap((c) => c.eventBlocks),
    soldOut: calendars.flatMap((c) => c.soldOut),
    blackoutDates: calendars.flatMap((c) => c.blackoutDates),
    capacityOverrides: calendars.flatMap((c) => c.capacityOverrides),
  };
}
