import { IconInfo } from "@/components/ui/Icons";
import { eventFees } from "@/config/events";
import type { EventEstimate } from "@/lib/event-estimate";
import { formatCents, formatCentsExact } from "@/lib/money";

/** Itemized event estimate: lines, tax, total, retainer, warnings and notes. */
export function EstimateSummary({ estimate }: { estimate: EventEstimate }) {
  return (
    <>
      <p className="mt-3 font-display text-[1.6rem] leading-tight text-olive">
        {estimate.optionName}, {estimate.guests} guests
      </p>
      <ul className="mt-5 flex flex-col divide-y divide-line">
        {estimate.lines.map((l) => (
          <li key={l.id} className="flex items-start justify-between gap-4 py-2.5 text-[0.92rem]">
            <span>
              {l.label}
              {l.detail ? <span className="block text-[0.8rem] text-muted">{l.detail}</span> : null}
            </span>
            <span className="tabular shrink-0">{l.quoted ? "Quoted" : `${l.amount < 0 ? "−" : ""}${formatCents(Math.abs(l.amount))}`}</span>
          </li>
        ))}
        <li className="flex justify-between py-2.5 text-[0.92rem] text-muted">
          <span>Estimated tax</span>
          <span className="tabular">{formatCentsExact(estimate.tax)}</span>
        </li>
      </ul>
      <div className="mt-2 flex items-baseline justify-between border-t border-line-strong pt-4">
        <span className="label-caps text-olive">Estimated total</span>
        <span className="price text-[2rem] text-olive tabular">{formatCentsExact(estimate.total)}</span>
      </div>
      <p className="mt-2 text-[0.88rem] text-muted">
        {eventFees.retainerPercent}% nonrefundable retainer to reserve: {formatCentsExact(estimate.retainer)}
        {estimate.deliveryQuoted ? " (before travel is quoted)" : ""}.
      </p>
      {[...estimate.warnings, ...estimate.notes].length ? (
        <ul className="mt-4 flex flex-col gap-2 text-[0.85rem]">
          {estimate.warnings.map((w) => (
            <li key={w} className="flex gap-2 text-fig">
              <IconInfo size={16} className="mt-0.5 shrink-0" /> {w}
            </li>
          ))}
          {estimate.notes.map((n) => (
            <li key={n} className="flex gap-2 text-muted">
              <IconInfo size={16} className="mt-0.5 shrink-0 text-olive" /> {n}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
