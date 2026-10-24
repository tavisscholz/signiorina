/**
 * Events: wedding packages, styled grazing tables and the fees that apply to them.
 * Events are inquiry-led; these numbers drive the published prices and the
 * on-page estimator so couples and hosts understand cost before they write.
 */

export interface WeddingPackage {
  id: string;
  name: string;
  pricePerPerson: number;
  minimumFood: number;
  /** Peak-Saturday minimum (peak months below). Null = standard minimum applies. */
  peakSaturdayMinimum: number | null;
  line: string;
  bestFor: string[];
  portion: string;
  recommendedGuests: string;
  includes: string[];
  /** Serving-piece return: included, or charged via the pickup fees below. */
  pieceReturn: "included" | "fee";
  /** Attendants included: one per this many guests, for this many hours. */
  attendants?: { perGuests: number; hours: number };
  image: string;
}

export interface GrazingTier {
  id: string;
  name: string;
  pricePerPerson: number;
  portion: string;
  line: string;
}

export const weddingPackages: WeddingPackage[] = [
  {
    id: "aperitivo-hour",
    name: "The Aperitivo Hour",
    pricePerPerson: 24,
    minimumFood: 1000,
    peakSaturdayMinimum: null,
    line: "For the hour when everyone has arrived and nobody has sat down yet.",
    bestFor: ["Cocktail hour", "Welcome party", "Pre-dinner gathering"],
    portion: "Light grazing · about 4–5 oz per guest",
    recommendedGuests: "Best for 40+ guests",
    includes: [
      "Styled grazing table",
      "All food",
      "Eco plates, napkins + serving picks",
      "Menu card + allergen card",
      "Signiorina serving pieces",
      "Setup + styling",
      "Fresh herb + fruit styling",
    ],
    pieceReturn: "fee",
    image: "weddingTable",
  },
  {
    id: "gathering-table",
    name: "The Gathering Table",
    pricePerPerson: 32,
    minimumFood: 1000,
    peakSaturdayMinimum: 1500,
    line: "The table everyone circles back to, all evening.",
    bestFor: ["Heavy appetizer reception", "Rehearsal", "Welcome party", "Micro-wedding main food"],
    portion: "Generous · about 6–7 oz per guest",
    recommendedGuests: "Best for 30+ guests",
    includes: [
      "Styled grazing table with tiered display",
      "All food",
      "Signiorina boards + risers",
      "Eco plates, napkins + picks",
      "Menu card + allergen card",
      "Couple-name flag",
      "Setup + styling",
    ],
    pieceReturn: "fee",
    image: "candlelitTable",
  },
  {
    id: "hosted-table",
    name: "The Hosted Table",
    pricePerPerson: 42,
    minimumFood: 1500,
    peakSaturdayMinimum: 2000,
    line: "Dinner, served as a table worth lingering at.",
    bestFor: ["Micro-wedding reception", "Dinner-replacement grazing", "A fully hosted experience"],
    portion: "Meal-level grazing",
    recommendedGuests: "Best for 30+ guests",
    includes: [
      "Meal-level grazing",
      "Upgraded meats + cheeses",
      "Burrata",
      "Panini + focaccia",
      "A dolce section",
      "Fuller styling",
      "Custom menu",
      "A custom welcome sign or signage moment",
      "Setup, service pieces + teardown",
      "Upgraded disposables",
      "One attendant for 3 hours per 75 guests",
    ],
    pieceReturn: "included",
    attendants: { perGuests: 75, hours: 3 },
    image: "boardLargeWide",
  },
];

export const grazingTables = {
  tiers: [
    { id: "light", name: "Light", pricePerPerson: 22, portion: "About 4–5 oz per guest", line: "A graze before dinner, or alongside other food." },
    { id: "generous", name: "Generous", pricePerPerson: 30, portion: "About 6–7 oz per guest", line: "The main food for a two-to-three-hour party." },
    { id: "premium", name: "Premium", pricePerPerson: 38, portion: "Meal-level", line: "Enough to stand in for a meal." },
  ] as GrazingTier[],
  minimumFood: 650,
  minimumGuests: 20,
  leadTimeDays: 10,
  /** Setup is billed separately for non-wedding grazing tables. */
  setupFee: { A: 125, B: 125, C: 175 } as Record<"A" | "B" | "C", number>,
};

export const weddingRules = {
  /** Book at least this many days ahead. */
  bookingLeadDays: 30,
  /** Final guest count due this many days before the event. */
  finalCountDays: 14,
  /** Peak months (1–12) where peak-Saturday minimums apply. */
  peakMonths: [5, 6, 9, 10, 12],
  /** Couples booking this many Signiorina events in one wedding weekend get the bundle discount. */
  bundle: { minimumEvents: 2, foodDiscountPercent: 5, name: "Wedding Weekend Bundle" },
  /** The 30–80 guest wedding is the sweet spot. */
  focusGuestRange: "30–80 guests",
};

export const eventFees = {
  /** Serving-piece pickup / teardown, when not included. */
  pickup: { nextDay: 75, sameNight: 125 },
  /** Added to food on federal holidays. */
  federalHolidayFoodPercent: 10,
  /** Events booked inside this many days, if accepted. */
  rush: { underDays: 10, foodPercent: 10 },
  /** Wedding + custom event retainer (nonrefundable). */
  retainerPercent: 50,
  /** Per-person upcharges available on events. */
  perPerson: { dopUpgrade: 3, glutenConscious: 1 },
  attendant: { hourly: 45, minimumHours: 3 },
  servingPieceRental: 150,
  customSign: 25,
  /** Event delivery uses the zone fee without free-delivery thresholds. */
  deliveryUsesZoneFee: true,
  /** Separately stated setup and attendant labor are not taxed (TN). Food + delivery are. */
  taxSetupAndLabor: false,
  noMandatoryGratuity: true,
  noServiceCharge: true,
  noCardSurcharge: true,
};

