"use client";

import clsx from "clsx";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { IconInfo } from "@/components/ui/Icons";
import { getAddOn, getProduct } from "@/config/catalog";
import { scheduling } from "@/config/delivery";
import { setAddOnQuantity, useCart } from "@/lib/cart-store";
import { formatCents, formatDollars } from "@/lib/money";
import type { CartPricing } from "@/lib/pricing";
import { routes } from "@/config/journeys";

export function EmptyCart({ onNavigate, headingLevel = "h2" }: { onNavigate?: () => void; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <div className="flex flex-col items-center gap-5 py-16 text-center">
      <span aria-hidden="true" className="oval grid h-24 w-32 place-items-center border border-olive/30 font-display text-[2rem] italic text-olive/60">
        ~
      </span>
      <Heading className="display-sm text-olive">Nothing on the table yet.</Heading>
      <p className="max-w-xs text-[0.95rem] text-muted">
        Boxes from {formatDollars(getProduct("aperitivo-box")?.price ?? 18)}, boards for a crowd, and an arrival supper for the cabin.
      </p>
      <ButtonLink href={routes.store} onClick={onNavigate}>
        Find something good
      </ButtonLink>
    </div>
  );
}

/** Progress toward the delivery minimum, with one-tap suggestions. */
export function MinimumProgress({ pricing }: { pricing: CartPricing }) {
  const lines = useCart((s) => s.lines);
  const updateLine = useCart((s) => s.updateLine);
  if (pricing.amountToMinimum <= 0) return null;
  const minimum = scheduling.minimumOrder * 100;
  const pct = Math.min(100, Math.round((pricing.merchandiseSubtotal / minimum) * 100));
  const focaccia = getAddOn("whole-focaccia");
  const host = lines.find((l) => getProduct(l.productId)?.addOnIds.includes("whole-focaccia"));
  return (
    <div className="mb-3 rounded-2xl border border-olive/20 bg-cream p-4">
      <p className="text-[0.9rem] text-espresso">
        Delivery begins at {formatDollars(scheduling.minimumOrder)}.{" "}
        <strong className="font-medium">Add {formatCents(pricing.amountToMinimum)} more</strong> to schedule it.
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-linen" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Progress to delivery minimum">
        <div className="h-full rounded-full bg-olive transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[0.84rem]">
        {focaccia && host ? (
          <button
            type="button"
            className="rounded-full border border-olive/40 px-3 py-1.5 text-olive hover:bg-olive hover:text-cream"
            onClick={() =>
              updateLine(host.lineId, {
                addOns: setAddOnQuantity(host.addOns, focaccia.id, (host.addOns.find((a) => a.addOnId === focaccia.id)?.quantity ?? 0) + 1),
              })
            }
          >
            + {focaccia.name} · {formatDollars(focaccia.price)}
          </button>
        ) : null}
        <Link href="/order/box-for-two" className="rounded-full border border-olive/40 px-3 py-1.5 text-olive hover:bg-olive hover:text-cream">
          + Box for Two · {formatDollars(getProduct("box-for-two")?.price ?? 55)}
        </Link>
      </div>
    </div>
  );
}

export function CartIssues({ pricing, className }: { pricing: CartPricing; className?: string }) {
  const issues = pricing.issues.filter((i) => i.blocking && i.code !== "empty" && i.code !== "below-minimum");
  if (issues.length === 0) return null;
  return (
    <ul className={clsx("flex flex-col gap-2", className)} aria-live="polite">
      {issues.map((issue, i) => (
        <li key={`${issue.code}-${i}`} className="flex gap-2.5 rounded-xl border border-fig/25 bg-fig/[0.05] px-4 py-3 text-[0.9rem]">
          <IconInfo size={18} className="mt-0.5 shrink-0 text-fig" />
          <span>{issue.message}</span>
        </li>
      ))}
    </ul>
  );
}
