import { flags } from "@/config/flags";

/**
 * Public origin for canonical URLs, Open Graph, the sitemap and structured data.
 * Order: an explicit NEXT_PUBLIC_SITE_URL (set this for a custom domain), then Vercel's
 * production domain (previews still point canonicals at production), then the deployment
 * URL, then localhost for local development.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

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
  url: resolveSiteUrl(),
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

export interface NavItem {
  href: string;
  label: string;
  /** Extra path prefixes that mark this item as current (e.g. product pages under the store). */
  match?: string[];
}

export interface Navigation {
  primary: NavItem[];
  /** Header buttons. Null in the three-journey layout, where they would compete with the journeys. */
  actions: { order: NavItem; plan: NavItem } | null;
  /** Smaller links under the primary list in the mobile menu. */
  secondary: NavItem[];
}

const classicNavigation: Navigation = {
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
  secondary: [],
};

/** threeJourneyArchitectureV2: Everyday | Events | Weddings | About. */
const journeyNavigation: Navigation = {
  primary: [
    { href: "/everyday", label: "Everyday", match: ["/order", "/cart"] },
    { href: "/events", label: "Events" },
    { href: "/weddings", label: "Weddings" },
    { href: "/about", label: "About" },
  ],
  actions: null,
  secondary: [
    { href: "/corporate", label: "Corporate" },
    { href: "/cabin-delivery", label: "Cabin delivery" },
    { href: "/delivery", label: "Delivery areas + fees" },
    { href: "/faq", label: "FAQ" },
  ],
};

export const navigation: Navigation = flags.threeJourneyArchitectureV2 ? journeyNavigation : classicNavigation;
