"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { IconArrowLeft, IconChevron } from "@/components/ui/Icons";
import { isBookable, type DayAvailability } from "@/lib/availability";
import { addDays, formatDateLong, formatMonth, makeISO, monthOf, weekdayOf, yearOf } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import type { ISODate } from "@/lib/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthStart(iso: ISODate): ISODate {
  return makeISO(yearOf(iso), monthOf(iso), 1);
}

function addMonths(iso: ISODate, n: number): ISODate {
  const y = yearOf(iso);
  const m = monthOf(iso) - 1 + n;
  return makeISO(y + Math.floor(m / 12), ((m % 12) + 12) % 12 + 1, 1);
}

function cellTone(day: DayAvailability | undefined) {
  if (!day) return "text-muted/40";
  switch (day.status) {
    case "available":
      return "bg-paper text-espresso hover:bg-olive hover:text-cream border-line-strong";
    case "few-left":
      return "bg-paper text-espresso hover:bg-olive hover:text-cream border-fig/50";
    case "sold-out":
      return "text-muted/70 line-through decoration-muted/50 border-transparent";
    default:
      return "text-muted/45 border-transparent";
  }
}

function ariaFor(day: DayAvailability | undefined, iso: ISODate): string {
  const base = formatDateLong(iso);
  if (!day) return `${base}, unavailable`;
  const parts = [base, day.label.toLowerCase()];
  if (isBookable(day.status)) {
    if (day.fromFee !== undefined) parts.push(day.fromFee === 0 ? "free delivery" : `delivery from ${formatCents(day.fromFee)}`);
    if (day.rush) parts.push("rush fee applies");
    if (day.holiday) parts.push(`${day.holiday.name} preorder`);
    if (day.routeDay) parts.push("Knoxville route day");
  }
  return parts.join(", ");
}

/**
 * Accessible month calendar (grid pattern with roving focus).
 * Arrow keys move by day/week, Page Up/Down by month, Home/End to week edges.
 * Unavailable dates stay focusable so their reason can be heard and read.
 */
