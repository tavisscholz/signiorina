"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";

import { OliveSprig } from "@/components/brand/OliveSprig";
import { EstimateSummary } from "@/components/events/EstimateSummary";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { getZone } from "@/config/delivery";
import { flags } from "@/config/flags";
import { grazingTables, weddingPackages } from "@/config/events";
import { track } from "@/lib/analytics";
import { businessNow } from "@/lib/dates";
import { fromEstimateParams, toEstimateParams } from "@/lib/estimate-params";
import { estimateEvent } from "@/lib/event-estimate";
import { useNow } from "@/lib/use-now";
import { inquirySchema, toFieldErrors, type FieldErrors } from "@/lib/validation";
import { routeLabels, routes } from "@/config/journeys";

export const EVENT_TYPES = [
  "Wedding",
  "Welcome party",
  "Rehearsal dinner",
  "Cocktail hour",
  "Bridal or baby shower",
  "Birthday or anniversary",
  "Family gathering or reunion",
  "Cabin weekend",
  "Corporate event",
  "Allergy question",
  "Other",
];

export const SERVICE_OPTIONS = [
  "Aperitivo Hour",
  "Gathering Table",
  "Hosted Table",
  "Private Grazing Table",
  "Wedding",
  "Corporate Event",
  "Other",
  "Not Sure Yet",
];

const BUDGETS = ["Under $1,000", "$1,000–$2,000", "$2,000–$3,500", "$3,500–$5,000", "$5,000+", "Not sure yet"];
const HEARD = ["Instagram", "Google search", "Our venue or planner", "A friend", "Cabin or rental company", "Other"];

function serviceFromParam(service: string | null): string {
  if (!service) return "";
  const pkg = weddingPackages.find((p) => p.id === service);
  if (pkg) return pkg.name.replace(/^The /, "");
  if (grazingTables.tiers.some((t) => t.id === service)) return "Private Grazing Table";
  return "";
}

function typeFromParam(type: string | null): string {
  switch (type) {
    case "wedding":
      return "Wedding";
    case "corporate":
      return "Corporate event";
    case "allergy":
      return "Allergy question";
    case "event":
      return "";
    default:
      return "";
  }
}

type Values = Record<string, string>;

