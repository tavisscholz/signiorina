import type { Metadata } from "next";
import { Suspense } from "react";

import { OliveSprig } from "@/components/brand/OliveSprig";
import { ClearCartOnConfirm } from "@/components/checkout/ClearCartOnConfirm";
import { ButtonLink } from "@/components/ui/Button";
import { Badge, Notice } from "@/components/ui/Notice";
import { getDietaryOption } from "@/config/catalog";
import { formatDateFull } from "@/lib/dates";
import { formatCents, formatCentsExact } from "@/lib/money";
import type { Order } from "@/lib/types";
import { getOrderForConfirmation } from "@/server/checkout";
import { routes } from "@/config/journeys";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function ConfirmationPage(props: PageProps<"/checkout/confirmation/[orderId]">) {
  return (
    <Suspense fallback={<div className="container-page min-h-[70vh] py-20" aria-busy="true" />}>
      <Confirmation {...props} />
    </Suspense>
  );
}

async function Confirmation({ params, searchParams }: PageProps<"/checkout/confirmation/[orderId]">) {
  const { orderId } = await params;
  const { key } = await searchParams;
  const order = typeof key === "string" ? await getOrderForConfirmation(orderId, key) : undefined;

  if (!order) {
    return (
      <section className="container-narrow flex min-h-[60vh] flex-col items-center justify-center gap-5 py-20 text-center">
        <h1 className="display-md text-olive">We couldn&apos;t find that order.</h1>
        <p className="text-muted">The confirmation link may be incomplete. If you placed an order, send us a note with your name and delivery date.</p>
        <ButtonLink href={routes.store}>Back to the shop</ButtonLink>
      </section>
    );
  }

  const paid = order.paymentStatus === "paid";
  const devOrder = order.paymentStatus === "not_collected_dev";
  const processing = order.paymentStatus === "processing" || order.paymentStatus === "requires_payment";
  const confirmed = paid || devOrder;

  return (
    <section className="container-page pb-24 pt-12 md:pt-16">
      {confirmed ? <ClearCartOnConfirm orderId={order.id} /> : null}
      <div className="mx-auto max-w-3xl text-center">
        <OliveSprig className="mx-auto w-24 text-olive/70" />
        <p className="eyebrow mt-6 text-olive-soft">Order {order.number}</p>
        <h1 className="display-xl mt-4 text-olive">{processing ? "Almost there." : <>Consider it <span className="accent">handled.</span></>}</h1>
        <p className="lede mx-auto mt-6 max-w-xl text-muted">
          {processing
            ? "Your payment is still processing. Refresh this page in a moment to see it confirmed."
            : `Thank you, ${order.customer.firstName}. Keep this page or note your order number, ${order.number}.`}
        </p>
        {devOrder ? (
          <Badge tone="fig" className="mt-5">
            Development order — payment not collected
          </Badge>
        ) : null}
        {order.status === "needs_attention" ? (
          <Notice tone="fig" className="mx-auto mt-6 max-w-xl text-left">
            Your payment went through. We&apos;re double-checking the delivery schedule and will contact you shortly to confirm.
          </Notice>
        ) : null}
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-6">
          <DeliveryCard order={order} />
          <div className="rounded-[1.5rem] bg-olive p-7 text-cream on-dark">
            <h2 className="display-sm">What happens next</h2>
            <p className="mt-3 text-cream/85">
              We&apos;ll prepare everything fresh and have it headed your way during your selected delivery window.
            </p>
            <ul className="mt-5 flex flex-col gap-2 text-[0.92rem] text-cream/80">
              <li>· Keep your phone handy on delivery day in case the driver needs directions.</li>
              {order.delivery.locationType === "cabin" && order.delivery.cabin?.handoff === "property-manager" ? (
                <li>· We&apos;ll confirm the refrigerator handoff with {order.delivery.cabin.propertyManagerCompany} before delivery.</li>
              ) : null}
              <li>· Perishables are best enjoyed the day they arrive — keep them chilled until you set the table.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-line bg-paper p-7">
          <h2 className="display-sm text-olive">Your order</h2>
          <ul className="mt-5 divide-y divide-line">
            {order.items.map((item) => (
              <li key={item.lineId} className="flex justify-between gap-4 py-3">
                <div>
                  <p className="font-medium">
                    {item.quantity} × {item.productName}
                  </p>
                  <p className="text-[0.85rem] text-muted">
                    {[
                      item.variantName,
                      ...item.dietary.map((d) => getDietaryOption(d)?.label),
                      ...item.addOns.map((a) => `+ ${a.name}${a.quantity > 1 ? ` × ${a.quantity}` : ""}`),
                      item.personalization ? `Tag: “${item.personalization}”` : undefined,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <p className="tabular">{formatCents(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[0.95rem]">
            <Row label="Subtotal" value={formatCents(order.totals.itemsSubtotal)} />
            {order.totals.addOnsTotal ? <Row label="Add-ons" value={formatCents(order.totals.addOnsTotal)} /> : null}
            <Row label="Delivery" value={order.totals.delivery === 0 ? "Free" : formatCents(order.totals.delivery)} />
            {order.totals.rushFee ? <Row label="Rush fee" value={formatCents(order.totals.rushFee)} /> : null}
            {order.totals.holidayFee ? <Row label="Holiday fee" value={formatCents(order.totals.holidayFee)} /> : null}
            <Row label="Tax" value={formatCentsExact(order.totals.tax)} />
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-line-strong pt-4">
            <span className="label-caps text-olive">{paid ? "Total paid" : devOrder ? "Total (not charged)" : "Total"}</span>
            <span className="price text-[1.8rem] text-olive tabular">{formatCentsExact(order.totals.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <ButtonLink href={routes.store} variant="secondary">
          Order something else
        </ButtonLink>
        <ButtonLink href="/inquire">Plan a gathering</ButtonLink>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular">{value}</dd>
    </div>
  );
}

function DeliveryCard({ order }: { order: Order }) {
  const d = order.delivery;
  return (
    <div className="rounded-[1.5rem] border border-line bg-paper p-7">
      <h2 className="display-sm text-olive">Delivery</h2>
      <dl className="mt-5 grid gap-4 text-[0.95rem] sm:grid-cols-2">
        <div>
          <dt className="label-caps text-[0.64rem] text-muted">Date</dt>
          <dd className="mt-1 font-medium">{formatDateFull(d.date)}</dd>
        </div>
        <div>
          <dt className="label-caps text-[0.64rem] text-muted">Window</dt>
          <dd className="mt-1 font-medium">{d.windowDisplay}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="label-caps text-[0.64rem] text-muted">Address</dt>
          <dd className="mt-1">
            {d.company ? (
              <>
                {d.company}
                <br />
              </>
            ) : null}
            {d.address.line1}
            {d.address.line2 ? `, ${d.address.line2}` : ""}
            <br />
            {d.address.city}, {d.address.state} {d.address.zip}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="label-caps text-[0.64rem] text-muted">Contact</dt>
          <dd className="mt-1">
            {order.customer.firstName} {order.customer.lastName} · {order.customer.phone}
            {order.recipient ? (
              <>
                <br />
                Receiving: {order.recipient.name}
                {order.recipient.phone ? ` · ${order.recipient.phone}` : ""}
              </>
            ) : null}
          </dd>
        </div>
      </dl>
    </div>
  );
}
