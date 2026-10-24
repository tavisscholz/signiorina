"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect, useMemo, useState } from "react";

import { businessNow } from "@/lib/dates";
import { estimateEvent, type EventEstimate } from "@/lib/event-estimate";
import { parsePlanner, serializePlanner, toEstimateInput, type PlannerJourney, type PlannerState } from "@/lib/planner";
import { useNow } from "@/lib/use-now";

/**
 * Planner state is mirrored in the URL: refresh keeps it, links share it, and step changes
 * are history entries so the browser's Back button walks back through the steps.
 *
 * The screen renders from local state, updated synchronously on every edit, so a checkbox
 * never flickers back while the router catches up with the URL. Back/Forward only move
 * between steps: each history entry holds the plan as it was when that step was left, so
 * the planner takes the step from it and keeps the latest selections.
 */
export function usePlanner(journey: PlannerJourney) {
  const params = useSearchParams();
  const pathname = usePathname();
  const urlKey = params.toString();
  const [local, setLocal] = useState(() => ({ seen: urlKey, state: parsePlanner(journey, params) }));

  let state = local.state;
  if (urlKey !== local.seen) {
    const external = urlKey !== serializePlanner(local.state).toString();
    const next = external
      ? parsePlanner(journey, serializePlanner({ ...local.state, step: parsePlanner(journey, params).step }))
      : local.state;
    setLocal({ seen: urlKey, state: next });
    state = next;
  }

  // After Back/Forward, write the latest selections into the entry we landed on, before paint.
  useLayoutEffect(() => {
    const qs = serializePlanner(state).toString();
    if (window.location.search.replace(/^\?/, "") !== qs) window.history.replaceState(null, "", `${pathname}?${qs}`);
  }, [state, pathname]);

  const now = useNow();
  const today = now === undefined ? undefined : businessNow(new Date(now)).date;
  const estimate: EventEstimate | null = useMemo(() => {
    if (!today) return null;
    const input = toEstimateInput(state, today);
    return input ? estimateEvent(input) : null;
  }, [state, today]);

  const write = (next: PlannerState, mode: "push" | "replace") => {
    // Normalise through the URL format so local state and the link always agree (e.g. step clamping).
    const qs = serializePlanner(next);
    const normalized = parsePlanner(journey, qs);
    setLocal((l) => ({ ...l, state: normalized }));
    const url = `${pathname}?${serializePlanner(normalized).toString()}`;
    if (mode === "push") window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  };

  // Edits start from the live URL (written synchronously above), so two quick edits in a row
  // — a date, then a place — never overwrite each other.
  const latest = () => parsePlanner(journey, new URLSearchParams(window.location.search));

  return {
    state,
    estimate,
    today,
    /** Change fields on the current step. */
    update: (patch: Partial<PlannerState>) => write({ ...latest(), ...patch }, "replace"),
    /** Replace the whole plan (e.g. load a favorite), optionally moving to a step. */
    replace: (next: PlannerState, mode: "push" | "replace" = "push") => write(next, mode),
    /** Move to a step; a new history entry so Back returns here. */
    go: (step: number) => write({ ...latest(), step }, "push"),
    shareUrl: () => `${window.location.origin}${pathname}?${serializePlanner(state).toString()}`,
  };
}

export type PlannerApi = ReturnType<typeof usePlanner>;
