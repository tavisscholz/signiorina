"use client";

import clsx from "clsx";
import { useId, type ReactNode } from "react";

import { Checkbox, Fieldset, SelectField, TextField } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Notice";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { getAddOn } from "@/config/catalog";
import { deliveryAreas, servedZones } from "@/config/delivery";
import { eventFees, getWeddingPackage, weddingRules } from "@/config/events";
import { formatDollars } from "@/lib/money";
import { plannerAddOnIds, type PlannerState } from "@/lib/planner";

export interface OptionCard {
  id: string;
  name: string;
  price: string;
  meta?: string;
  line?: string;
  badge?: string;
}

/** A radio group drawn as cards. */
export function OptionCards({
  legend,
  name,
  options,
  value,
  onChange,
  columns = 3,
}: {
  legend: ReactNode;
  name: string;
  options: OptionCard[];
  value: string | undefined;
  onChange: (id: string) => void;
  columns?: 1 | 3;
}) {
  return (
    <Fieldset legend={legend}>
      <div className={clsx("mt-2 grid grid-cols-1 gap-3", columns === 3 && "sm:grid-cols-3")}>
        {options.map((o) => {
          const checked = o.id === value;
          return (
            <label
              key={o.id}
              className={clsx(
                "relative flex cursor-pointer flex-col gap-1 rounded-2xl border px-4 py-3.5 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fig",
                checked ? "border-olive bg-olive text-cream" : "border-line-strong bg-paper hover:border-olive/60",
              )}
            >
              <input type="radio" name={name} className="sr-only" checked={checked} onChange={() => onChange(o.id)} />
              {o.badge ? (
                <Badge tone={checked ? "cream" : "fig"} className="mb-1 self-start">
                  {o.badge}
                </Badge>
              ) : null}
              <span className="font-display text-[1.2rem] leading-tight">{o.name}</span>
              <span className={clsx("text-[0.88rem]", checked ? "text-cream/85" : "text-muted")}>
                {o.price}
                {o.meta ? ` · ${o.meta}` : ""}
              </span>
              {o.line ? <span className={clsx("text-[0.85rem]", checked ? "text-cream/80" : "text-muted")}>{o.line}</span> : null}
            </label>
          );
        })}
      </div>
    </Fieldset>
  );
}

const GUEST_CHIPS = [20, 40, 60, 80, 100];

