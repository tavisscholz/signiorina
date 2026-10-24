import { describe, expect, it } from "vitest";

import { holidays } from "@/config/delivery";
import { businessNow, earliestDateFor, isBeforeCutoff, nthWeekdayOfMonth, weekdayOf } from "@/lib/dates";
import { federalHolidayOn, holidayForDate } from "@/lib/holidays";

// Monday, November 2, 2026 at 10:00 AM Eastern (EST, UTC-5).
const MONDAY_10AM = new Date("2026-11-02T15:00:00Z");
// Monday, November 2, 2026 at 12:30 PM Eastern.
const MONDAY_1230PM = new Date("2026-11-02T17:30:00Z");

describe("dates", () => {
  it("reads the business-local date and time", () => {
    expect(businessNow(MONDAY_10AM)).toEqual({ date: "2026-11-02", minutes: 600 });
    // 11:30 PM Eastern on Nov 2 is already Nov 3 in UTC.
    expect(businessNow(new Date("2026-11-03T04:30:00Z")).date).toBe("2026-11-02");
  });

  it("applies the noon cutoff N days before delivery", () => {
    // 48 hours: order by noon Monday for Wednesday.
    expect(isBeforeCutoff(MONDAY_10AM, "2026-11-04", 2, 12)).toBe(true);
    expect(isBeforeCutoff(MONDAY_1230PM, "2026-11-04", 2, 12)).toBe(false);
    expect(isBeforeCutoff(MONDAY_1230PM, "2026-11-05", 2, 12)).toBe(true);
  });

  it("finds the earliest deliverable date", () => {
    expect(earliestDateFor(MONDAY_10AM, 2, 12)).toBe("2026-11-04");
    expect(earliestDateFor(MONDAY_1230PM, 2, 12)).toBe("2026-11-05");
    expect(earliestDateFor(MONDAY_10AM, 3, 12)).toBe("2026-11-05");
  });

  it("computes nth weekdays", () => {
    expect(nthWeekdayOfMonth(2026, 11, 4, 4)).toBe("2026-11-26");
    expect(nthWeekdayOfMonth(2027, 5, 0, 2)).toBe("2027-05-09");
    expect(weekdayOf("2026-11-02")).toBe(1);
  });
});

describe("holidays", () => {
  it("covers Thanksgiving week Monday through Sunday", () => {
    expect(holidayForDate("2026-11-22", holidays)).toBeUndefined();
    expect(holidayForDate("2026-11-23", holidays)?.id).toBe("thanksgiving");
    expect(holidayForDate("2026-11-29", holidays)?.id).toBe("thanksgiving");
    expect(holidayForDate("2026-11-30", holidays)).toBeUndefined();
  });

  it("covers Mother's Day weekend and December 23–31", () => {
    expect(holidayForDate("2027-05-07", holidays)?.id).toBe("mothers-day");
    expect(holidayForDate("2027-05-06", holidays)).toBeUndefined();
    expect(holidayForDate("2026-12-23", holidays)?.id).toBe("december");
    expect(holidayForDate("2026-12-31", holidays)?.id).toBe("december");
    expect(holidayForDate("2026-12-22", holidays)).toBeUndefined();
  });

  it("knows federal holidays, including observed dates", () => {
    expect(federalHolidayOn("2027-07-04")).toBe("Independence Day");
    expect(federalHolidayOn("2027-07-05")).toBe("Independence Day (observed)");
    expect(federalHolidayOn("2027-05-31")).toBe("Memorial Day");
    expect(federalHolidayOn("2027-06-12")).toBeUndefined();
  });
});
