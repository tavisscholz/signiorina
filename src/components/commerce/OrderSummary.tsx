import clsx from "clsx";

import { zones } from "@/config/delivery";
import { formatCents, formatCentsExact, formatDollars } from "@/lib/money";
import type { CartPricing } from "@/lib/pricing";

const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 });

/** Totals table. Every mandatory charge is itemized before payment. */
export function OrderSummary({
  pricing,
  className,
  compact = false,
}: {
  pricing: CartPricing;
  className?: string;
  compact?: boolean;
}) {
  const rows: Array<{ label: string; value: string; detail?: string; muted?: boolean }> = [
    { label: "Subtotal", value: formatCents(pricing.itemsSubtotal) },
  ];
  if (pricing.addOnsTotal > 0) rows.push({ label: "Add-ons", value: formatCents(pricing.addOnsTotal) });

  const d = pricing.delivery;
  if (d.status === "quoted" || d.status === "estimated") {
    rows.push({ label: d.label, value: d.fee === 0 ? "Free" : formatCents(d.fee), detail: compact ? undefined : d.detail });
  } else if (d.status === "needs-date") {
    rows.push({ label: d.label, value: "Set by date", detail: d.detail, muted: true });
  } else {
    rows.push({
      label: "Delivery",
      value: `From ${formatDollars(Math.min(...zones.map((z) => z.fee)))}`,
      detail: "Set by your delivery area.",
      muted: true,
    });
  }
  if (pricing.rushFee > 0) rows.push({ label: "Rush fee", value: formatCents(pricing.rushFee), detail: "Inside our usual 48-hour lead time" });
  if (pricing.holidayFee > 0 && pricing.holiday) {
    rows.push({ label: "Holiday fee", value: formatCents(pricing.holidayFee), detail: `${pricing.holiday.name} preorder` });
  }
  rows.push({
    label: pricing.taxEstimated ? "Estimated tax" : `Sales tax (${percent.format(pricing.taxRate)})`,
    value: formatCentsExact(pricing.tax),
    muted: pricing.taxEstimated,
  });

  return (
    <div className={clsx("flex flex-col", className)}>
      <dl className="flex flex-col divide-y divide-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4 py-3">
            <dt className="text-[0.95rem]">
              {r.label}
              {r.detail ? <span className="mt-0.5 block text-[0.82rem] leading-snug text-muted">{r.detail}</span> : null}
            </dt>
            <dd className={clsx("tabular text-right text-[0.98rem]", r.muted && "text-muted")}>{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-1 flex items-baseline justify-between border-t border-line-strong pt-4">
        <span className="label-caps text-olive">{pricing.delivery.status === "quoted" ? "Total" : "Estimated total"}</span>
        <span className="price text-[1.8rem] text-olive tabular">{formatCentsExact(pricing.total)}</span>
      </div>
      <p className="mt-2 text-[0.8rem] text-muted">No service charge, no mandatory gratuity, no card surcharge.</p>
    </div>
  );
}
