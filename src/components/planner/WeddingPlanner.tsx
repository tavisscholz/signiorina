"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRef, useState } from "react";

import { PlannerShell } from "@/components/planner/PlannerShell";
import { DetailsFields, OptionCards, UpgradeFields } from "@/components/planner/PlannerFields";
import { CrossSell, PlannerSummary, RequestStep, ReviewBlocks } from "@/components/planner/PlannerParts";
import { ThankYourTeam } from "@/components/planner/ThankYourTeam";
import { usePlanner } from "@/components/planner/usePlanner";
import { Button } from "@/components/ui/Button";
import { IconInfo } from "@/components/ui/Icons";
import { Notice } from "@/components/ui/Notice";
import { getAddOn } from "@/config/catalog";
import {
  getWeddingPackage,
  getWeddingPreset,
  weddingMoments,
  weddingPackages,
  weddingPresets,
  weddingRules,
  type WeddingPreset,
} from "@/config/events";
import { track } from "@/lib/analytics";
import { estimateEvent } from "@/lib/event-estimate";
import { formatDollars } from "@/lib/money";
import { applyCustomStart, applyPreset, emptyPlanner, hasCustomSelections, toEstimateInput } from "@/lib/planner";

type Pending = { kind: "preset"; id: string } | { kind: "custom"; id: string };

function presetExtras(p: WeddingPreset): string[] {
  return [
    ...(p.dopUpgrade ? ["DOP upgrade"] : []),
    ...p.addOns.map((a) => `${getAddOn(a.id)?.name}${a.quantity > 1 ? ` × ${a.quantity}` : ""}`),
  ];
}

