"use client";

import Link from "next/link";

import { PlannerShell } from "@/components/planner/PlannerShell";
import { DetailsFields, OptionCards, UpgradeFields } from "@/components/planner/PlannerFields";
import { CrossSell, PlannerSummary, RequestStep, ReviewBlocks } from "@/components/planner/PlannerParts";
import { usePlanner } from "@/components/planner/usePlanner";
import { IconInfo } from "@/components/ui/Icons";
import { Notice } from "@/components/ui/Notice";
import { eventOccasions, eventPackages, grazingTables } from "@/config/events";
import { eventPackageViews, getEventPackageView } from "@/lib/event-packages";
import { formatDollars } from "@/lib/money";
import { suggestsBoards } from "@/lib/planner";

/** Events journey: package → details → upgrades → review → request, on the shared estimate engine. */
export function EventPlanner({ showProposed }: { showProposed: boolean }) {
  const planner = usePlanner("events");
  const { state, estimate, today, update } = planner;
  const view = state.optionId ? getEventPackageView(state.optionId, showProposed) : undefined;
  const occasion = eventOccasions.find((o) => o.id === state.occasion);

  const summary = (
    <PlannerSummary
      planner={planner}
      packageName={view?.name}
      occasionTitle="Occasion"
      occasionLabel={occasion?.label}
      estimateTitle={view?.name}
    />
  );

  return (
    <PlannerShell
      planner={planner}
      summary={summary}
      nextHint={state.step === 1 ? "Choose a package and add your guest count to continue." : undefined}
    >
      {state.step === 1 ? (
        <div className="flex flex-col gap-10">
          <OptionCards
            legend="Package"
            name="event-package"
            value={state.optionId}
            onChange={(id) => update({ optionId: id })}
            options={eventPackageViews(showProposed).map((p) => ({
              id: p.tierId,
              name: p.name,
              price: `${formatDollars(p.tier.pricePerPerson)}/guest`,
              meta: p.tier.portion,
              line: p.subline,
              badge: p.proposed ? "Proposed name" : undefined,
            }))}
          />
          <DetailsFields
            state={state}
            update={update}
            today={today}
            occasionLabel="What's the occasion?"
            occasions={eventOccasions}
            guestHint={`Styled tables start at ${grazingTables.minimumGuests} guests.`}
          >
            {estimate?.warnings
              .filter((w) => !w.startsWith("Styled grazing tables start"))
              .map((w) => (
                <p key={w} className="flex gap-2 text-[0.9rem] text-fig">
                  <IconInfo size={18} className="mt-0.5 shrink-0" /> {w}
                </p>
              ))}
            {suggestsBoards(state) ? (
              <Notice tone="pistachio" title="A board may suit you better.">
                For fewer than {grazingTables.minimumGuests} guests, our boards are fixed-price and delivered — no setup fee.{" "}
                <Link href="/everyday?category=gather" className="underline underline-offset-4">
                  Shop Treats boards
                </Link>
                , or carry on and we&apos;ll talk it through.
              </Notice>
            ) : null}
          </DetailsFields>
        </div>
      ) : null}

      {state.step === 2 ? <UpgradeFields state={state} update={update} /> : null}

      {state.step === 3 && view ? (
        <ReviewBlocks
          planner={planner}
          title={view.name}
          line={[view.subline, occasion ? `for a ${occasion.label.toLowerCase()}` : ""].filter(Boolean).join(", ")}
          includes={[...eventPackages.includes, "Setup + styling (priced by zone)"]}
          detailsStep={1}
          customizeStep={2}
          estimateTitle={view.name}
        />
      ) : null}

      {state.step === 4 && view ? (
        <RequestStep
          planner={planner}
          context={{
            eventType: occasion?.label ?? "Private event",
            serviceInterest: view.proposed ? `${view.name} (${view.tier.name})` : view.name,
            planner: { journey: "events", occasion: state.occasion, area: state.area },
            submittedEvent: "event_proposal_submitted",
          }}
          success={<CrossSell href="/everyday">Shop Treats: boxes + boards</CrossSell>}
        />
      ) : null}
    </PlannerShell>
  );
}