export function DeliveryDatePicker({
  days,
  selected,
  onSelect,
  onInspect,
}: {
  days: DayAvailability[];
  selected?: ISODate;
  onSelect: (date: ISODate) => void;
  onInspect: (day: DayAvailability) => void;
}) {
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const first = days[0]?.date;
  const last = days.at(-1)?.date;
  const firstBookable = days.find((d) => isBookable(d.status))?.date;
  const [focused, setFocused] = useState<ISODate | undefined>(selected ?? firstBookable ?? first);
  const [month, setMonth] = useState<ISODate | undefined>(focused ? monthStart(focused) : undefined);
  const gridRef = useRef<HTMLTableElement>(null);
  const shouldFocus = useRef(false);

  const [prevSelected, setPrevSelected] = useState(selected);
  if (selected !== prevSelected) {
    setPrevSelected(selected);
    if (selected) {
      setFocused(selected);
      setMonth(monthStart(selected));
    }
  }

  useEffect(() => {
    if (!shouldFocus.current || !focused) return;
    shouldFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [focused, month]);

  if (!first || !last || !month || !focused) return null;

  const canPrev = month > monthStart(first);
  const canNext = addMonths(month, 1) <= last;

  const gridStart = addDays(month, -weekdayOf(month));
  const weeks: ISODate[][] = [];
  for (let w = 0; w < 6; w++) {
    const week = Array.from({ length: 7 }, (_, d) => addDays(gridStart, w * 7 + d));
    if (w > 3 && monthOf(week[0]) !== monthOf(month)) break;
    weeks.push(week);
  }

  const move = (target: ISODate) => {
    if (target < first || target > last) return;
    shouldFocus.current = true;
    setFocused(target);
    if (monthStart(target) !== month) setMonth(monthStart(target));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, iso: ISODate) => {
    const keys: Record<string, () => ISODate> = {
      ArrowLeft: () => addDays(iso, -1),
      ArrowRight: () => addDays(iso, 1),
      ArrowUp: () => addDays(iso, -7),
      ArrowDown: () => addDays(iso, 7),
      Home: () => addDays(iso, -weekdayOf(iso)),
      End: () => addDays(iso, 6 - weekdayOf(iso)),
      PageUp: () => addMonths(monthStart(iso), -1),
      PageDown: () => addMonths(monthStart(iso), 1),
    };
    const fn = keys[e.key];
    if (!fn) return;
    e.preventDefault();
    let target = fn();
    if (target < first) target = first;
    if (target > last) target = last;
    move(target);
  };

  const choose = (iso: ISODate) => {
    const day = byDate.get(iso);
    setFocused(iso);
    if (day && isBookable(day.status)) onSelect(iso);
    else if (day) onInspect(day);
  };

  return (
    <div className="rounded-[1.5rem] border border-line bg-paper p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full text-olive hover:bg-olive/8 disabled:opacity-30"
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={!canPrev}
          aria-label="Previous month"
        >
          <IconArrowLeft size={18} />
        </button>
        <h3 className="font-display text-[1.35rem] text-olive" aria-live="polite" id="calendar-month">
          {formatMonth(month)}
        </h3>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full text-olive hover:bg-olive/8 disabled:opacity-30"
          onClick={() => setMonth(addMonths(month, 1))}
          disabled={!canNext}
          aria-label="Next month"
        >
          <IconChevron size={18} />
        </button>
      </div>
      <table ref={gridRef} role="grid" aria-labelledby="calendar-month" className="mt-4 w-full table-fixed border-separate border-spacing-1">
        <thead>
          <tr>
            {WEEKDAYS.map((d) => (
              <th key={d} scope="col" className="pb-2 text-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-muted">
                <abbr title={d} className="no-underline">
                  {d.slice(0, 2)}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((iso) => {
                const inMonth = monthOf(iso) === monthOf(month);
                const inRange = iso >= first && iso <= last;
                if (!inMonth || !inRange) return <td key={iso} aria-hidden="true" />;
                const day = byDate.get(iso);
                const isSelected = iso === selected;
                const bookable = day ? isBookable(day.status) : false;
                return (
                  <td key={iso} role="gridcell" aria-selected={isSelected}>
                    <button
                      type="button"
                      data-date={iso}
                      tabIndex={iso === focused ? 0 : -1}
                      aria-label={ariaFor(day, iso)}
                      aria-disabled={!bookable}
                      onClick={() => choose(iso)}
                      onKeyDown={(e) => onKeyDown(e, iso)}
                      onFocus={() => setFocused(iso)}
                      className={clsx(
                        "relative mx-auto flex aspect-square w-full max-w-14 flex-col items-center justify-center rounded-[50%] border text-[0.98rem] tabular transition-colors",
                        isSelected ? "border-olive bg-olive text-cream" : cellTone(day),
                        !bookable && "cursor-default",
                      )}
                    >
                      {Number(iso.slice(8, 10))}
                      {day && bookable && !isSelected && (day.rush || day.holiday || day.status === "few-left") ? (
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "absolute bottom-1.5 size-1.5 rounded-full",
                            day.status === "few-left" ? "bg-fig" : day.rush ? "bg-prosecco" : "bg-pistachio",
                          )}
                        />
                      ) : null}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.78rem] text-muted" aria-label="Calendar key">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-full border border-line-strong bg-paper" aria-hidden="true" /> Available
        </li>
        <li className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-fig" aria-hidden="true" /> Few left
        </li>
        <li className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-prosecco" aria-hidden="true" /> Rush fee
        </li>
        <li className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-pistachio" aria-hidden="true" /> Holiday preorder
        </li>
        <li className="flex items-center gap-2">
          <span className="text-muted/70 line-through" aria-hidden="true">
            12
          </span>{" "}
          Fully booked
        </li>
      </ul>
    </div>
  );
}
