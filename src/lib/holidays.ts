import type { HolidayPeriod, HolidayRule, ISODate } from "@/lib/types";
import {
  addDays,
  lastWeekdayOfMonth,
  makeISO,
  monthOf,
  nthWeekdayOfMonth,
  weekdayOf,
  yearOf,
} from "@/lib/dates";

function ruleMatches(rule: HolidayRule, iso: ISODate): boolean {
  const year = yearOf(iso);
  switch (rule.type) {
    case "dates":
      return monthOf(iso) === rule.month && rule.days.includes(Number(iso.slice(8, 10)));
    case "range": {
      const start = makeISO(year, rule.startMonth, rule.startDay);
      const end = makeISO(year, rule.endMonth, rule.endDay);
      return iso >= start && iso <= end;
    }
    case "mothers-day-weekend": {
      // Friday through Mother's Day (second Sunday of May).
      const mothersDay = nthWeekdayOfMonth(year, 5, 0, 2);
      return iso >= addDays(mothersDay, -2) && iso <= mothersDay;
    }
    case "thanksgiving-week": {
      // Monday through Sunday of the week holding Thanksgiving (fourth Thursday of November).
      const thanksgiving = nthWeekdayOfMonth(year, 11, 4, 4);
      return iso >= addDays(thanksgiving, -3) && iso <= addDays(thanksgiving, 3);
    }
  }
}

export function holidayForDate(iso: ISODate, periods: HolidayPeriod[]): HolidayPeriod | undefined {
  return periods.find((p) => ruleMatches(p.rule, iso));
}

/** Observed date for a fixed-date federal holiday falling on a weekend. */
function observed(iso: ISODate): ISODate {
  const day = weekdayOf(iso);
  if (day === 6) return addDays(iso, -1);
  if (day === 0) return addDays(iso, 1);
  return iso;
}

export function federalHolidays(year: number): Array<{ date: ISODate; name: string }> {
  const fixed = [
    { date: makeISO(year, 1, 1), name: "New Year's Day" },
    { date: makeISO(year, 6, 19), name: "Juneteenth" },
    { date: makeISO(year, 7, 4), name: "Independence Day" },
    { date: makeISO(year, 11, 11), name: "Veterans Day" },
    { date: makeISO(year, 12, 25), name: "Christmas Day" },
  ];
  const floating = [
    { date: nthWeekdayOfMonth(year, 1, 1, 3), name: "Martin Luther King Jr. Day" },
    { date: nthWeekdayOfMonth(year, 2, 1, 3), name: "Presidents' Day" },
    { date: lastWeekdayOfMonth(year, 5, 1), name: "Memorial Day" },
    { date: nthWeekdayOfMonth(year, 9, 1, 1), name: "Labor Day" },
    { date: nthWeekdayOfMonth(year, 10, 1, 2), name: "Columbus Day" },
    { date: nthWeekdayOfMonth(year, 11, 4, 4), name: "Thanksgiving Day" },
  ];
  const observedDays = fixed
    .filter((h) => observed(h.date) !== h.date)
    .map((h) => ({ date: observed(h.date), name: `${h.name} (observed)` }));
  return [...fixed, ...floating, ...observedDays];
}

export function federalHolidayOn(iso: ISODate): string | undefined {
  return federalHolidays(yearOf(iso)).find((h) => h.date === iso)?.name;
}
