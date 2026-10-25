"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { DeliveryDatePicker } from "@/components/checkout/DeliveryDatePicker";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, Fieldset, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { IconCheck, IconInfo, IconPin } from "@/components/ui/Icons";
import { Notice } from "@/components/ui/Notice";
import { getProduct } from "@/config/catalog";
import { deliveryAreas, deliveryWindows, getArea, scheduling, servedZones, zones } from "@/config/delivery";
import { track } from "@/lib/analytics";
import { isBookable, type DayAvailability } from "@/lib/availability";
import { useCart } from "@/lib/cart-store";
import { formatDateLong, formatDateShort } from "@/lib/dates";
import { routeDayNames, zoneFeeSummary } from "@/lib/delivery-fees";
import { formatCents, formatDollars } from "@/lib/money";
import type { CartPricing } from "@/lib/pricing";
import type { CabinDetails, DeliverySelection, LocationType } from "@/lib/types";
import { cabinHandoffConfig, cartHasPerishables, validateDeliveryAddress, type FieldErrors } from "@/lib/validation";

const OUTSIDE = "__outside";

const LOCATION_TYPES: Array<{ id: LocationType; label: string }> = [
  { id: "home", label: "Home" },
  { id: "cabin", label: "Cabin or vacation rental" },
  { id: "office", label: "Office" },
  { id: "venue", label: "Event venue" },
  { id: "hotel", label: "Hotel or resort" },
  { id: "other", label: "Somewhere else" },
];

/* ------------------------------------------------------------------ */
/* Step 2 — Address                                                     */
/* ------------------------------------------------------------------ */

