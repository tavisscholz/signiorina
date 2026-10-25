import type {
  CapacityConfig,
  DeliveryArea,
  DeliveryWindow,
  DeliveryZone,
  HolidayPeriod,
  WindowId,
  ZoneId,
} from "@/lib/types";

/**
 * Delivery, scheduling and fee rules. Every number the checkout uses lives here.
 * Money is whole dollars in config; the engines convert to cents.
 */

export const zones: DeliveryZone[] = [
  {
    id: "A",
    name: "Core",
    label: "Zone A — Core",
    description: "Sevierville, Pigeon Forge, Kodak and Seymour.",
    fee: 15,
    freeDeliveryAt: 250,
  },
  {
    id: "B",
    name: "Mountain",
    label: "Zone B — Mountain",
    description: "Gatlinburg, Wears Valley, Cobbly Nob and the Cosby side, Chalet Village, Dandridge and Newport.",
    fee: 25,
    freeDeliveryAt: 500,
  },
  {
    // Not served while its areas are paused (see pausedAreaIds), so it's hidden from every
    // customer-facing list (servedZones). Its fee still prices event travel beyond our zones.
    // The Tue + Thu route days ($25; corporate free over $350; off-route minimum $350) were
    // turned off with the pause — restore them from git history along with the areas.
    id: "C",
    name: "Zone C",
    label: "Zone C",
    description: "",
    fee: 100,
    freeDeliveryAt: null,
  },
];

const allDeliveryAreas: DeliveryArea[] = [
  { id: "sevierville", name: "Sevierville", city: "Sevierville", county: "Sevier", zone: "A", zips: ["37862", "37864", "37876"], pageSlug: "sevierville" },
  { id: "pigeon-forge", name: "Pigeon Forge", city: "Pigeon Forge", county: "Sevier", zone: "A", zips: ["37863", "37868"], cabinCountry: true, pageSlug: "pigeon-forge" },
  { id: "kodak", name: "Kodak", city: "Kodak", county: "Sevier", zone: "A", zips: ["37764"] },
  { id: "seymour", name: "Seymour", city: "Seymour", county: "Sevier", zone: "A", zips: ["37865"] },
  { id: "gatlinburg", name: "Gatlinburg", city: "Gatlinburg", county: "Sevier", zone: "B", zips: ["37738"], cabinCountry: true, pageSlug: "gatlinburg" },
  { id: "wears-valley", name: "Wears Valley", city: "Sevierville", county: "Sevier", zone: "B", zips: ["37862", "37863", "37882"], cabinCountry: true, pageSlug: "wears-valley" },
  { id: "cobbly-nob", name: "Cobbly Nob / Cosby side", city: "Gatlinburg", county: "Sevier", zone: "B", zips: ["37738", "37722"], cabinCountry: true },
  { id: "chalet-village", name: "Chalet Village", city: "Gatlinburg", county: "Sevier", zone: "B", zips: ["37738"], cabinCountry: true },
  { id: "dandridge", name: "Dandridge", city: "Dandridge", county: "Jefferson", zone: "B", zips: ["37725"] },
  {
    id: "knoxville",
    name: "Knoxville",
    city: "Knoxville",
    county: "Knox",
    zone: "C",
    zips: ["37902", "37909", "37912", "37914", "37915", "37916", "37917", "37918", "37919", "37920", "37921", "37922", "37923", "37924", "37931", "37932", "37934", "37938"],
    pageSlug: "knoxville",
  },
  { id: "farragut", name: "Farragut", city: "Farragut", county: "Knox", zone: "C", zips: ["37922", "37934"] },
  { id: "maryville-alcoa", name: "Maryville / Alcoa", city: "Maryville", county: "Blount", zone: "C", zips: ["37701", "37801", "37802", "37803", "37804"] },
  { id: "townsend", name: "Townsend", city: "Townsend", county: "Blount", zone: "C", zips: ["37882"], cabinCountry: true },
  { id: "newport", name: "Newport", city: "Newport", county: "Cocke", zone: "B", zips: ["37821", "37822"] },
];

/**
 * Paused by the owner (October 2026): not offered at checkout, in the planners or on any page,
 * and not mentioned anywhere on the site. To bring them back, remove them from this list and
 * restore Zone C's name/description and the Knoxville copy from the commit that paused them.
 */
export const pausedAreaIds: readonly string[] = ["knoxville", "farragut", "maryville-alcoa", "townsend"];

export const deliveryAreas: DeliveryArea[] = allDeliveryAreas.filter((a) => !pausedAreaIds.includes(a.id));

/** Zones with at least one area we deliver to — the only ones customers see. */
export const servedZones: DeliveryZone[] = zones.filter((z) => deliveryAreas.some((a) => a.zone === z.id));

/** Beyond Zone C: events only, quoted manually. Never offered as automatic delivery. */
export const beyondZoneC = {
  quoteOnly: true,
  /** Zone C fee plus this per mile, round trip, beyond the Zone C boundary. */
  perMileRoundTrip: 1.5,
} as const;

