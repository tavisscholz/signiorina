import { describe, expect, it } from "vitest";

import { estimateEvent } from "@/lib/event-estimate";

const TODAY = "2026-11-02";
const line = (e: ReturnType<typeof estimateEvent>, id: string) => e!.lines.find((l) => l.id === id);

describe("estimateEvent — weddings", () => {
  it("applies the Aperitivo Hour $1,000 minimum to small counts", () => {
    const e = estimateEvent({ kind: "wedding", optionId: "aperitivo-hour", guests: 30, zone: "A", today: TODAY, date: "2027-04-14" });
    expect(e?.minimumApplied).toBe(true);
    expect(line(e, "food")?.amount).toBe(100000);
    expect(line(e, "pickup")?.amount).toBe(7500);
    expect(line(e, "delivery")?.amount).toBe(1500);
  });

  it("raises the Gathering Table minimum on peak Saturdays", () => {
    const peak = estimateEvent({ kind: "wedding", optionId: "gathering-table", guests: 40, today: TODAY, date: "2027-10-16" });
    expect(peak?.peakSaturday).toBe(true);
    expect(line(peak, "food")?.amount).toBe(150000);
    const offPeak = estimateEvent({ kind: "wedding", optionId: "gathering-table", guests: 40, today: TODAY, date: "2027-04-17" });
    expect(line(offPeak, "food")?.amount).toBe(128000);
  });

  it("includes attendants and teardown for The Hosted Table", () => {
    const e = estimateEvent({ kind: "wedding", optionId: "hosted-table", guests: 120, zone: "B", today: TODAY, date: "2027-03-20" });
    expect(line(e, "food")?.amount).toBe(504000);
    expect(e?.includedAttendants).toBe(2);
    expect(line(e, "pickup")).toBeUndefined();
  });

  it("takes 5% off food for the wedding weekend bundle and computes a 50% retainer", () => {
    const e = estimateEvent({ kind: "wedding", optionId: "gathering-table", guests: 50, zone: "A", today: TODAY, date: "2027-04-17", bundle: true });
    expect(line(e, "bundle")?.amount).toBe(-8000);
    expect(e!.retainer).toBe(Math.round(e!.total / 2));
  });

  it("adds holiday and short-notice surcharges", () => {
    const holiday = estimateEvent({ kind: "wedding", optionId: "gathering-table", guests: 50, today: TODAY, date: "2027-07-05" });
    expect(line(holiday, "holiday")?.amount).toBe(16000);
    const soon = estimateEvent({ kind: "wedding", optionId: "gathering-table", guests: 50, today: TODAY, date: "2026-11-07" });
    expect(line(soon, "rush")?.amount).toBe(16000);
    expect(soon?.warnings.length).toBeGreaterThan(0);
  });
});

describe("estimateEvent — grazing tables", () => {
  it("applies the $650 minimum and zone setup fee, without taxing setup labor", () => {
    const e = estimateEvent({ kind: "grazing", optionId: "generous", guests: 20, zone: "A", today: TODAY, date: "2026-12-05" });
    expect(line(e, "food")?.amount).toBe(65000);
    expect(line(e, "setup")?.amount).toBe(12500);
    expect(e?.tax).toBe(Math.round((65000 + 1500) * 0.0975));
    const zoneC = estimateEvent({ kind: "grazing", optionId: "light", guests: 40, zone: "C", today: TODAY });
    expect(line(zoneC, "setup")?.amount).toBe(17500);
    expect(line(zoneC, "food")?.amount).toBe(88000);
  });

  it("quotes travel beyond Zone C", () => {
    const e = estimateEvent({ kind: "grazing", optionId: "premium", guests: 30, zone: "beyond", today: TODAY });
    expect(e?.deliveryQuoted).toBe(true);
  });
});
