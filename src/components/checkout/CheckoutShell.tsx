"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

import { EmptyCart } from "@/components/commerce/CartParts";
import { OrderSummary } from "@/components/commerce/OrderSummary";
import { useCartPricing } from "@/components/commerce/useCartPricing";
import { Photo } from "@/components/brand/Photo";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck, IconLock } from "@/components/ui/Icons";
import { formatCents, formatCentsExact } from "@/lib/money";
import type { CartPricing } from "@/lib/pricing";

export const CHECKOUT_STEPS = ["Cart", "Address", "Date", "Window", "Details", "Payment"] as const;
export type CheckoutStep = (typeof CHECKOUT_STEPS)[number];

export function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const index = CHECKOUT_STEPS.indexOf(current);
  return (
    <nav aria-label="Checkout progress">
      <ol className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[0.72rem] uppercase tracking-[0.14em] [scrollbar-width:none] sm:gap-2">
        {CHECKOUT_STEPS.map((step, i) => {
          const done = i < index;
          const active = i === index;
          return (
            <li key={step} className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-current={active ? "step" : undefined}>
              <span
                className={clsx(
                  "grid size-6 place-items-center rounded-full border text-[0.66rem]",
                  done && "border-olive bg-olive text-cream",
                  active && "border-olive text-olive",
                  !done && !active && "border-line-strong text-muted",
                )}
              >
                {done ? <IconCheck size={13} /> : i + 1}
              </span>
              <span className={clsx(active ? "text-olive" : "text-muted", !active && "hidden sm:inline")}>
                {step}
                {done ? <span className="sr-only"> (complete)</span> : null}
              </span>
              {i < CHECKOUT_STEPS.length - 1 ? <span aria-hidden="true" className="h-px w-3 bg-line-strong sm:w-6" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SummaryItems({ pricing }: { pricing: CartPricing }) {
  return (
    <ul className="flex flex-col gap-4">
      {pricing.lines.map((p) => (
        <li key={p.line.lineId} className="flex items-center gap-3">
          <div className="relative">
            <Photo media={p.product.images[0]} alt="" className="aspect-square w-14 rounded-[50%]" sizes="56px" />
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-olive px-1 text-[0.68rem] leading-5 text-cream">
              {p.quantity}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.95rem] font-medium">{p.product.name}</p>
            <p className="truncate text-[0.8rem] text-muted">
              {[p.variant?.name, ...p.addOns.map((a) => `+ ${a.addOn.name}`)].filter(Boolean).join(" · ") || p.product.serves}
            </p>
          </div>
          <p className="tabular text-[0.92rem]">{formatCents(p.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}

/** Two-column checkout frame with a sticky (desktop) / collapsible (mobile) summary. */
export function CheckoutShell({
  step,
  title,
  children,
  summaryOverride,
}: {
  step: CheckoutStep;
  title: ReactNode;
  children: (pricing: CartPricing) => ReactNode;
  summaryOverride?: CartPricing;
}) {
  const { pricing: live, hydrated } = useCartPricing();
  const pricing = summaryOverride ?? live;

  if (!hydrated) return <div className="container-page min-h-[60vh] py-16" aria-busy="true" />;
  if (live.lines.length === 0) {
    return (
      <div className="container-page py-16">
        <h1 className="sr-only">Checkout</h1>
        <EmptyCart />
      </div>
    );
  }
  const blocking = live.issues.filter((i) => i.blocking && i.code !== "off-route-minimum");
  if (blocking.length > 0) {
    return (
      <div className="container-page flex flex-col items-center gap-5 py-20 text-center">
        <h1 className="display-md text-olive">One thing before delivery</h1>
        <ul className="flex flex-col gap-1 text-muted">
          {blocking.map((i) => (
            <li key={i.code + (i.productId ?? "")}>{i.message}</li>
          ))}
        </ul>
        <ButtonLink href="/cart">Back to your cart</ButtonLink>
      </div>
    );
  }

  return (
    <div className="container-page pb-20 pt-8 md:pt-12">
      <CheckoutSteps current={step} />
      <details className="group mt-6 rounded-2xl border border-line bg-paper lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="text-[0.95rem] text-olive">
            <span className="group-open:hidden">Show</span>
            <span className="hidden group-open:inline">Hide</span> order summary
          </span>
          <span className="price text-[1.25rem] text-olive">{formatCentsExact(pricing.total)}</span>
        </summary>
        <div className="border-t border-line px-5 pb-5 pt-4">
          <SummaryItems pricing={pricing} />
          <OrderSummary pricing={pricing} className="mt-4" compact />
        </div>
      </details>
      <div className="mt-8 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h1 className="display-md text-olive">{title}</h1>
          <div className="mt-8">{children(pricing)}</div>
        </div>
        <aside className="hidden lg:col-span-5 lg:block" aria-label="Order summary">
          <div className="sticky top-28 rounded-[1.75rem] border border-line bg-paper p-7">
            <div className="flex items-center justify-between">
              <h2 className="display-sm text-olive">Your order</h2>
              <Link href="/cart" className="text-[0.85rem] text-olive underline underline-offset-4">
                Edit cart
              </Link>
            </div>
            <div className="mt-6">
              <SummaryItems pricing={pricing} />
            </div>
            <OrderSummary pricing={pricing} className="mt-6" />
            <p className="mt-5 flex items-center gap-2 text-[0.8rem] text-muted">
              <IconLock size={16} className="text-olive" /> Card details are handled by Stripe and never stored by Signiorina.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