export const deliveryWindows: DeliveryWindow[] = [
  {
    id: "morning",
    label: "Morning",
    start: "08:30",
    end: "10:30",
    display: "8:30–10:30 AM",
    uses: ["Bridal suites", "Morning orders", "Event setup"],
  },
  {
    id: "midday",
    label: "Midday",
    start: "11:00",
    end: "12:30",
    display: "11:00 AM–12:30 PM",
    uses: ["Corporate lunches", "Offices"],
  },
  {
    id: "afternoon",
    label: "Afternoon",
    start: "14:30",
    end: "17:00",
    display: "2:30–5:00 PM",
    uses: ["Cabin arrivals", "Evening gatherings", "Parties"],
  },
];

export const scheduling = {
  /** Orders are due by this local hour, N lead-time days before delivery ("order by noon two days prior"). */
  cutoffHour: 12,
  bookingHorizonDays: 120,
  /** Minimum online order for delivery (merchandise subtotal). */
  minimumOrder: 55,
  pickup: {
    /** No permitted pickup location is confirmed. Keep disabled until it is. */
    enabled: false,
  },
  sunday: {
    /** Sundays are events-only at launch; not shown as available in the calendar. */
    directDelivery: false,
  },
  saturday: {
    /** Close direct delivery on a Saturday holding this many significant events. */
    closeAtSignificantEvents: 2,
  },
  rush: {
    enabled: true,
    fee: 100,
    /** Rush orders still need to be in by the cutoff this many days before delivery. */
    minimumLeadDays: 1,
  },
  /** Minutes a checkout holds delivery capacity while the customer pays. */
  holdMinutes: 20,
} as const;

export const capacity: CapacityConfig = {
  windowPoints: { morning: 12, midday: 12, afternoon: 12 },
  // Zone A ≈ 4 stops per window; Zone B ≈ 2 in the morning, 3 in the afternoon;
  // an off-route Zone C stop takes the whole window.
  zonePoints: { A: 3, B: 6, C: 12 },
  zonePointsByWindow: { afternoon: { B: 4 } },
  // Batched route-day stops: ≈ 4 per window.
  routeDayZonePoints: { C: 3 },
  // Midday capacity held for corporate orders on route days.
  routeDayCorporateReserve: { midday: 6 },
  fewLeftStops: 1,
};

export const holidays: HolidayPeriod[] = [
  {
    id: "valentines",
    name: "Valentine's",
    rule: { type: "dates", month: 2, days: [12, 13, 14] },
    preorderOnly: true,
    directOrderFee: 15,
    maxOrdersPerDay: 14,
    productCaps: { "box-for-two": 24 },
  },
  {
    id: "mothers-day",
    name: "Mother's Day weekend",
    rule: { type: "mothers-day-weekend" },
    preorderOnly: true,
    directOrderFee: 15,
    maxOrdersPerDay: 12,
  },
  {
    id: "thanksgiving",
    name: "Thanksgiving week",
    rule: { type: "thanksgiving-week" },
    preorderOnly: true,
    directOrderFee: 15,
    maxOrdersPerDay: 10,
  },
  {
    id: "december",
    name: "December holidays",
    rule: { type: "range", startMonth: 12, startDay: 23, endMonth: 12, endDay: 31 },
    preorderOnly: true,
    directOrderFee: 15,
    maxOrdersPerDay: 12,
  },
];

/**
 * Tennessee prepared-food sales tax: 7% state + local option rate by county.
 * Delivery charges on taxable food are taxable. Verify rates with the TN Department
 * of Revenue (or switch to Stripe Tax) before launch.
 */
export const tax = {
  label: "Sales tax",
  defaultRate: 0.0975,
  ratesByCounty: {
    Sevier: 0.0975,
    Jefferson: 0.0975,
    Knox: 0.0925,
    Blount: 0.0975,
    Cocke: 0.0975,
  } as Record<string, number>,
  /** Fees taxed alongside the food. */
  taxDelivery: true,
  taxRushAndHolidayFees: true,
} as const;

/* ------------------------------------------------------------------ */
/* Accessors                                                           */
/* ------------------------------------------------------------------ */

export function getZone(id: ZoneId): DeliveryZone {
  const zone = zones.find((z) => z.id === id);
  if (!zone) throw new Error(`Unknown zone ${id}`);
  return zone;
}

export function getArea(id: string): DeliveryArea | undefined {
  return deliveryAreas.find((a) => a.id === id);
}

export function getWindow(id: WindowId): DeliveryWindow {
  const window = deliveryWindows.find((w) => w.id === id);
  if (!window) throw new Error(`Unknown window ${id}`);
  return window;
}

export function taxRateForArea(areaId: string | undefined): number {
  const area = areaId ? getArea(areaId) : undefined;
  if (!area) return tax.defaultRate;
  return tax.ratesByCounty[area.county] ?? tax.defaultRate;
}
