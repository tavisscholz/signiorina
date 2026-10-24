/**
 * Site-wide settings. Contact details, address, hours, social handles and
 * licensing statements stay `null` until the owner supplies them — the UI and
 * structured data omit anything that is null rather than inventing it.
 */
export const site = {
  /** Intentional spelling — never "Signorina". */
  name: "Signiorina",
  descriptor: "Modern Italian-Inspired Mobile Charcuterie & Hospitality",
  shortDescriptor: "Mobile charcuterie + hospitality",
  territory: "Modern Aperitivo",
  positioning:
    "Modern Italian-inspired hospitality made mobile — generous, polished, social food that makes any gathering feel beautifully hosted.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  timeZone: "America/New_York",
  currency: "USD",
  locale: "en-US",

  serviceArea: {
    summary:
      "Sevierville, Pigeon Forge, Gatlinburg and the Great Smoky Mountains destination market, plus Knoxville and selected East Tennessee communities.",
    cities: [
      "Sevierville",
      "Pigeon Forge",
      "Gatlinburg",
      "Kodak",
      "Seymour",
      "Wears Valley",
      "Dandridge",
      "Knoxville",
      "Farragut",
      "Maryville",
      "Alcoa",
      "Townsend",
      "Newport",
    ],
    region: "TN",
  },

  /** Supplied by the owner. Null values are hidden everywhere. */
  contact: {
    email: null as string | null,
    phone: null as string | null,
    instagram: null as string | null,
  },
  /** No storefront, kitchen address, permits, hours or ratings are published until confirmed. */
  address: null as null | { street: string; city: string; region: string; postalCode: string },
  openingHours: null as null | string[],

  /**
   * Placeholder content (testimonials, founder story) renders with a visible
   * label in development. In production it is hidden unless explicitly enabled.
   */
  showPlaceholders:
    process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === "true" ||
    (process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS !== "false" && process.env.NODE_ENV !== "production"),
} as const;

export const navigation = {
  primary: [
    { href: "/weddings", label: "Weddings" },
    { href: "/gatherings", label: "Gatherings" },
    { href: "/corporate", label: "Corporate" },
    { href: "/cabin-delivery", label: "Cabin Delivery" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
  ],
  actions: {
    order: { href: "/order", label: "Order Online" },
    plan: { href: "/inquire", label: "Plan Your Gathering" },
  },
} as const;
