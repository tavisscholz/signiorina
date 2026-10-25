import { flags } from "./flags";

/**
 * The three customer journeys (threeJourneyArchitectureV2) and the routes that change with
 * the flag. Relative imports only: next.config.ts loads this file for its redirects.
 */

export type JourneyId = "everyday" | "events" | "weddings";

export interface Journey {
  id: JourneyId;
  /** Customer-facing name. The "everyday" journey is labelled Shop (owner's choice); its route stays /everyday. */
  name: "Weddings" | "Events" | "Shop";
  /** The line on the journey card, written as the call to action. */
  description: string;
  cta: string;
  href: string;
  /** Photo registry key (src/config/media.ts). */
  media: string;
}

/** Weddings, Events, Shop: the homepage, navigation and footer follow this order. */
export const journeys: Journey[] = [
  {
    id: "weddings",
    name: "Weddings",
    description: "Build Your Dream Grazing Experience",
    cta: "Build Your Table",
    href: "/weddings/build",
    media: "weddingTable",
  },
  {
    id: "events",
    name: "Events",
    description: "Explore Packages for Gatherings & Celebrations",
    cta: "Explore Packages",
    href: "/events",
    media: "boardLargeWide",
  },
  {
    id: "everyday",
    name: "Shop",
    description: "Browse Boxes, Boards & Little Indulgences",
    cta: "Shop Treats",
    href: "/everyday",
    media: "aperitivoBox",
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

/** Labels for shared links, so "Order online" becomes "Shop Treats" with the journeys on; `storeSection` names the section itself (breadcrumbs). */
export const routeLabels = flags.threeJourneyArchitectureV2
  ? { store: "Shop Treats", storeSection: "Shop", eventPlanner: "Plan an event", weddingPlanner: "Build Your Table" }
  : { store: "Order online", storeSection: "Order online", eventPlanner: "Ask about an event", weddingPlanner: "Plan a wedding" };

export interface JourneyRedirect {
  source: string;
  /** Only when the request has these query keys (e.g. an estimate from the classic estimators). */
  has?: Array<{ type: "query"; key: string }>;
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
  const carriesEstimate = [{ type: "query" as const, key: "service" }];
  return enabledFlag
    ? [
        { source: "/order", destination: "/everyday", permanent: false },
        // Estimate links from the classic estimators open the matching planner, state intact.
        { source: "/gatherings", has: carriesEstimate, destination: "/events/plan?step=2", permanent: false },
        { source: "/gatherings", destination: "/events", permanent: false },
        { source: "/weddings", has: carriesEstimate, destination: "/weddings/build?step=3", permanent: false },
      ]
    : [
        { source: "/everyday", destination: "/order", permanent: false },
        { source: "/events", destination: "/gatherings", permanent: false },
        { source: "/events/plan", destination: "/inquire", permanent: false },
        { source: "/weddings/build", destination: "/weddings", permanent: false },
      ];
}
