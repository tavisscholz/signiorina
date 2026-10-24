import { flags } from "./flags";

/**
 * The three customer journeys (threeJourneyArchitectureV2) and the routes that change with
 * the flag. Relative imports only: next.config.ts loads this file for its redirects.
 */

export type JourneyId = "everyday" | "events" | "weddings";

export interface Journey {
  id: JourneyId;
  /** Customer-facing name. Fixed by the architecture brief — do not rename. */
  name: "Everyday" | "Events" | "Weddings";
  description: string;
  cta: string;
  href: string;
  /** Photo registry key (src/config/media.ts). */
  media: string;
  /** How this journey buys — used in "how it works". */
  steps: Array<{ title: string; body: string }>;
}

export const journeys: Journey[] = [
  {
    id: "everyday",
    name: "Everyday",
    description: "Boxes, boards & little indulgences.",
    cta: "Shop Everyday",
    href: "/everyday",
    media: "aperitivoBox",
    steps: [
      { title: "Choose", body: "Boxes and boards at fixed prices, for one to fifteen." },
      { title: "Schedule", body: "Pick a date and a delivery window. Every fee shows before you pay." },
      { title: "Enjoy", body: "We deliver it fresh, in the window you chose." },
    ],
  },
  {
    id: "events",
    name: "Events",
    description: "Beautifully catered gatherings & celebrations.",
    cta: "Explore Packages",
    href: "/events",
    media: "boardLargeWide",
    steps: [
      { title: "Pick a package", body: "Three styled grazing tables, priced per guest." },
      { title: "Tell us about it", body: "Date, place and guest count — see your estimate as you go." },
      { title: "We confirm + style", body: "We confirm availability, send a written quote and set the table on site." },
    ],
  },
  {
    id: "weddings",
    name: "Weddings",
    description: "An unforgettable grazing experience made for your special day.",
    cta: "Build Your Table",
    href: "/weddings/build",
    media: "weddingTable",
    steps: [
      { title: "Build your table", body: "Start from a favorite or from scratch, and watch the estimate update." },
      { title: "Request your proposal", body: "Send us the whole configuration — no blank form to fill in." },
      { title: "We set the table", body: "A written proposal, then we style it on the day." },
    ],
  },
];

export function getJourney(id: JourneyId): Journey {
  return journeys.find((j) => j.id === id)!;
}

/** Where shared links point. With the flag off these are the original routes. */
export const routes = flags.threeJourneyArchitectureV2
  ? {
      store: "/everyday",
      events: "/events",
      eventPlanner: "/events/plan",
      weddings: "/weddings",
      weddingPlanner: "/weddings/build",
    }
  : {
      store: "/order",
      events: "/gatherings",
      eventPlanner: "/inquire?type=event",
      weddings: "/weddings",
      weddingPlanner: "/inquire?type=wedding",
    };

/** Labels for shared links, so "Order online" becomes "Shop Everyday" with the journeys on. */
export const routeLabels = flags.threeJourneyArchitectureV2
  ? { store: "Shop Everyday", eventPlanner: "Plan an event", weddingPlanner: "Build Your Table" }
  : { store: "Order online", eventPlanner: "Ask about an event", weddingPlanner: "Plan a wedding" };

export interface JourneyRedirect {
  source: string;
  destination: string;
  /** Always temporary (307) so turning the flag off never fights cached permanent redirects. */
  permanent: false;
}

/**
 * Flag on: the old store and gatherings URLs land in the new journeys.
 * Flag off: links made while the flag was on (shared plans, bookmarks) still reach the
 * closest original page. Query strings pass through, so estimate parameters survive.
 */
export function journeyRedirects(enabledFlag: boolean): JourneyRedirect[] {
  return enabledFlag
    ? [
        { source: "/order", destination: "/everyday", permanent: false },
        { source: "/gatherings", destination: "/events", permanent: false },
      ]
    : [
        { source: "/everyday", destination: "/order", permanent: false },
        { source: "/events", destination: "/gatherings", permanent: false },
        { source: "/events/plan", destination: "/inquire", permanent: false },
        { source: "/weddings/build", destination: "/weddings", permanent: false },
      ];
}