/** Build Your Table: the wedding planner. Every price comes from the shared event-estimate engine. */
export function WeddingPlanner() {
  const planner = usePlanner("weddings");
  const { state, estimate, today, update, replace, go } = planner;
  const pkg = state.optionId ? getWeddingPackage(state.optionId) : undefined;
  const preset = state.preset ? getWeddingPreset(state.preset) : undefined;
  const moment = weddingMoments.find((m) => m.id === state.occasion);
  const confirmRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);

  // "From" price for a favorite at its starting guest count — food, pickup and tax, before delivery.
  const presetFrom = (p: WeddingPreset) => {
    if (!today) return undefined;
    const input = toEstimateInput({ ...applyPreset(emptyPlanner("weddings"), p.id), date: undefined, area: undefined }, today);
    const e = input ? estimateEvent(input) : null;
    return e ? `About ${formatDollars(Math.round(e.total / 100))} for ${p.guests} guests, before delivery` : undefined;
  };

  const choose = (choice: Pending) => {
    const same = choice.kind === "preset" ? state.start === "preset" && state.preset === choice.id : state.start === "custom" && state.optionId === choice.id;
    if (same) {
      go(2);
      return;
    }
    if (hasCustomSelections(state)) {
      setPending(choice);
      confirmRef.current?.showModal();
      return;
    }
    apply(choice);
  };

  const apply = (choice: Pending) => {
    const next = choice.kind === "preset" ? applyPreset(state, choice.id) : applyCustomStart(state, choice.id);
    if (state.optionId) track("wedding_preset_switched", { from: state.preset ?? state.optionId, to: choice.id });
    else track("wedding_builder_started", { start: choice.kind, preset: choice.kind === "preset" ? choice.id : undefined, option: next.optionId });
    replace({ ...next, step: 2 });
  };

  const summary = (
    <PlannerSummary
      planner={planner}
      packageName={
        pkg ? (
          <>
            {preset?.name ?? pkg.name}
            {preset ? <span className="block text-[0.8rem] text-muted">on {pkg.name}</span> : null}
          </>
        ) : undefined
      }
      occasionTitle="Moment"
      occasionLabel={moment?.label}
    />
  );

  const peak = estimate?.peakSaturday && pkg?.peakSaturdayMinimum;

  return (
    <>
      <PlannerShell
        planner={planner}
        summary={summary}
        hideNav={state.step === 1 && !state.optionId}
        // The page header already introduces the first step.
        hideTitle={state.step === 1}
        nextHint={state.step === 1 ? "Choose a starting point to continue." : state.step === 2 ? "Add your guest count to continue." : undefined}
      >
        {state.step === 1 ? (
          <div className="flex flex-col gap-12">
            <section aria-labelledby="favorites-title">
              <h3 id="favorites-title" className="display-sm text-olive">
                Popular Favorites
              </h3>
              <ul className="mt-5 grid gap-4 md:grid-cols-3">
                {weddingPresets.map((p) => {
                  const base = getWeddingPackage(p.packageId)!;
                  const selected = state.start === "preset" && state.preset === p.id;
                  const extras = presetExtras(p);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => choose({ kind: "preset", id: p.id })}
                        aria-pressed={selected}
                        className={clsx(
                          "flex h-full w-full flex-col gap-2 rounded-[1.5rem] border p-5 text-left transition-colors",
                          selected ? "border-olive bg-olive text-cream" : "border-line-strong bg-paper hover:border-olive",
                        )}
                      >
                        <span className="font-display text-[1.45rem] leading-tight">{p.name}</span>
                        <span className={clsx("text-[0.92rem]", selected ? "text-cream/85" : "text-muted")}>{p.line}</span>
                        <span className={clsx("mt-auto border-t pt-3 text-[0.85rem]", selected ? "border-cream/25 text-cream/85" : "border-line text-muted")}>
                          Built on {base.name} · {formatDollars(base.pricePerPerson)}/guest
                          {extras.length ? <span className="block">With {extras.join(", ")}</span> : null}
                          <span className="block">{presetFrom(p) ?? " "}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
            <section aria-labelledby="custom-title">
              <h3 id="custom-title" className="display-sm text-olive">
                Build Your Own
              </h3>
              <p className="mt-2 text-[0.95rem] text-muted">Pick a package and make every decision yourself.</p>
              <ul className="mt-5 grid gap-4 md:grid-cols-3">
                {weddingPackages.map((p) => {
                  const selected = state.start === "custom" && state.optionId === p.id;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => choose({ kind: "custom", id: p.id })}
                        aria-pressed={selected}
                        className={clsx(
                          "flex h-full w-full flex-col gap-2 rounded-[1.5rem] border p-5 text-left transition-colors",
                          selected ? "border-olive bg-olive text-cream" : "border-line-strong bg-paper hover:border-olive",
                        )}
                      >
                        <span className="font-display text-[1.35rem] leading-tight">{p.name}</span>
                        <span className={clsx("text-[0.92rem]", selected ? "text-cream/85" : "text-muted")}>{p.line}</span>
                        <span className={clsx("mt-auto border-t pt-3 text-[0.85rem]", selected ? "border-cream/25 text-cream/85" : "border-line text-muted")}>
                          {formatDollars(p.pricePerPerson)}/guest · {formatDollars(p.minimumFood)} minimum
                          {p.peakSaturdayMinimum ? ` (${formatDollars(p.peakSaturdayMinimum)} peak Saturdays)` : ""}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
            <p className="text-[0.92rem] text-muted">
              Want to look around first?{" "}
              <Link href="/weddings" className="text-olive underline underline-offset-4">
                See the wedding packages
              </Link>
              .
            </p>
          </div>
        ) : null}

        {state.step === 2 ? (
          <DetailsFields
            state={state}
            update={update}
            today={today}
            occasionLabel="What's the table for?"
            occasions={weddingMoments}
            guestHint={`Most of our weddings are ${weddingRules.focusGuestRange}. A rough count is fine — the final count is due ${weddingRules.finalCountDays} days before.`}
          >
            {peak ? (
              <p className="flex gap-2 text-[0.9rem] text-olive">
                <IconInfo size={18} className="mt-0.5 shrink-0" />
                Peak Saturday: a {formatDollars(pkg!.peakSaturdayMinimum!)} food minimum applies to {pkg!.name}.
              </p>
            ) : null}
            {estimate?.warnings.map((w) => (
              <p key={w} className="flex gap-2 text-[0.9rem] text-fig">
                <IconInfo size={18} className="mt-0.5 shrink-0" /> {w}
              </p>
            ))}
            {state.guests !== undefined && state.guests < 20 ? (
              <Notice tone="pistachio">
                For an intimate group, a board or two may suit you better.{" "}
                <Link href="/everyday?category=wedding-weekend" className="underline underline-offset-4">
                  See wedding-weekend boards
                </Link>
                .
              </Notice>
            ) : null}
          </DetailsFields>
        ) : null}

        {state.step === 3 ? (
          <div className="flex flex-col gap-10">
            <OptionCards
              legend="Package"
              name="wedding-package"
              value={state.optionId}
              onChange={(id) => update({ optionId: id })}
              options={weddingPackages.map((p) => ({
                id: p.id,
                name: p.name,
                price: `${formatDollars(p.pricePerPerson)}/guest`,
                meta: `${formatDollars(p.minimumFood)} min`,
                badge: preset?.packageId === p.id ? `${preset.name}` : undefined,
              }))}
            />
            {pkg ? (
              <details className="rounded-2xl border border-line bg-paper p-5">
                <summary className="cursor-pointer text-[0.95rem] font-medium text-olive">What&apos;s included with {pkg.name}</summary>
                <ul className="mt-3 grid gap-1.5 text-[0.9rem] text-muted sm:grid-cols-2">
                  {pkg.includes.map((i) => (
                    <li key={i}>· {i}</li>
                  ))}
                </ul>
              </details>
            ) : null}
            <UpgradeFields state={state} update={update} recommended={preset?.recommended ?? []} />
          </div>
        ) : null}

        {state.step === 4 && pkg ? (
          <>
            <ReviewBlocks
              planner={planner}
              title={preset?.name ?? pkg.name}
              line={[preset ? `Built on ${pkg.name}` : pkg.line, moment ? `for the ${moment.label.toLowerCase()}` : ""].filter(Boolean).join(", ")}
              includes={pkg.includes}
              detailsStep={2}
              customizeStep={3}
            />
            <ThankYourTeam />
          </>
        ) : null}

        {state.step === 5 && pkg ? (
          <RequestStep
            planner={planner}
            context={{
              eventType: "Wedding",
              serviceInterest: pkg.name,
              planner: { journey: "weddings", start: state.start, preset: state.preset, occasion: state.occasion, area: state.area },
              submittedEvent: "wedding_proposal_submitted",
            }}
            success={<CrossSell href="/everyday?category=wedding-weekend">Wedding-weekend boards + welcome boxes</CrossSell>}
          />
        ) : null}
      </PlannerShell>

      <dialog
        ref={confirmRef}
        aria-labelledby="replace-title"
        aria-describedby="replace-body"
        className="m-auto w-[min(92vw,28rem)] rounded-[1.5rem] bg-paper p-6 text-espresso backdrop:bg-espresso/50"
        onClose={() => setPending(null)}
      >
        <h2 id="replace-title" className="display-sm text-olive">
          Replace your selections?
        </h2>
        <p id="replace-body" className="mt-3 text-[0.95rem] text-muted">
          Starting from{" "}
          {pending?.kind === "preset" ? getWeddingPreset(pending.id)?.name : pending ? getWeddingPackage(pending.id)?.name : ""} will
          replace your package, upgrades and add-ons. Your date, place and guest count stay.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" onClick={() => confirmRef.current?.close()} autoFocus>
            Keep my selections
          </Button>
          <Button
            onClick={() => {
              const choice = pending;
              confirmRef.current?.close();
              if (choice) apply(choice);
            }}
          >
            Replace
          </Button>
        </div>
      </dialog>
    </>
  );
}
