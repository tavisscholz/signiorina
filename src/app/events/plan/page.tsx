import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TrackView } from "@/components/journeys/Tracking";
import { EventPlanner } from "@/components/planner/EventPlanner";
import { flags } from "@/config/flags";
import { site } from "@/config/site";
import { pageMetadata, plannerRobots } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Plan Your Event — Grazing Table Estimate + Proposal",
    description: "Choose a styled grazing table, add your date, place and guest count, see an itemized estimate and request a written proposal.",
    path: "/events/plan",
  }),
  robots: plannerRobots,
};

/** Events journey (threeJourneyArchitectureV2): the package planner. */
export default function EventPlanPage() {
  // With the flag off, next.config redirects here to /inquire (query kept) before this renders.
  if (!flags.threeJourneyArchitectureV2) notFound();
  return (
    <>
      <TrackView event="journey_landing_view" props={{ journey: "events", page: "plan" }} />
      <div className="container-page pb-20 pt-10 md:pt-14">
        <header className="hero-enter max-w-3xl">
          <p className="eyebrow flex items-center gap-3 text-olive-soft">
            <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
            Events
          </p>
          <h1 className="display-lg mt-4 text-olive">
            Plan your <span className="accent">event.</span>
          </h1>
          <p className="lede mt-4 text-muted">A few details, an itemized estimate, then a written proposal from us.</p>
        </header>
        <div className="mt-10">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[1.75rem] bg-linen/60" aria-label="Loading the planner" />}>
            <EventPlanner showProposed={site.showPlaceholders} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