/* ------------------------------------------------------------------ */
/* threeJourneyArchitectureV2                                          */
/* ------------------------------------------------------------------ */

export type GrazingTierId = "light" | "generous" | "premium";

export interface EventPackage {
  tierId: GrazingTierId;
  /** PROPOSED customer-facing name — shown only once `eventPackages.namesApproved` is true (or where placeholders show). */
  proposedName: string;
  /** PROPOSED one-line description that goes with the proposed name. */
  proposedSubline: string;
  /** Photo registry key. */
  image: string;
}

/**
 * Events journey: the three styled grazing tables above, presented as packages. Prices,
 * minimums, setup and lead time all come from `grazingTables`; this adds presentation only.
 *
 * The names are PROPOSALS awaiting the owner's approval. Until `namesApproved` is true they
 * appear only where placeholders are shown (development, or NEXT_PUBLIC_SHOW_PLACEHOLDERS=true)
 * and carry a visible "Proposed name" label; everywhere else the current tier names are used.
 */
export const eventPackages = {
  namesApproved: false,
  packages: [
    { tierId: "light", proposedName: "The Spuntino", proposedSubline: "A light graze before dinner", image: "gatheringBoardSmall" },
    { tierId: "generous", proposedName: "The Festa", proposedSubline: "The party table", image: "gatheringBoardLarge" },
    { tierId: "premium", proposedName: "The Abbondanza", proposedSubline: "Abundant enough to be dinner", image: "abundantBoard" },
  ] as EventPackage[],
  /** Included with every styled grazing table, as published on the gatherings page. */
  includes: ["Styled grazing table, built on site", "All food", "Eco plates, napkins + picks", "Menu card + allergen card"],
};

/** Occasions for the Events journey. Explanatory and carried into the proposal — they don't change the price. */
export const eventOccasions = [
  { id: "corporate", label: "Corporate gathering or offsite" },
  { id: "birthday", label: "Birthday" },
  { id: "graduation", label: "Graduation" },
  { id: "shower", label: "Bridal or baby shower" },
  { id: "anniversary", label: "Anniversary party" },
  { id: "private", label: "Private celebration" },
  { id: "other", label: "Something else" },
] as const;

/** Wedding moments a table can be for. Carried into the proposal; they don't change the price. */
export const weddingMoments = [
  { id: "cocktail-hour", label: "Cocktail hour" },
  { id: "reception", label: "Reception" },
  { id: "welcome-party", label: "Welcome party" },
  { id: "rehearsal", label: "Rehearsal gathering" },
  { id: "other", label: "Something else" },
] as const;

export interface WeddingPreset {
  id: string;
  /** Working UX label — not an approved product name. */
  name: string;
  line: string;
  /** The wedding package it starts from; every price and rule comes from that package. */
  packageId: string;
  /** Starting guest count, used only when the couple hasn't entered one. */
  guests: number;
  moment: (typeof weddingMoments)[number]["id"];
  dopUpgrade: boolean;
  addOns: Array<{ id: string; quantity: number }>;
  /** Enhancements listed first and marked "Recommended": add-on ids, or "dop" / "attendant". */
  recommended: string[];
}

/**
 * Build Your Table "Start with a favorite" combinations. Editable starting points for the
 * shared planner — not separate products or prices. Labels are working names pending approval.
 */
export const weddingPresets: WeddingPreset[] = [
  {
    id: "cocktail-hour",
    name: "Cocktail Hour",
    line: "A lighter grazing table for the hour before dinner.",
    packageId: "aperitivo-hour",
    guests: 50,
    moment: "cocktail-hour",
    dopUpgrade: false,
    addOns: [],
    recommended: ["burrata-focaccia", "dop"],
  },
  {
    id: "celebration-table",
    name: "The Celebration Table",
    line: "A substantial table for a reception or rehearsal gathering.",
    packageId: "gathering-table",
    guests: 60,
    moment: "reception",
    dopUpgrade: false,
    addOns: [{ id: "dolce-board", quantity: 1 }],
    recommended: ["panini-tray", "dop"],
  },
  {
    id: "full-reception",
    name: "The Full Reception",
    line: "A generous hosted table that stands in for dinner, with attendants and teardown.",
    packageId: "hosted-table",
    guests: 80,
    moment: "reception",
    dopUpgrade: true,
    addOns: [],
    recommended: ["attendant", "dolce-board"],
  },
];

export function getWeddingPreset(id: string): WeddingPreset | undefined {
  return weddingPresets.find((p) => p.id === id);
}

/** Future / test offerings. Present in the data model, not marketed at launch. */
export const futureOfferings = [
  {
    id: "morning-table",
    name: "Morning Table",
    status: "test" as const,
    pricePerPerson: 26,
    minimumFood: 600,
    note: "Test after launch. Not shown on the site.",
  },
];

export function getWeddingPackage(id: string): WeddingPackage | undefined {
  return weddingPackages.find((p) => p.id === id);
}
