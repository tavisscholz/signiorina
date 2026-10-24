"use client";

import clsx from "clsx";
import Link from "next/link";

import { CartLineItem } from "@/components/commerce/CartLineItem";
import { CartIssues, EmptyCart, MinimumProgress } from "@/components/commerce/CartParts";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { useCartPricing } from "@/components/commerce/useCartPricing";
import { ButtonLink } from "@/components/ui/Button";
import { IconCalendar, IconPin } from "@/components/ui/Icons";
import { ALLERGEN_STATEMENT } from "@/config/content";
import { getArea, getWindow } from "@/config/delivery";
import { track } from "@/lib/analytics";
import { useCart } from "@/lib/cart-store";
import { formatDateLong } from "@/lib/dates";
import { routes } from "@/config/journeys";

export function CartView() {
  const { pricing, hydrated } = useCartPricing();
  const delivery = useCart((s) => s.delivery);
  const area = delivery.areaId ? getArea(delivery.areaId) : undefined;

  if (!hydrated) return <div className="min-h-[50vh]" aria-busy="true" />;
  if (pricing.lines.length === 0) return <EmptyCart />;

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <ul className="divide-y divide-line border-y border-line">
          {pricing.lines.map((p) => (
            <CartLineItem key={p.line.lineId} priced={p} />
          ))}
        </ul>
        <CartIssues pricing={pricing} className="mt-6" />
        <Link href={routes.store} className="mt-6 inline-block text-[0.92rem] text-olive underline underline-offset-4">
          Keep browsing
        </Link>
        <p className="mt-10 rounded-2xl border border-line bg-paper p-5 text-[0.88rem] leading-relaxed text-muted">{ALLERGEN_STATEMENT}</p>
      </div>

      <aside className="lg:col-span-5" aria-label="Order summary">
        <div className="rounded-[1.75rem] border border-line bg-paper p-6 lg:sticky lg:top-32 md:p-8">
          <h2 className="display-sm text-olive">Summary</h2>
          {area || delivery.date ? (
            <div className="mt-5 flex flex-col gap-2 rounded-2xl bg-cream p-4 text-[0.9rem]">
              {area ? (
                <p className="flex gap-2">
                  <IconPin size={18} className="mt-0.5 shrink-0 text-olive" />
                  <span>
                    {delivery.address?.line1 ? `${delivery.address.line1}, ` : ""}
                    {area.name} · Zone {area.zone}
                  </span>
                </p>
              ) : null}
              {delivery.date && delivery.windowId ? (
                <p className="flex gap-2">
                  <IconCalendar size={18} className="mt-0.5 shrink-0 text-olive" />
                  <span>
                    {formatDateLong(delivery.date)} · {getWindow(delivery.windowId).display}
                  </span>
                </p>
              ) : null}
              <Link href="/checkout/delivery" className="text-olive underline underline-offset-4">
                Change delivery
              </Link>
            </div>
          ) : null}
          <OrderSummary pricing={pricing} className="mt-5" />
          <div className="mt-6">
            <MinimumProgress pricing={pricing} />
          </div>
          <ButtonLink
            href="/checkout/delivery"
            size="lg"
            className={clsx("mt-4 w-full", !pricing.canCheckout && "pointer-events-none opacity-45")}
            aria-disabled={!pricing.canCheckout}
            tabIndex={pricing.canCheckout ? undefined : -1}
            onClick={() => track("begin_checkout", { value: pricing.merchandiseSubtotal / 100, items: pricing.lines.length })}
          >
            Schedule delivery
          </ButtonLink>
          <p className="mt-3 text-center text-[0.82rem] text-muted">Guest checkout — no account needed.</p>
        </div>
      </aside>
    </div>
  );
}
