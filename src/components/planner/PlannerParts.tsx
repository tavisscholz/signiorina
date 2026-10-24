"use client";

import { useId, useRef, useState, type ReactNode } from "react";

import { EstimateSummary } from "@/components/events/EstimateSummary";
import { OliveSprig } from "@/components/brand/OliveSprig";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { IconCheck } from "@/components/ui/Icons";
import { Notice } from "@/components/ui/Notice";
import { getAddOn } from "@/config/catalog";
import { eventFees, getWeddingPackage, weddingRules } from "@/config/events";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { formatDateLong } from "@/lib/dates";
import { formatDollars } from "@/lib/money";
import { areaLabel, toEstimateState, type PlannerState } from "@/lib/planner";
import { inquirySchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import type { PlannerApi } from "@/components/planner/usePlanner";

/* ------------------------------------------------------------------ */
/* Live summary                                                        */
/* ------------------------------------------------------------------ */

export function PlannerSummary({
  planner,
  packageName,
  occasionTitle,
  occasionLabel,
  estimateTitle,
}: {
  planner: PlannerApi;
  packageName?: ReactNode;
  occasionTitle: string;
  occasionLabel?: string;
  /** Heading for the itemized estimate when the customer-facing name differs from the engine's. */
  estimateTitle?: string;
}) {
  const { state, estimate, today } = planner;
  const rows: Array<[string, ReactNode]> = [
    ["Package", packageName ?? "Not chosen yet"],
    [occasionTitle, occasionLabel ?? "—"],
    ["Date", state.date ? formatDateLong(state.date) : "Not set"],
    ["Where", areaLabel(state.area) ?? "Not sure yet"],
    ["Guests", state.guests ?? "—"],
  ];
  return (
    <div>
      <p className="eyebrow hidden text-olive-soft lg:block">Your estimate</p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.88rem]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="text-right text-espresso">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 border-t border-line pt-1">
        {estimate ? (
          <EstimateSummary estimate={estimate} title={estimateTitle} />
        ) : today === undefined && state.optionId && state.guests ? (
          <div className="mt-4 h-40 animate-pulse rounded-xl bg-linen/70" />
        ) : (
          <p className="mt-4 text-[0.92rem] text-muted">Choose a package and a guest count to see your estimate.</p>
        )}
      </div>
      <p className="mt-5 text-[0.78rem] text-muted">
        An estimate, not a quote. We confirm your date and send a written proposal. No service charge, no mandatory gratuity.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Review                                                              */
/* ------------------------------------------------------------------ */

/** The selected extras, in words. */
export function selectedExtras(state: PlannerState): string[] {
  const list: string[] = [];
  const pkg = state.journey === "weddings" && state.optionId ? getWeddingPackage(state.optionId) : undefined;
  if (state.dopUpgrade) list.push(`DOP upgrade (+${formatDollars(eventFees.perPerson.dopUpgrade)}/guest)`);
  if (state.glutenConscious) list.push(`Gluten-conscious (+${formatDollars(eventFees.perPerson.glutenConscious)}/guest)`);
  if (state.journey === "weddings" && state.bundle) list.push(weddingRules.bundle.name);
  if (state.journey === "events" && state.servingPieceRental) list.push("Serving-piece rental");
  if (pkg?.pieceReturn === "fee") list.push(state.pickup === "same-night" ? "Same-night teardown + pickup" : "Next-day serving-piece pickup");
  if (state.attendantHours > 0) list.push(`Extra attendant · ${Math.max(state.attendantHours, eventFees.attendant.minimumHours)} hrs`);
  for (const a of state.addOns) {
    const addOn = getAddOn(a.id);
    if (addOn && a.quantity > 0) list.push(`${addOn.name}${a.quantity > 1 ? ` × ${a.quantity}` : ""}`);
  }
  return list;
}

export function ReviewBlocks({
  planner,
  title,
  line,
  includes,
  detailsStep,
  customizeStep,
  shareLabel = "Copy a link to this plan",
  estimateTitle,
}: {
  planner: PlannerApi;
  title: ReactNode;
  line?: string;
  includes: string[];
  detailsStep: number;
  customizeStep: number;
  shareLabel?: string;
  estimateTitle?: string;
}) {
  const { state, estimate, go, shareUrl } = planner;
  const [copied, setCopied] = useState(false);
  const extras = selectedExtras(state);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      track("planner_link_copied", { journey: state.journey });
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 rounded-[1.5rem] border border-line bg-paper p-6 md:grid-cols-2 md:p-7">
        <div>
          <p className="eyebrow text-olive-soft">Your table</p>
          <p className="mt-2 font-display text-[1.6rem] leading-tight text-olive">{title}</p>
          {line ? <p className="mt-1 text-[0.95rem] text-muted">{line}</p> : null}
          <ul className="mt-4 flex flex-col gap-1.5 text-[0.9rem]">
            {includes.map((i) => (
              <li key={i} className="flex gap-2">
                <IconCheck size={16} className="mt-0.5 shrink-0 text-olive" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-5">
          <div>
            <p className="eyebrow text-olive-soft">Details</p>
            <p className="mt-2 text-[0.95rem]">
              {state.guests} guests · {state.date ? formatDateLong(state.date) : "date to be decided"} ·{" "}
              {areaLabel(state.area) ?? "place to be decided"}
            </p>
            <button type="button" onClick={() => go(detailsStep)} className="mt-1 text-[0.88rem] text-olive underline underline-offset-4">
              Edit details
            </button>
          </div>
          <div>
            <p className="eyebrow text-olive-soft">Extras</p>
            {extras.length ? (
              <ul className="mt-2 flex flex-col gap-1 text-[0.92rem]">
                {extras.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[0.92rem] text-muted">None yet.</p>
            )}
            <button type="button" onClick={() => go(customizeStep)} className="mt-1 text-[0.88rem] text-olive underline underline-offset-4">
              Edit selections
            </button>
          </div>
        </div>
      </div>

      {/* Phones see the breakdown here; desktop has it in the column alongside. */}
      {estimate ? (
        <div className="rounded-[1.5rem] border border-olive/25 bg-paper p-6 lg:hidden">
          <EstimateSummary estimate={estimate} title={estimateTitle} />
        </div>
      ) : null}

      <Notice tone="olive" title="What this is — and isn't">
        This is an estimate, not a booking or a final price. Your date isn&apos;t held until we confirm availability and you
        approve a written proposal; a {eventFees.retainerPercent}% nonrefundable retainer then reserves it. Anything marked
        &ldquo;Quoted&rdquo; is priced by us directly.
      </Notice>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={copy}>
          {shareLabel}
        </Button>
        <span className="text-[0.85rem] text-muted" aria-live="polite">
          {copied ? "Link copied — it opens this exact plan." : ""}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Request                                                             */
/* ------------------------------------------------------------------ */

const HEARD = ["Instagram", "Google search", "Our venue or planner", "A friend", "Cabin or rental company", "Other"];

export interface RequestContext {
  eventType: string;
  serviceInterest: string;
  planner: { journey: "weddings" | "events"; start?: "preset" | "custom"; preset?: string; occasion?: string; area?: string };
  submittedEvent: AnalyticsEvent;
}

/** Contact details and submission. Three required fields; the plan itself is sent with them. */
export function RequestStep({
  planner,
  context,
  success,
}: {
  planner: PlannerApi;
  context: RequestContext;
  /** Extra content under the confirmation (cross-sell). */
  success?: ReactNode;
}) {
  const id = useId();
  const { state, estimate } = planner;
  const [values, setValues] = useState({ name: "", email: "", phone: "", venue: "", message: "", heardAbout: "", website: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reference, setReference] = useState<string>();
  const doneRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof typeof values, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    const estimateInput = toEstimateState(state);
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      eventType: context.eventType,
      eventDate: state.date,
      eventLocation: [values.venue.trim(), areaLabel(state.area)].filter(Boolean).join(" · ") || "Not sure yet",
      estimatedGuests: state.guests,
      serviceInterest: context.serviceInterest,
      heardAbout: values.heardAbout || undefined,
      message: values.message.trim() || undefined,
      estimateInput: estimateInput ?? undefined,
      planner: context.planner,
      website: values.website,
    };
    const parsed = inquirySchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; reference?: string; fieldErrors?: FieldErrors };
      if (!res.ok || !body.ok) {
        if (body.fieldErrors) setErrors(body.fieldErrors);
        setStatus("error");
        return;
      }
      setReference(body.reference);
      setStatus("sent");
      track(context.submittedEvent, {
        journey: state.journey,
        start: context.planner.start,
        preset: context.planner.preset,
        option: state.optionId,
        guests: state.guests,
        estimated_total_band: estimate ? Math.round(estimate.total / 50000) * 500 : undefined,
      });
      requestAnimationFrame(() => doneRef.current?.focus());
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div ref={doneRef} tabIndex={-1} className="flex flex-col items-start gap-5 outline-none" role="status">
        <OliveSprig className="w-24 text-olive/70" />
        <h3 className="display-sm text-olive">Thank you — your request is in.</h3>
        {reference ? (
          <p className="text-[0.95rem] text-muted">
            Your reference is <strong className="text-espresso">{reference}</strong>.
          </p>
        ) : null}
        <ol className="flex flex-col gap-3 text-[0.95rem]">
          {[
            "We check your date and come back to you with availability.",
            "You get a written proposal with every fee itemized.",
            `When you're happy, a ${eventFees.retainerPercent}% nonrefundable retainer reserves the date.`,
          ].map((s, i) => (
            <li key={s} className="grid grid-cols-[1.75rem_1fr] gap-2">
              <span className="font-display text-[1.2rem] leading-none text-olive">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <p className="text-[0.9rem] text-muted">Nothing has been booked or charged.</p>
        {success}
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-6"
    >
      <p className="text-[0.95rem] text-muted">
        Your plan goes with this request — no need to repeat it. We only need a way to reach you.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField id={`${id}-name`} label="Name" required autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} error={errors.name} wrapperClassName="sm:col-span-2" />
        <TextField id={`${id}-email`} type="email" label="Email" required autoComplete="email" value={values.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
        <TextField id={`${id}-phone`} type="tel" label="Phone" required autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
        <TextField
          id={`${id}-venue`}
          label="Venue or address"
          optional
          hint={areaLabel(state.area) ? `We have the area: ${areaLabel(state.area)}.` : undefined}
          value={values.venue}
          onChange={(e) => set("venue", e.target.value)}
          error={errors.eventLocation}
          wrapperClassName="sm:col-span-2"
        />
        <TextAreaField
          id={`${id}-message`}
          label="Anything we should know?"
          optional
          hint="Allergies in the group, timing, the look you're going for."
          rows={4}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          error={errors.message}
          wrapperClassName="sm:col-span-2"
        />
        <SelectField id={`${id}-heard`} label="How did you hear about us?" optional value={values.heardAbout} onChange={(e) => set("heardAbout", e.target.value)}>
          <option value="">Choose one</option>
          {HEARD.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </SelectField>
      </div>
      {/* Honeypot: hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
      </div>
      {status === "error" ? (
        <Notice tone="fig" role="alert" title="That didn't send.">
          Please check the highlighted fields and try again. Your plan is saved in this page&apos;s link.
        </Notice>
      ) : null}
      {Object.keys(errors).some((k) => !["name", "email", "phone", "eventLocation", "message"].includes(k)) ? (
        <Notice tone="fig" role="alert" title="Part of the plan needs another look.">
          Go back a step and check the details, then try again.
        </Notice>
      ) : null}
      <div className="flex flex-col items-start gap-3">
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request my proposal"}
        </Button>
        <p className="text-[0.82rem] text-muted">
          We use your details only to reply about this event. Date availability is confirmed by us — nothing is booked yet.
        </p>
      </div>
    </form>
  );
}

export function CrossSell({ href, children }: { href: string; children: ReactNode }) {
  return (
    <ButtonLink href={href} variant="secondary">
      {children}
    </ButtonLink>
  );
}