/** Date, place, guest count and occasion — shared by both planners. */
export function DetailsFields({
  state,
  update,
  today,
  occasionLabel,
  occasions,
  guestHint,
  children,
}: {
  state: PlannerState;
  update: (patch: Partial<PlannerState>) => void;
  today: string | undefined;
  occasionLabel: string;
  occasions: ReadonlyArray<{ id: string; label: string }>;
  guestHint?: ReactNode;
  /** Inline notes under the fields (peak date, short notice, small party…). */
  children?: ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-7">
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id={`${id}-date`}
          type="date"
          label="Date"
          optional
          hint="Not sure yet? Leave it blank."
          value={state.date ?? ""}
          min={today}
          onChange={(e) => update({ date: e.target.value || undefined })}
        />
        <SelectField
          id={`${id}-occasion`}
          label={occasionLabel}
          optional
          value={state.occasion ?? ""}
          onChange={(e) => update({ occasion: e.target.value || undefined })}
        >
          <option value="">Choose one</option>
          {occasions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </SelectField>
        <SelectField
          id={`${id}-area`}
          label="Where is it?"
          optional
          hint="Sets the delivery fee. Venue details come later."
          value={state.area ?? ""}
          onChange={(e) => update({ area: e.target.value || undefined })}
          wrapperClassName="sm:col-span-2"
        >
          <option value="">Not sure yet</option>
          {servedZones.map((z) => (
            <optgroup key={z.id} label={`${z.label} · ${formatDollars(z.fee)} delivery`}>
              {deliveryAreas
                .filter((a) => a.zone === z.id)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              {state.area === `zone-${z.id}` ? <option value={`zone-${z.id}`}>Somewhere in {z.label}</option> : null}
            </optgroup>
          ))}
          <option value="other">Somewhere else — travel quoted</option>
        </SelectField>
      </div>

      <div>
        <QuantitySelector
          value={state.guests ?? 0}
          onChange={(n) => update({ guests: n >= 1 ? n : undefined })}
          min={0}
          max={400}
          label="Guests"
          showLabel
          size="lg"
          className="items-start"
        />
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Quick guest counts">
          {GUEST_CHIPS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={state.guests === n}
              onClick={() => update({ guests: n })}
              className={clsx(
                "rounded-full border px-3.5 py-1.5 text-[0.85rem] transition-colors",
                state.guests === n ? "border-olive bg-olive text-cream" : "border-line-strong text-olive hover:border-olive",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        {guestHint ? <p className="mt-3 text-[0.88rem] text-muted">{guestHint}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** Upgrades, pickup, attendant hours and add-ons. */
export function UpgradeFields({
  state,
  update,
  recommended = [],
}: {
  state: PlannerState;
  update: (patch: Partial<PlannerState>) => void;
  /** Add-on ids or "dop" / "attendant" to list first and mark "Recommended". */
  recommended?: string[];
}) {
  const id = useId();
  const wedding = state.journey === "weddings";
  const pkg = wedding && state.optionId ? getWeddingPackage(state.optionId) : undefined;
  const qty = (addOnId: string) => state.addOns.find((a) => a.id === addOnId)?.quantity ?? 0;
  const setQty = (addOnId: string, quantity: number) =>
    update({ addOns: [...state.addOns.filter((a) => a.id !== addOnId), ...(quantity > 0 ? [{ id: addOnId, quantity }] : [])] });
  const rec = (key: string) =>
    recommended.includes(key) ? (
      <Badge tone="olive" className="ml-2 align-middle">
        Recommended
      </Badge>
    ) : null;
  const addOnIds = [...plannerAddOnIds[state.journey]].sort(
    (a, b) => Number(recommended.includes(b)) - Number(recommended.includes(a)),
  );

  return (
    <div className="flex flex-col gap-9">
      <Fieldset legend="Upgrades">
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <Checkbox
            id={`${id}-dop`}
            label={
              <>
                DOP upgrade · +{formatDollars(eventFees.perPerson.dopUpgrade)}/guest{rec("dop")}
              </>
            }
            description="Prosciutto di Parma + aged Parmigiano."
            checked={state.dopUpgrade}
            onChange={(e) => update({ dopUpgrade: e.target.checked })}
          />
          <Checkbox
            id={`${id}-gluten`}
            label={`Gluten-conscious · +${formatDollars(eventFees.perPerson.glutenConscious)}/guest`}
            description="GF crackers packed separately."
            checked={state.glutenConscious}
            onChange={(e) => update({ glutenConscious: e.target.checked })}
          />
          {wedding ? (
            <Checkbox
              id={`${id}-bundle`}
              label={`${weddingRules.bundle.name} · ${weddingRules.bundle.foodDiscountPercent}% off food`}
              description="Booking two or more Signiorina events the same weekend."
              checked={state.bundle}
              onChange={(e) => update({ bundle: e.target.checked })}
            />
          ) : (
            <Checkbox
              id={`${id}-rental`}
              label={`Serving-piece rental · ${formatDollars(eventFees.servingPieceRental)}`}
              description="Our boards, stands + risers instead of disposable trays."
              checked={state.servingPieceRental}
              onChange={(e) => update({ servingPieceRental: e.target.checked })}
            />
          )}
        </div>
      </Fieldset>

      {pkg?.pieceReturn === "fee" ? (
        <Fieldset legend="Serving-piece pickup" hint={`${pkg.name} uses our serving pieces; we collect them after.`}>
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
                  state.pickup === value ? "border-olive bg-olive text-cream" : "border-line-strong",
                )}
              >
                <input type="radio" className="sr-only" name={`${id}-pickup`} checked={state.pickup === value} onChange={() => update({ pickup: value })} />
                {label}
              </label>
            ))}
          </div>
        </Fieldset>
      ) : pkg ? (
        <p className="text-[0.92rem] text-muted">{pkg.name} includes setup, serving pieces and teardown.</p>
      ) : null}

      <div>
        <QuantitySelector
          value={state.attendantHours}
          onChange={(n) => update({ attendantHours: n })}
          min={0}
          max={10}
          label="Extra attendant hours"
          showLabel
          className="items-start"
        />
        <p className="mt-1.5 text-[0.85rem] text-muted">
          {formatDollars(eventFees.attendant.hourly)}/hr, {eventFees.attendant.minimumHours}-hour minimum when added.
          {rec("attendant")}
        </p>
      </div>

      <Fieldset legend="Add to the table">
        <ul className="mt-2 grid gap-3 sm:grid-cols-2">
          {addOnIds.map((addOnId) => {
            const a = getAddOn(addOnId)!;
            return (
              <li key={a.id} className="flex flex-col gap-2 rounded-2xl border border-line bg-paper p-4">
                <span className="text-[0.95rem]">
                  {a.name} <span className="text-muted">· {formatDollars(a.price)}</span>
                  {rec(a.id)}
                </span>
                {a.serves ? <span className="text-[0.82rem] text-muted">{a.serves}</span> : null}
                <QuantitySelector
                  value={qty(a.id)}
                  min={0}
                  max={10}
                  label="Quantity"
                  itemName={a.name}
                  onChange={(q) => setQty(a.id, q)}
                  className="mt-auto items-start"
                />
              </li>
            );
          })}
        </ul>
      </Fieldset>
    </div>
  );
}
