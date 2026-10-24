"use client";

import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { IconArrow, IconArrowLeft, IconCheck, IconClose } from "@/components/ui/Icons";
import { formatCentsExact } from "@/lib/money";
import { maxReachableStep, plannerSteps } from "@/lib/planner";
import type { PlannerApi } from "@/components/planner/usePlanner";

/**
 * Frame shared by Build Your Table and the event planner: progress, the current step, Back /
 * Next, and the live estimate — a sticky column on desktop, a bar with a details sheet on phones.
 */
export function PlannerShell({
  planner,
  summary,
  children,
  nextHint,
  hideNav = false,
}: {
  planner: PlannerApi;
  /** The estimate panel (selections + itemized estimate). */
  summary: ReactNode;
  children: ReactNode;
  /** Why Next is unavailable, when it is. */
  nextHint?: string;
  hideNav?: boolean;
}) {
  const { state, estimate, go } = planner;
  const steps = plannerSteps[state.journey];
  const current = steps[state.step - 1];
  const reachable = maxReachableStep(state);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const shownStep = useRef(state.step);

  // Move focus to the new step's heading when the step changes — never on first load, where
  // focus belongs to the page (and React's development double-run must not count as a change).
  useEffect(() => {
    if (shownStep.current === state.step) return;
    shownStep.current = state.step;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }, [state.step]);

  const next = steps[state.step];
  const canNext = next !== undefined && state.step + 1 <= reachable;

  return (
    <div className="pb-32 lg:pb-0">
      <ol className="hidden gap-2 md:flex" aria-label="Progress">
        {steps.map((s, i) => {
          const n = i + 1;
          const isCurrent = n === state.step;
          const done = n < state.step;
          const open = n <= reachable;
          return (
            <li key={s.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => open && !isCurrent && go(n)}
                aria-current={isCurrent ? "step" : undefined}
                aria-disabled={!open || undefined}
                className={clsx(
                  "flex w-full items-center gap-2.5 border-t-2 pt-3 text-left text-[0.85rem] transition-colors",
                  isCurrent ? "border-olive text-olive" : done ? "border-olive/50 text-olive" : "border-line-strong text-muted",
                  open && !isCurrent ? "cursor-pointer hover:text-olive" : !open ? "cursor-not-allowed" : "",
                )}
              >
                <span
                  aria-hidden="true"
                  className={clsx(
                    "grid size-6 shrink-0 place-items-center rounded-full text-[0.75rem]",
                    isCurrent ? "bg-olive text-cream" : done ? "bg-olive/15 text-olive" : "border border-line-strong",
                  )}
                >
                  {done ? <IconCheck size={14} /> : n}
                </span>
                <span className="truncate">{s.short}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="md:hidden">
        <p className="text-[0.85rem] text-muted">
          Step {state.step} of {steps.length}
        </p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div className="h-full rounded-full bg-olive transition-[width] duration-500" style={{ width: `${(state.step / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <section className="min-w-0 lg:col-span-7 xl:col-span-8" aria-labelledby="planner-step-title">
          <h2
            id="planner-step-title"
            ref={headingRef}
            tabIndex={-1}
            className="display-md scroll-mt-32 text-olive outline-none"
          >
            {current.title}
          </h2>
          <div className="mt-8">{children}</div>

          {!hideNav ? (
            <nav aria-label="Step navigation" className="mt-12 flex flex-col-reverse gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              {state.step > 1 ? (
                <Button variant="text" onClick={() => go(state.step - 1)}>
                  <IconArrowLeft size={16} /> Back
                </Button>
              ) : (
                <span />
              )}
              {next ? (
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  <Button size="lg" onClick={() => go(state.step + 1)} disabled={!canNext}>
                    Next: {next.short} <IconArrow size={16} />
                  </Button>
                  {!canNext && nextHint ? <p className="text-[0.85rem] text-muted">{nextHint}</p> : null}
                </div>
              ) : null}
            </nav>
          ) : null}
        </section>

        <aside className="hidden lg:col-span-5 lg:block xl:col-span-4" aria-label="Your estimate">
          <div className="sticky top-32 rounded-[1.75rem] border border-olive/25 bg-paper p-6 shadow-[var(--shadow-card)] md:p-7">
            {summary}
          </div>
        </aside>
      </div>

      {/* One short announcement per change, rather than the whole breakdown. */}
      <p className="sr-only" aria-live="polite">
        {estimate ? `Estimated total ${formatCentsExact(estimate.total)}` : ""}
      </p>

      {/* Phones: the total is always on screen; the full breakdown opens in a sheet. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <p className="min-w-0">
            <span className="block text-[0.75rem] uppercase tracking-[0.14em] text-muted">Estimated total</span>
            <span className="price text-[1.45rem] leading-tight text-olive">
              {estimate ? formatCentsExact(estimate.total) : "—"}
            </span>
          </p>
          <Button variant="secondary" size="md" onClick={() => sheetRef.current?.showModal()}>
            View details
          </Button>
        </div>
      </div>
      <dialog
        ref={sheetRef}
        aria-labelledby="planner-sheet-title"
        className="m-0 mt-auto max-h-[85vh] w-full max-w-none overflow-y-auto rounded-t-[1.75rem] bg-paper p-6 text-espresso backdrop:bg-espresso/50 lg:hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="flex items-center justify-between">
          <h2 id="planner-sheet-title" className="eyebrow text-olive-soft">
            Your estimate
          </h2>
          <button
            type="button"
            onClick={() => sheetRef.current?.close()}
            className="grid size-10 place-items-center rounded-full text-olive hover:bg-olive/8"
            aria-label="Close estimate details"
          >
            <IconClose size={22} />
          </button>
        </div>
        {summary}
      </dialog>
    </div>
  );
}