function AddressStep({
  delivery,
  set,
  errors,
  perishable,
  merchandiseSubtotal,
}: {
  delivery: DeliverySelection;
  set: (patch: Partial<DeliverySelection>) => void;
  errors: FieldErrors;
  perishable: boolean;
  merchandiseSubtotal: number;
}) {
  const id = useId();
  const [outside, setOutside] = useState(false);
  const area = delivery.areaId ? getArea(delivery.areaId) : undefined;
  const address = delivery.address ?? { line1: "", city: "", state: "TN", zip: "" };
  const cabin = delivery.cabin ?? {};
  const setAddress = (patch: Partial<typeof address>) => set({ address: { ...address, ...patch } });
  const setCabin = (patch: Partial<CabinDetails>) => set({ cabin: { ...cabin, ...patch } });

  return (
    <div className="flex flex-col gap-7">
      <SelectField
        id={`${id}-area`}
        label="Delivery area"
        hint="Fees are set by area and shown before you pay."
        required
        value={outside ? OUTSIDE : (delivery.areaId ?? "")}
        error={errors.areaId}
        onChange={(e) => {
          const value = e.target.value;
          if (value === OUTSIDE) {
            setOutside(true);
            set({ areaId: undefined, date: undefined, windowId: undefined });
            return;
          }
          setOutside(false);
          const next = getArea(value);
          set({
            areaId: value || undefined,
            date: undefined,
            windowId: undefined,
            address: { ...address, city: next?.city ?? address.city, state: "TN" },
            locationType: delivery.locationType ?? (next?.cabinCountry ? "cabin" : undefined),
          });
          if (next) track("delivery_zone_validated", { zone: next.zone, area: next.id });
        }}
      >
        <option value="">Choose your area</option>
        {servedZones.map((z) => (
          <optgroup key={z.id} label={`${z.label} · ${formatDollars(z.fee)}${z.freeDeliveryAt ? `, free over ${formatDollars(z.freeDeliveryAt)}` : ""}`}>
            {deliveryAreas
              .filter((a) => a.zone === z.id)
              .map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
          </optgroup>
        ))}
        <option value={OUTSIDE}>Somewhere else</option>
      </SelectField>

      {outside ? (
        <Notice
          tone="fig"
          role="status"
          title="Looks like this one is outside our usual route."
          action={
            <ButtonLink href="/inquire?type=event" variant="secondary" size="sm">
              Ask about an event
            </ButtonLink>
          }
        >
          Online delivery covers Sevier County and a few neighbors. For events farther out we travel by quote —
          tell us where you&apos;re gathering. (We don&apos;t deliver inside the national park.)
        </Notice>
      ) : null}

      {area ? (
        <div className="animate-rise flex items-start gap-3 rounded-2xl border border-olive/25 bg-olive/[0.05] px-5 py-4" role="status">
          <IconPin size={20} className="mt-0.5 shrink-0 text-olive" />
          <div>
            <p className="font-medium text-olive">
              {area.name} is in {zones.find((z) => z.id === area.zone)!.label}.
            </p>
            <p className="text-[0.9rem] text-muted">{zoneFeeSummary(area.zone)}.</p>
            {(() => {
              const zone = zones.find((z) => z.id === area.zone)!;
              if (!zone.routeDays || !zone.offRouteMinimumSubtotal || merchandiseSubtotal >= zone.offRouteMinimumSubtotal * 100) return null;
              const windows = zone.routeDays.windows.map((w) => deliveryWindows.find((d) => d.id === w)!.label.toLowerCase());
              return (
                <p className="mt-1 text-[0.9rem] text-muted">
                  Orders under {formatDollars(zone.offRouteMinimumSubtotal)} travel on our {routeDayNames(zone.id)} route, in the{" "}
                  {windows.join(" or ")} window.
                </p>
              );
            })()}
          </div>
        </div>
      ) : null}

      {area ? (
        <>
          <Fieldset legend="What kind of place is it?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LOCATION_TYPES.map((t) => {
                const checked = delivery.locationType === t.id;
                return (
                  <label
                    key={t.id}
                    className={clsx(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-[0.92rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fig",
                      checked ? "border-olive bg-olive text-cream" : "border-line-strong hover:border-olive/60",
                    )}
                  >
                    <input
                      type="radio"
                      name={`${id}-location`}
                      className="sr-only"
                      checked={checked}
                      onChange={() => set({ locationType: t.id, isBusiness: t.id === "office" ? true : delivery.isBusiness })}
                    />
                    {checked ? <IconCheck size={16} /> : null}
                    {t.label}
                  </label>
                );
              })}
            </div>
            {errors.locationType ? (
              <p className="mt-2 text-[0.88rem] font-medium text-fig" role="alert">
                {errors.locationType}
              </p>
            ) : null}
          </Fieldset>

          {delivery.locationType === "office" || delivery.locationType === "venue" || delivery.locationType === "hotel" ? (
            <TextField
              id={`${id}-company`}
              label={delivery.locationType === "office" ? "Company" : "Venue or property name"}
              optional
              value={delivery.company ?? ""}
              onChange={(e) => set({ company: e.target.value })}
            />
          ) : null}

          <div className="grid gap-5 sm:grid-cols-6">
            <TextField
              id={`${id}-line1`}
              label="Street address"
              required
              autoComplete="address-line1"
              value={address.line1}
              error={errors["address.line1"]}
              onChange={(e) => setAddress({ line1: e.target.value })}
              wrapperClassName="sm:col-span-6"
            />
            <TextField
              id={`${id}-line2`}
              label="Apartment, cabin or suite"
              optional
              autoComplete="address-line2"
              value={address.line2 ?? ""}
              onChange={(e) => setAddress({ line2: e.target.value })}
              wrapperClassName="sm:col-span-6"
            />
            <TextField
              id={`${id}-city`}
              label="City"
              required
              autoComplete="address-level2"
              value={address.city}
              error={errors["address.city"]}
              onChange={(e) => setAddress({ city: e.target.value })}
              wrapperClassName="sm:col-span-3"
            />
            <SelectField id={`${id}-state`} label="State" value="TN" onChange={() => undefined} wrapperClassName="sm:col-span-1">
              <option value="TN">TN</option>
            </SelectField>
            <TextField
              id={`${id}-zip`}
              label="ZIP"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              value={address.zip}
              error={errors["address.zip"]}
              onChange={(e) => setAddress({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
              wrapperClassName="sm:col-span-2"
            />
          </div>

          {delivery.locationType === "office" ? (
            <Checkbox
              id={`${id}-business`}
              label="This is a business order"
              description={(() => {
                const route = zones.find((z) => z.routeDays)?.routeDays;
                return route
                  ? `Corporate orders on ${routeDayNames()} route days ship free over ${formatDollars(route.corporateFreeDeliveryAt)}.`
                  : undefined;
              })()}
              checked={Boolean(delivery.isBusiness)}
              onChange={(e) => set({ isBusiness: e.target.checked })}
            />
          ) : null}

          {delivery.locationType === "cabin" ? (
            <div className="flex flex-col gap-6 rounded-[1.5rem] border border-line bg-paper p-5 sm:p-6">
              <div>
                <h3 className="display-sm text-olive">Getting to the cabin</h3>
                <p className="mt-1 text-[0.9rem] text-muted">Mountain roads have opinions. A few details help us arrive on time.</p>
              </div>
              <TextAreaField
                id={`${id}-road`}
                label="Road-access notes"
                optional
                hint="Turns the map misses, where to park, which door to use."
                value={cabin.roadAccessNotes ?? ""}
                onChange={(e) => setCabin({ roadAccessNotes: e.target.value })}
                rows={3}
              />
              <TextField
                id={`${id}-gate`}
                label="Gate code"
                optional
                value={cabin.gateCode ?? ""}
                onChange={(e) => setCabin({ gateCode: e.target.value })}
              />
              <Fieldset legend="Is the driveway steep or gravel?">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["standard", "No — standard driveway"],
                      ["steep-or-gravel", "Yes — steep or gravel"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className={clsx(
                        "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-[0.92rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fig",
                        cabin.driveway === value ? "border-olive bg-olive text-cream" : "border-line-strong",
                      )}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={`${id}-driveway`}
                        checked={cabin.driveway === value}
                        onChange={() => setCabin({ driveway: value, drivewayConfirmed: value === "standard" ? undefined : cabin.drivewayConfirmed })}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {errors["cabin.driveway"] ? (
                  <p className="mt-2 text-[0.88rem] font-medium text-fig" role="alert">
                    {errors["cabin.driveway"]}
                  </p>
                ) : null}
              </Fieldset>
              {cabin.driveway === "steep-or-gravel" ? (
                <div>
                  <Checkbox
                    id={`${id}-driveway-ok`}
                    label="I confirm a standard car can reach the door, or I've noted above where to meet the driver."
                    checked={Boolean(cabin.drivewayConfirmed)}
                    onChange={(e) => setCabin({ drivewayConfirmed: e.target.checked })}
                  />
                  {errors["cabin.drivewayConfirmed"] ? (
                    <p className="mt-2 text-[0.88rem] font-medium text-fig" role="alert">
                      {errors["cabin.drivewayConfirmed"]}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id={`${id}-pc-name`}
                  label="Property contact"
                  optional
                  hint="Host or rental company, if we need them."
                  value={cabin.propertyContactName ?? ""}
                  onChange={(e) => setCabin({ propertyContactName: e.target.value })}
                />
                <TextField
                  id={`${id}-pc-phone`}
                  label="Property contact phone"
                  optional
                  type="tel"
                  value={cabin.propertyContactPhone ?? ""}
                  onChange={(e) => setCabin({ propertyContactPhone: e.target.value })}
                />
              </div>

              {perishable ? (
                <Fieldset
                  legend="How should we deliver to your cabin?"
                  hint="Your order includes fresh food. We never leave perishables outside or in an empty cabin without an authorized fridge handoff."
                >
                  <div className="flex flex-col gap-2">
                    {(
                      [
                        ["guest-present", "Someone will be there to receive the order."],
                        ...(cabinHandoffConfig.propertyManagerAccessEnabled
                          ? ([["property-manager", "The property manager has authorized refrigerator access."]] as const)
                          : []),
                      ] as Array<readonly [CabinDetails["handoff"], string]>
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className={clsx(
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 text-[0.95rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fig",
                          cabin.handoff === value ? "border-olive bg-olive/[0.06]" : "border-line-strong",
                        )}
                      >
                        <input
                          type="radio"
                          name={`${id}-handoff`}
                          checked={cabin.handoff === value}
                          onChange={() => setCabin({ handoff: value })}
                          className="mt-1 accent-[var(--color-olive)]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  {errors["cabin.handoff"] ? (
                    <p className="mt-2 text-[0.88rem] font-medium text-fig" role="alert">
                      {errors["cabin.handoff"]}
                    </p>
                  ) : null}
                </Fieldset>
              ) : null}

              {perishable && cabin.handoff === "property-manager" ? (
                <div className="grid gap-5 rounded-2xl border border-olive/20 bg-cream p-5 sm:grid-cols-2">
                  <TextField
                    id={`${id}-pm-co`}
                    label="Property manager or company"
                    required
                    value={cabin.propertyManagerCompany ?? ""}
                    error={errors["cabin.propertyManagerCompany"]}
                    onChange={(e) => setCabin({ propertyManagerCompany: e.target.value })}
                    wrapperClassName="sm:col-span-2"
                  />
                  <TextField
                    id={`${id}-pm-contact`}
                    label="Contact name"
                    required
                    value={cabin.propertyManagerContact ?? ""}
                    error={errors["cabin.propertyManagerContact"]}
                    onChange={(e) => setCabin({ propertyManagerContact: e.target.value })}
                  />
                  <TextField
                    id={`${id}-pm-phone`}
                    label="Contact phone"
                    required
                    type="tel"
                    value={cabin.propertyManagerPhone ?? ""}
                    error={errors["cabin.propertyManagerPhone"]}
                    onChange={(e) => setCabin({ propertyManagerPhone: e.target.value })}
                  />
                  <TextField
                    id={`${id}-pm-unit`}
                    label="Cabin name or unit"
                    required
                    value={cabin.unitInfo ?? ""}
                    error={errors["cabin.unitInfo"]}
                    onChange={(e) => setCabin({ unitInfo: e.target.value })}
                    wrapperClassName="sm:col-span-2"
                  />
                  <TextAreaField
                    id={`${id}-pm-auth`}
                    label="Authorization + access instructions"
                    required
                    hint="Who authorized fridge access, and how we get in (lockbox, door code, meeting the manager)."
                    value={cabin.authorizationNotes ?? ""}
                    error={errors["cabin.authorizationNotes"]}
                    onChange={(e) => setCabin({ authorizationNotes: e.target.value })}
                    rows={3}
                    wrapperClassName="sm:col-span-2"
                  />
                  <p className="text-[0.85rem] text-muted sm:col-span-2">
                    We&apos;ll confirm the handoff with the property manager before delivery day.
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Window                                                      */
/* ------------------------------------------------------------------ */

function WindowSelector({
  day,
  selected,
  onSelect,
}: {
  day: DayAvailability;
  selected?: string;
  onSelect: (id: DayAvailability["windows"][number]["id"]) => void;
}) {
  const id = useId();
  const selectedWindow = day.windows.find((w) => w.id === selected);
  const soldOutSelected = selectedWindow && !isBookable(selectedWindow.status);
  return (
    <fieldset>
      <legend className="sr-only">Delivery window for {formatDateLong(day.date)}</legend>
      {soldOutSelected ? (
        <Notice tone="fig" role="alert" title="That window filled up." className="mb-4">
          Here&apos;s what&apos;s still open on {formatDateLong(day.date)}.
        </Notice>
      ) : null}
      <div className="grid gap-3">
        {deliveryWindows.map((w) => {
          const status = day.windows.find((x) => x.id === w.id)!;
          const bookable = isBookable(status.status);
          const checked = selected === w.id && bookable;
          return (
            <label
              key={w.id}
              className={clsx(
                "relative flex items-center gap-4 rounded-2xl border p-4 transition-colors sm:p-5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fig",
                bookable ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                checked ? "border-olive bg-olive/[0.06]" : "border-line-strong",
                bookable && !checked && "hover:border-olive/60",
              )}
            >
              <input
                type="radio"
                name={`${id}-window`}
                value={w.id}
                disabled={!bookable}
                checked={checked}
                onChange={() => onSelect(w.id)}
                className="size-5 shrink-0 accent-[var(--color-olive)]"
                aria-describedby={`${id}-${w.id}-desc`}
              />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-[1.3rem] text-olive">{w.label}</span>
                  <span className="tabular text-[0.95rem]">{w.display}</span>
                </p>
                <p id={`${id}-${w.id}-desc`} className="mt-0.5 text-[0.86rem] text-muted">
                  {bookable ? w.uses.join(" · ") : status.reason}
                  {status.status === "few-left" ? <span className="ml-2 font-medium text-fig">Few left</span> : null}
                </p>
              </div>
              <div className="text-right">
                {bookable ? (
                  <p className="tabular text-[0.95rem]">{status.fee === 0 ? "Free delivery" : formatCents(status.fee)}</p>
                ) : (
                  <p className="label-caps text-[0.62rem] text-muted">
                    {status.status === "sold-out" || status.status === "event-blocked" ? "Sold out" : "Unavailable"}
                  </p>
                )}
                {status.routeStop && bookable ? <p className="text-[0.75rem] text-olive">Route day</p> : null}
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Orchestrator                                                         */
/* ------------------------------------------------------------------ */

type AvailabilityState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; days: DayAvailability[] }
  | { status: "error"; message: string };

function SchedulerBody({ pricing }: { pricing: CartPricing }) {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const delivery = useCart((s) => s.delivery);
  const setDelivery = useCart((s) => s.setDelivery);
  const perishable = cartHasPerishables(lines);
  const [errors, setErrors] = useState<FieldErrors>({});
  const initiallyValid = useMemo(() => Object.keys(validateDeliveryAddress(delivery, lines)).length === 0, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [addressConfirmed, setAddressConfirmed] = useState(initiallyValid);
  const [result, setResult] = useState<{ key: string; days?: DayAvailability[]; error?: string }>();
  const [attempt, setAttempt] = useState(0);
  const [inspected, setInspected] = useState<DayAvailability>();
  const dateRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const area = delivery.areaId ? getArea(delivery.areaId) : undefined;

  const set = (patch: Partial<DeliverySelection>) => setDelivery(patch);

  // The calendar is keyed by everything that changes availability; a new key fetches fresh dates.
  const requestKey =
    addressConfirmed && delivery.areaId
      ? JSON.stringify([delivery.areaId, Boolean(delivery.isBusiness), lines.map((l) => [l.productId, l.quantity, l.addOns, l.dietary]), attempt])
      : null;

  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines, areaId: delivery.areaId, isBusiness: Boolean(delivery.isBusiness) }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error("unavailable");
        if (!cancelled) setResult({ key: requestKey, days: data.days });
      } catch {
        if (!cancelled) {
          setResult({ key: requestKey, error: "We couldn't load the delivery calendar. Check your connection and try again." });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const availability: AvailabilityState = !requestKey
    ? { status: "idle" }
    : result?.key !== requestKey
      ? { status: "loading" }
      : result.error
        ? { status: "error", message: result.error }
        : { status: "ready", days: result.days ?? [] };
  const load = () => setAttempt((a) => a + 1);

  const days = availability.status === "ready" ? availability.days : [];
  const chosenDay = days.find((d) => d.date === delivery.date);
  // A previously chosen date that's no longer bookable is treated as unselected, with a message.
  const staleDate = availability.status === "ready" && delivery.date && (!chosenDay || !isBookable(chosenDay.status)) ? delivery.date : undefined;
  const selectedDay = staleDate ? undefined : chosenDay;
  const staleNotice = staleDate
    ? `${formatDateLong(staleDate)} is no longer available for this order — please choose another date.`
    : undefined;

  const confirmAddress = () => {
    const errs = validateDeliveryAddress(delivery, lines);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => {
        const field = document.querySelector<HTMLElement>("[aria-invalid='true']");
        if (field) field.focus();
        else document.querySelector("[role='alert']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setAddressConfirmed(true);
    requestAnimationFrame(() => dateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const selectDate = (date: string) => {
    setInspected(undefined);
    const day = days.find((d) => d.date === date)!;
    const keepWindow = delivery.windowId && isBookable(day.windows.find((w) => w.id === delivery.windowId)!.status);
    const onlyWindow = day.windows.filter((w) => isBookable(w.status));
    setDelivery({ date, windowId: keepWindow ? delivery.windowId : onlyWindow.length === 1 ? onlyWindow[0].id : undefined });
    track("select_delivery_date", { date, zone: area?.zone, rush: day.rush });
    requestAnimationFrame(() => windowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const suggestions = (from?: string) =>
    days.filter((d) => isBookable(d.status) && (!from || d.date > from)).slice(0, 3);

  const canContinue = Boolean(
    addressConfirmed && selectedDay && isBookable(selectedDay.status) && delivery.windowId &&
      isBookable(selectedDay.windows.find((w) => w.id === delivery.windowId)!.status) && pricing.canCheckout,
  );

  const offRouteIssue = pricing.issues.find((i) => i.code === "off-route-minimum");

  return (
    <div className="flex flex-col gap-12">
      {/* STEP 2 */}
      <section aria-labelledby="step-address">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="step-address" className="flex items-center gap-3 font-display text-[1.6rem] text-olive">
            <span className="grid size-8 place-items-center rounded-full bg-olive text-[0.85rem] text-cream">2</span>
            Where are we delivering?
          </h2>
          {addressConfirmed ? (
            <button type="button" className="text-[0.9rem] text-olive underline underline-offset-4" onClick={() => setAddressConfirmed(false)}>
              Edit
            </button>
          ) : null}
        </div>
        {addressConfirmed && area && delivery.address ? (
          <div className="rounded-2xl border border-line bg-paper px-5 py-4 text-[0.95rem]">
            <p className="font-medium">
              {delivery.address.line1}
              {delivery.address.line2 ? `, ${delivery.address.line2}` : ""}
            </p>
            <p className="text-muted">
              {delivery.address.city}, TN {delivery.address.zip} · {area.name} · Zone {area.zone}
              {delivery.locationType === "cabin" && delivery.cabin?.handoff
                ? ` · ${delivery.cabin.handoff === "guest-present" ? "Guest will receive" : "Property-manager fridge handoff"}`
                : ""}
            </p>
          </div>
        ) : (
          <>
            <AddressStep
              delivery={delivery}
              set={set}
              errors={errors}
              perishable={perishable}
              merchandiseSubtotal={pricing.merchandiseSubtotal}
            />
            {area ? (
              <Button size="lg" className="mt-8" onClick={confirmAddress}>
                Continue to date
              </Button>
            ) : null}
          </>
        )}
      </section>

      {/* STEP 3 */}
      <section aria-labelledby="step-date" ref={dateRef} className={clsx(!addressConfirmed && "opacity-50")}>
        <h2 id="step-date" className="mb-6 flex items-center gap-3 font-display text-[1.6rem] text-olive">
          <span className={clsx("grid size-8 place-items-center rounded-full text-[0.85rem]", addressConfirmed ? "bg-olive text-cream" : "border border-line-strong")}>
            3
          </span>
          Choose a date
        </h2>
        {!addressConfirmed ? (
          <p className="text-[0.95rem] text-muted">Add your address to see available dates.</p>
        ) : availability.status === "loading" || availability.status === "idle" ? (
          <div className="h-80 animate-pulse rounded-[1.5rem] bg-linen/70" aria-busy="true" aria-label="Loading available dates" />
        ) : availability.status === "error" ? (
          <Notice tone="fig" role="alert" title="The calendar didn't load." action={<Button size="sm" variant="secondary" onClick={load}>Try again</Button>}>
            {availability.message}
          </Notice>
        ) : (
          <div className="flex flex-col gap-5">
            {staleNotice ? (
              <Notice tone="fig" role="alert">
                {staleNotice}
              </Notice>
            ) : null}
            {suggestions().length > 0 && !selectedDay ? (
              <div className="flex flex-wrap items-center gap-2 text-[0.9rem]">
                <span className="text-muted">Next available:</span>
                {suggestions().map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => selectDate(d.date)}
                    className="rounded-full border border-olive/40 px-3 py-1.5 text-olive hover:bg-olive hover:text-cream"
                  >
                    {formatDateShort(d.date)}
                  </button>
                ))}
              </div>
            ) : null}
            <DeliveryDatePicker days={days} selected={delivery.date} onSelect={selectDate} onInspect={setInspected} />
            <div aria-live="polite">
              {inspected ? <InspectPanel day={inspected} suggestions={suggestions(inspected.date)} onPick={selectDate} /> : null}
            </div>
          </div>
        )}
      </section>

      {/* STEP 4 */}
      <section aria-labelledby="step-window" ref={windowRef} className={clsx(!selectedDay && "opacity-50")}>
        <h2 id="step-window" className="mb-6 flex items-center gap-3 font-display text-[1.6rem] text-olive">
          <span className={clsx("grid size-8 place-items-center rounded-full text-[0.85rem]", selectedDay ? "bg-olive text-cream" : "border border-line-strong")}>
            4
          </span>
          Choose a delivery window
        </h2>
        {selectedDay ? (
          <div className="flex flex-col gap-4">
            <p className="text-[0.95rem] text-muted">{formatDateLong(selectedDay.date)}</p>
            {selectedDay.rush ? (
              <Notice tone="pistachio">
                This date is inside our usual notice. There&apos;s room in the schedule, so we can rush it for{" "}
                {formatDollars(scheduling.rush.fee)}.
              </Notice>
            ) : null}
            {selectedDay.holiday ? (
              <Notice tone="pistachio">
                {selectedDay.holiday.name} preorder — quantities are limited and a {formatCents(selectedDay.holiday.fee)} holiday fee applies.
              </Notice>
            ) : null}
            <WindowSelector
              day={selectedDay}
              selected={delivery.windowId}
              onSelect={(windowId) => {
                setDelivery({ windowId });
                track("select_delivery_window", { window: windowId, zone: area?.zone });
              }}
            />
            {offRouteIssue ? (
              <Notice tone="fig" role="alert">
                {offRouteIssue.message}
              </Notice>
            ) : null}
            <p className="text-[0.85rem] text-muted">
              We&apos;ll prepare everything fresh and have it on its way during your window. We can&apos;t promise an exact minute.
            </p>
          </div>
        ) : (
          <p className="text-[0.95rem] text-muted">Pick a date to see the windows.</p>
        )}
      </section>

      <div className="flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/cart" className="text-[0.92rem] text-olive underline underline-offset-4">
          Back to cart
        </Link>
        <Button
          size="lg"
          disabled={!canContinue}
          onClick={() => router.push("/checkout/details")}
        >
          Continue to your details
        </Button>
      </div>
    </div>
  );
}

function InspectPanel({
  day,
  suggestions,
  onPick,
}: {
  day: DayAvailability;
  suggestions: DayAvailability[];
  onPick: (date: string) => void;
}) {
  const title =
    day.status === "sold-out"
      ? "That date is fully booked."
      : day.status === "product-unavailable"
        ? "This one isn't available for your selected date."
        : day.status === "too-soon"
          ? "That date needs more notice."
          : day.status === "route-only"
            ? "That day isn't on our metro route."
            : day.status === "closed"
              ? day.label === "Events only"
                ? "Sundays are for events."
                : "We're closed that day."
              : "That date isn't available.";
  const alternatives = (day.unavailableProducts ?? [])
    .flatMap((p) => getProduct(p.productId)?.alternatives ?? [])
    .map((id) => getProduct(id))
    .filter((p, i, all) => p && all.indexOf(p) === i)
    .slice(0, 2);
  return (
    <Notice tone="fig" title={title} className="animate-rise">
      <div className="flex flex-col gap-3">
        <p>{day.detail ?? `${formatDateLong(day.date)} isn't open for delivery.`}</p>
        {day.unavailableProducts?.length ? (
          <ul className="flex flex-col gap-1">
            {day.unavailableProducts.map((p) => (
              <li key={p.productId}>
                {p.name}: earliest{" "}
                <button type="button" className="text-olive underline underline-offset-4" onClick={() => onPick(p.earliestDate)}>
                  {formatDateLong(p.earliestDate)}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {alternatives.length ? (
          <p>
            Or try{" "}
            {alternatives.map((p, i) => (
              <span key={p!.id}>
                {i > 0 ? " or " : ""}
                <Link href={`/order/${p!.slug}`} className="text-olive underline underline-offset-4">
                  {p!.name}
                </Link>
              </span>
            ))}
            .
          </p>
        ) : null}
        {suggestions.length ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted">Next open dates:</span>
            {suggestions.map((d) => (
              <button
                key={d.date}
                type="button"
                onClick={() => onPick(d.date)}
                className="rounded-full border border-olive/40 bg-paper px-3 py-1.5 text-olive hover:bg-olive hover:text-cream"
              >
                {formatDateShort(d.date)}
              </button>
            ))}
          </div>
        ) : null}
        {day.status === "closed" && day.label === "Events only" ? (
          <p>
            <Link href="/inquire" className="text-olive underline underline-offset-4">
              Planning a Sunday event? Tell us about it.
            </Link>
          </p>
        ) : null}
      </div>
    </Notice>
  );
}

export function DeliveryScheduler() {
  const delivery = useCart((s) => s.delivery);
  const step = !delivery.areaId || !delivery.address?.line1 ? "Address" : !delivery.date ? "Date" : "Window";
  return (
    <CheckoutShell step={step} title="Delivery">
      {(pricing) => (
        <>
          <p className="-mt-4 mb-10 flex items-center gap-2 text-[0.92rem] text-muted">
            <IconInfo size={18} className="text-olive" />
            We confirm we can deliver before asking for payment.
          </p>
          <SchedulerBody pricing={pricing} />
        </>
      )}
    </CheckoutShell>
  );
}
