"use client";

import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";

import { EstimateSummary } from "@/components/events/EstimateSummary";
import { Button } from "@/components/ui/Button";
import { Checkbox, Fieldset, SelectField, TextField } from "@/components/ui/Field";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { addOns } from "@/config/catalog";
import { beyondZoneC, zones } from "@/config/delivery";
import { eventFees, grazingTables, weddingPackages, weddingRules } from "@/config/events";
import { track } from "@/lib/analytics";
import { businessNow } from "@/lib/dates";
import { fromEstimateParams, toEstimateParams, type EstimateState } from "@/lib/estimate-params";
import { estimateEvent, type EventKind, type PickupChoice } from "@/lib/event-estimate";
import { formatDollars } from "@/lib/money";
import type { ZoneId } from "@/lib/types";
import { useNow } from "@/lib/use-now";

const EVENT_ADD_ONS = addOns.filter((a) => a.scope.includes("event") && a.priceUnit === "each" && ["burrata-focaccia", "dolce-board", "panini-tray"].includes(a.id));

/**
 * Transparent event estimate: pick a package, guest count, date and area to see the
 * itemized cost, minimums, fees and retainer — then carry it into the inquiry.
 */
export function EventEstimator({
  kind,
  defaultOption,
  initial,
}: {
  kind: EventKind;
  defaultOption?: string;
  /** Restored state (e.g. "Edit estimate" from the inquiry form). Ignored if it's for the other estimator. */
  initial?: EstimateState | null;
}) {
  const id = useId();
  const router = useRouter();
  const options = kind === "wedding" ? weddingPackages.map((p) => ({ id: p.id, name: p.name, price: p.pricePerPerson })) : grazingTables.tiers.map((t) => ({ id: t.id, name: t.name, price: t.pricePerPerson }));
  const start = initial?.kind === kind ? initial : undefined;
  const [optionId, setOptionId] = useState(start?.optionId ?? defaultOption ?? options[1].id);
  const [guests, setGuests] = useState(start?.guests ?? (kind === "wedding" ? 60 : 30));
  const [date, setDate] = useState(start?.date ?? "");
  const [zone, setZone] = useState<ZoneId | "beyond" | "">(start?.zone ?? "");
  const [dopUpgrade, setDop] = useState(start?.dopUpgrade ?? false);
  const [glutenConscious, setGluten] = useState(start?.glutenConscious ?? false);
  const [attendantHours, setAttendantHours] = useState(start?.attendantHours ?? 0);
  const [pickup, setPickup] = useState<PickupChoice>(start?.pickup ?? "next-day");
  const [rental, setRental] = useState(start?.servingPieceRental ?? false);
  const [bundle, setBundle] = useState(start?.bundle ?? false);
  const [extra, setExtra] = useState<Record<string, number>>(
    Object.fromEntries((start?.addOns ?? []).map((a) => [a.id, a.quantity])),
  );
  const now = useNow();
  const today = now === undefined ? undefined : businessNow(new Date(now)).date;
  const tracked = useRef(false);

  const pkg = weddingPackages.find((p) => p.id === optionId);
  const estimate = useMemo(
    () =>
      today
        ? estimateEvent({
            kind,
            optionId,
            guests,
            date: date || undefined,
            zone: zone || undefined,
            today,
            dopUpgrade,
            glutenConscious,
            attendantHours,
            pickup,
            servingPieceRental: rental,
            bundle,
            addOns: Object.entries(extra).map(([addOnId, quantity]) => ({ id: addOnId, quantity })),
          })
        : null,
    [kind, optionId, guests, date, zone, today, dopUpgrade, glutenConscious, attendantHours, pickup, rental, bundle, extra],
  );

  const touch = () => {
    if (tracked.current) return;
    tracked.current = true;
    track("event_estimate_used", { kind });
  };

  const startPlanning = () => {
    if (!estimate) return;
    // The whole estimate travels in the URL: package, guests, date, zone, options, pickup, attendant hours and add-ons.
    const params = toEstimateParams({
      kind,
      optionId,
      guests,
      date: date || undefined,
      zone: zone || undefined,
      dopUpgrade,
      glutenConscious,
      attendantHours,
      pickup,
      servingPieceRental: rental,
      bundle,
      addOns: Object.entries(extra).map(([addOnId, quantity]) => ({ id: addOnId, quantity })),
    });
    if (kind === "wedding") track("wedding_inquiry_started", { source: "estimator", option: optionId });
    router.push(`/inquire?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12" onChange={touch} onClick={touch}>
      <div className="flex min-w-0 flex-col gap-7 lg:col-span-7">
        <Fieldset legend={kind === "wedding" ? "Package" : "Portion"}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {options.map((o) => {
              const checked = o.id === optionId;
              return (
                <label
                  key={o.id}
                  className={clsx(
                    "flex cursor-pointer flex-col rounded-2xl border px-4 py-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fig",
                    checked ? "border-olive bg-olive text-cream" : "border-line-strong hover:border-olive/60",
                  )}
                >
                  <input type="radio" name={`${id}-option`} className="sr-only" checked={checked} onChange={() => setOptionId(o.id)} />
                  <span className="font-display text-[1.15rem] leading-tight">{o.name}</span>
                  <span className={clsx("text-[0.88rem]", checked ? "text-cream/80" : "text-muted")}>{formatDollars(o.price)} / guest</span>
                </label>
              );
            })}
          </div>
        </Fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <QuantitySelector value={guests} onChange={setGuests} min={1} max={400} label="Guests" showLabel size="lg" />
          <TextField
            id={`${id}-date`}
            type="date"
            label="Event date"
            optional
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
          />
          <SelectField
            id={`${id}-zone`}
            label="Where you're gathering"
            value={zone}
            onChange={(e) => setZone(e.target.value as ZoneId | "beyond" | "")}
            wrapperClassName="sm:col-span-2"
          >
            <option value="">Not sure yet</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label}: {z.description}
              </option>
            ))}
            <option value="beyond">Farther afield (travel quoted at {formatDollars(beyondZoneC.perMileRoundTrip)}/mile beyond Zone C)</option>
          </SelectField>
        </div>

        <Fieldset legend="Options">
          <div className="grid gap-4 sm:grid-cols-2">
            <Checkbox id={`${id}-dop`} label={`DOP upgrade · +${formatDollars(eventFees.perPerson.dopUpgrade)}/guest`} description="Prosciutto di Parma + aged Parmigiano." checked={dopUpgrade} onChange={(e) => setDop(e.target.checked)} />
            <Checkbox id={`${id}-gluten`} label={`Gluten-conscious · +${formatDollars(eventFees.perPerson.glutenConscious)}/guest`} description="GF crackers packed separately." checked={glutenConscious} onChange={(e) => setGluten(e.target.checked)} />
            {kind === "wedding" ? (
              <Checkbox
                id={`${id}-bundle`}
                label={`${weddingRules.bundle.name} · ${weddingRules.bundle.foodDiscountPercent}% off food`}
                description="Booking two or more Signiorina events the same weekend."
                checked={bundle}
                onChange={(e) => setBundle(e.target.checked)}
              />
            ) : (
              <Checkbox
                id={`${id}-rental`}
                label={`Serving-piece rental · ${formatDollars(eventFees.servingPieceRental)}`}
                description="Our boards, stands + risers instead of disposable trays."
                checked={rental}
                onChange={(e) => setRental(e.target.checked)}
              />
            )}
          </div>
        </Fieldset>

        {pkg?.pieceReturn === "fee" ? (
          <Fieldset legend="Serving-piece pickup">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["next-day", `Next day · ${formatDollars(eventFees.pickup.nextDay)}`],
                  ["same-night", `Same-night teardown · ${formatDollars(eventFees.pickup.sameNight)}`],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className={clsx(
                    "cursor-pointer rounded-xl border px-4 py-2.5 text-[0.92rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fig",
                    pickup === value ? "border-olive bg-olive text-cream" : "border-line-strong",
                  )}
                >
                  <input type="radio" className="sr-only" name={`${id}-pickup`} checked={pickup === value} onChange={() => setPickup(value)} />
                  {label}
                </label>
              ))}
            </div>
          </Fieldset>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <QuantitySelector
              value={attendantHours}
              onChange={setAttendantHours}
              min={0}
              max={10}
              label={`Extra attendant hours · ${formatDollars(eventFees.attendant.hourly)}/hr`}
              showLabel
            />
            <p className="mt-1.5 text-[0.82rem] text-muted">{eventFees.attendant.minimumHours}-hour minimum when added.</p>
          </div>
        </div>

        <Fieldset legend="Add to the table">
          <ul className="grid gap-3 sm:grid-cols-3">
            {EVENT_ADD_ONS.map((a) => (
              <li key={a.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-paper p-3">
                <span className="text-[0.92rem]">
                  {a.name} <span className="text-muted">· {formatDollars(a.price)}</span>
                </span>
                <QuantitySelector
                  value={extra[a.id] ?? 0}
                  min={0}
                  max={10}
                  label="Quantity"
                  itemName={a.name}
                  onChange={(q) => setExtra((e) => ({ ...e, [a.id]: q }))}
                />
              </li>
            ))}
          </ul>
        </Fieldset>
      </div>

      <div className="lg:col-span-5">
        <div className="rounded-[1.75rem] border border-olive/25 bg-paper p-6 shadow-[var(--shadow-card)] md:p-8 lg:sticky lg:top-32" aria-live="polite">
          <p className="eyebrow text-olive-soft">Your estimate</p>
          {estimate ? (
            <>
              <EstimateSummary estimate={estimate} />
              <Button size="lg" className="mt-6 w-full" onClick={startPlanning}>
                Start planning with this estimate
              </Button>
              <p className="mt-3 text-[0.78rem] text-muted">
                An estimate, not a quote — we confirm availability and send a written quote. No service charge, no mandatory
                gratuity.
              </p>
            </>
          ) : (
            <div className="mt-4 h-64 animate-pulse rounded-xl bg-linen/70" />
          )}
        </div>
      </div>
    </div>
  );
}

/** Estimator that restores its state from the URL (used for "Edit estimate" links). Render inside <Suspense>. */
export function EventEstimatorFromUrl({ kind }: { kind: EventKind }) {
  const params = useSearchParams();
  const initial = useMemo(() => fromEstimateParams(params), [params]);
  return <EventEstimator kind={kind} initial={initial} key={params.toString()} />;
}