export function InquiryForm() {
  const id = useId();
  const params = useSearchParams();
  // A full event estimate handed over from /weddings or /gatherings (package, guests, date, zone, options, add-ons).
  const estimateState = useMemo(() => fromEstimateParams(params), [params]);
  const now = useNow();
  const estimate = useMemo(
    () => (estimateState && now !== undefined ? estimateEvent({ ...estimateState, today: businessNow(new Date(now)).date }) : null),
    [estimateState, now],
  );
  const [values, setValues] = useState<Values>(() => ({
    name: "",
    email: "",
    phone: "",
    company: "",
    eventType: typeFromParam(params.get("type")),
    eventDate: params.get("date") ?? "",
    eventLocation: params.get("location") ?? "",
    estimatedGuests: params.get("guests") ?? "",
    serviceInterest: serviceFromParam(params.get("service")) || (params.get("type") === "corporate" ? "Corporate Event" : ""),
    budgetRange: "",
    heardAbout: "",
    message: "",
    website: "",
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reference, setReference] = useState<string>();
  const [started, setStarted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const set = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (!started) {
      setStarted(true);
      if (values.eventType === "Wedding" || (key === "eventType" && value === "Wedding")) {
        track("wedding_inquiry_started", { source: "form" });
      }
    }
  };

  const submit = async () => {
    const payload = {
      ...values,
      estimatedGuests: values.estimatedGuests ? Number(values.estimatedGuests) : undefined,
      eventDate: values.eventDate || undefined,
      company: values.company || undefined,
      budgetRange: values.budgetRange || undefined,
      heardAbout: values.heardAbout || undefined,
      // The server recomputes the estimate from these inputs; client totals aren't trusted.
      estimateInput: estimateState ?? undefined,
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
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrors(data.fieldErrors ?? {});
        setStatus("error");
        return;
      }
      setReference(data.reference);
      setStatus("sent");
      const isWedding = values.eventType === "Wedding" || ["Aperitivo Hour", "Gathering Table", "Hosted Table", "Wedding"].includes(values.serviceInterest);
      const isCorporate = values.eventType === "Corporate event" || values.serviceInterest === "Corporate Event";
      track(isWedding ? "wedding_inquiry_submitted" : isCorporate ? "corporate_inquiry_submitted" : "inquiry_submitted", {
        event_type: values.eventType,
        service: values.serviceInterest,
      });
      requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="flex flex-col items-center gap-5 rounded-[2rem] border border-olive/20 bg-paper px-6 py-16 text-center outline-none"
        role="status"
      >
        <OliveSprig className="w-24 text-olive/70" />
        <h2 className="display-md text-olive">It&apos;s on the table.</h2>
        <p className="max-w-md text-muted">
          Thank you, {values.name.split(" ")[0]}. We&apos;ll look at the date and come back with availability and a written
          quote. Your reference is <strong className="font-medium text-espresso">{reference}</strong>.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/weddings" variant="secondary">
            See wedding packages
          </ButtonLink>
          <ButtonLink href={routes.store}>{routeLabels.store}</ButtonLink>
        </div>
      </div>
    );
  }

  const field = (key: string) => ({
    id: `${id}-${key}`,
    value: values[key],
    error: errors[key],
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-8"
    >
      {estimateState ? (
        <section aria-labelledby={`${id}-estimate`} className="rounded-[1.5rem] border border-olive/25 bg-paper p-6 md:p-7">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id={`${id}-estimate`} className="eyebrow text-olive-soft">
              Your estimate is attached
            </h2>
            <Link
              href={
                flags.threeJourneyArchitectureV2
                  ? `${estimateState.kind === "wedding" ? "/weddings/build" : "/events/plan"}?${toEstimateParams(estimateState).toString()}&step=${estimateState.kind === "wedding" ? 3 : 2}`
                  : `/${estimateState.kind === "wedding" ? "weddings" : "gatherings"}?${toEstimateParams(estimateState).toString()}#estimate`
              }
              className="text-[0.88rem] text-olive underline underline-offset-4"
            >
              Edit estimate
            </Link>
          </div>
          {estimate ? <EstimateSummary estimate={estimate} /> : <div className="mt-4 h-40 animate-pulse rounded-xl bg-linen/70" />}
          {estimateState.zone && estimateState.zone !== "beyond" ? (
            <p className="mt-4 text-[0.85rem] text-muted">Priced for {getZone(estimateState.zone).label}.</p>
          ) : null}
          <p className="mt-3 text-[0.8rem] text-muted">
            We&apos;ll use this as the starting point for your written quote.
          </p>
        </section>
      ) : null}
      {values.eventType === "Allergy question" ? (
        <Notice tone="olive">
          Tell us about the allergy and what you&apos;d like to order. We&apos;ll be honest about what we can handle safely — our
          kitchen handles milk, wheat, tree nuts, peanuts, sesame, soy, eggs and fish on shared equipment.
        </Notice>
      ) : null}

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-[1.45rem] text-olive">About you</legend>
        <TextField {...field("name")} label="Name" required autoComplete="name" />
        <TextField {...field("email")} label="Email" type="email" required autoComplete="email" />
        <TextField {...field("phone")} label="Phone" type="tel" required autoComplete="tel" />
        <TextField {...field("company")} label="Company" optional autoComplete="organization" />
      </fieldset>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-[1.45rem] text-olive">About the occasion</legend>
        <SelectField {...field("eventType")} label="Event type" required>
          <option value="">Choose one</option>
          {EVENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </SelectField>
        <TextField {...field("eventDate")} label="Event date" type="date" optional hint="Approximate is fine." />
        <TextField
          {...field("eventLocation")}
          label="Event location"
          required
          hint="Venue, cabin or town — we serve the Smokies, not inside the national park."
          wrapperClassName="sm:col-span-2"
        />
        <TextField {...field("estimatedGuests")} label="Estimated guests" type="number" inputMode="numeric" min={1} optional />
        <SelectField {...field("serviceInterest")} label="Service interest" required>
          <option value="">Choose one</option>
          {SERVICE_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
        <SelectField {...field("budgetRange")} label="Budget range" optional>
          <option value="">Prefer not to say</option>
          {BUDGETS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </SelectField>
        <SelectField {...field("heardAbout")} label="How did you hear about us?" optional>
          <option value="">Choose one</option>
          {HEARD.map((h) => (
            <option key={h}>{h}</option>
          ))}
        </SelectField>
        <TextAreaField
          {...field("message")}
          label="Tell us about the occasion"
          required
          rows={5}
          hint="The feel you're after, timing, dietary needs, anything you're unsure about."
          wrapperClassName="sm:col-span-2"
        />
      </fieldset>

      {/* Honeypot for bots — visually hidden, skipped by assistive tech. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} />
      </div>

      {status === "error" ? (
        <Notice tone="fig" role="alert" title="That didn't send.">
          {Object.keys(errors).length ? "A few details need another look." : "Something went wrong on our side. Please try again in a moment."}
        </Notice>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.88rem] text-muted">
          Looking for boxes, lunch or cabin delivery?{" "}
          <Link href={routes.store} className="text-olive underline underline-offset-4">
            Order online
          </Link>
        </p>
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Start planning"}
        </Button>
      </div>
    </form>
  );
}
