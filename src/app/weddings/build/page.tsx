import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { TrackView } from "@/components/journeys/Tracking";
import { WeddingPlanner } from "@/components/planner/WeddingPlanner";
import { weddingPackages } from "@/config/events";
import { flags } from "@/config/flags";
import { formatDollars } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Build Your Table — Wedding Grazing Planner + Instant Estimate",
  description: `Plan your Smoky Mountain wedding grazing table: start from a favorite or build your own from ${formatDollars(weddingPackages[0].pricePerPerson)}/guest, see an itemized estimate as you go, and request a written proposal.`,
  path: "/weddings/build",
});

/** Weddings journey (threeJourneyArchitectureV2): the guided planner. */
export default function BuildYourTablePage() {
  // With the flag off, next.config redirects here to /weddings (query kept) before this renders.
  if (!flags.threeJourneyArchitectureV2) notFound();
  return (
    <>
      <TrackView event="journey_landing_view" props={{ journey: "weddings", page: "build" }} />
      <div className="container-page pb-20 pt-10 md:pt-14">
        <header className="hero-enter max-w-3xl">
          <p className="eyebrow flex items-center gap-3 text-olive-soft">
            <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
            Weddings
          </p>
          <h1 className="display-lg mt-4 text-olive">
            Build <span className="accent">your table.</span>
          </h1>
          <p className="lede mt-4 text-muted">
            Choose how to begin, tell us about the day, make it yours — and see the estimate update as you go. Then send it to
            us for a written proposal.
          </p>
        </header>
        <div className="mt-10">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-[1.75rem] bg-linen/60" aria-label="Loading the planner" />}>
            <WeddingPlanner />
          </Suspense>
        </div>
      </div>
    </>
  );
}
