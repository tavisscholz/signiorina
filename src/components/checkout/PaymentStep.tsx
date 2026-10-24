"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { useCartHydrated, useDetailsHydrated } from "@/components/providers/StoreHydrator";
import { Button, ButtonLink } from "@/components/ui/Button";
import { IconLock } from "@/components/ui/Icons";
import { Notice } from "@/components/ui/Notice";
import { getArea, getWindow } from "@/config/delivery";
import { track } from "@/lib/analytics";
import type { DayAvailability } from "@/lib/availability";
import { useCart, useCheckoutDetails } from "@/lib/cart-store";
import { formatDateLong, formatDateShort } from "@/lib/dates";
import { formatCentsExact } from "@/lib/money";
import type { CartPricing } from "@/lib/pricing";

type Session = {
  mode: "stripe" | "dev";
  orderId: string;
  orderNumber: string;
  accessKey: string;
  clientSecret?: string;
  holdExpiresAt: string;
  pricing: CartPricing;
};

type Failure = { code: string; message: string; fieldErrors?: Record<string, string>; suggestions?: DayAvailability[] };

const SESSION_KEY = "signiorina-payment-session";

let stripePromise: Promise<Stripe | null> | undefined;
function getStripePromise() {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  stripePromise ??= loadStripe(key);
  return stripePromise;
}

const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#41483a",
    colorBackground: "#f8f2e7",
    colorText: "#24231f",
    colorTextSecondary: "#5c584e",
    colorDanger: "#49323c",
    fontFamily: "Jost, 'Helvetica Neue', Arial, sans-serif",
    fontSizeBase: "16px",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid rgba(36,35,31,0.28)", boxShadow: "none" },
    ".Input:focus": { border: "1px solid #41483a", boxShadow: "0 0 0 2px rgba(73,50,60,0.35)" },
    ".Tab": { border: "1px solid rgba(36,35,31,0.2)" },
    ".Tab--selected": { borderColor: "#41483a" },
  },
};

function confirmationUrl(s: Pick<Session, "orderId" | "accessKey">) {
  return `/checkout/confirmation/${s.orderId}?key=${encodeURIComponent(s.accessKey)}`;
}

async function revalidate(s: Session): Promise<{ ok: true } | ({ ok: false } & Failure)> {
  const res = await fetch("/api/checkout/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId: s.orderId, accessKey: s.accessKey }),
  });
  return res.json();
}

function StripePaymentForm({ session, onFailure }: { session: Session; onFailure: (f: Failure) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const email = useCheckoutDetails((s) => s.details.customer.email);

  const pay = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setError(undefined);
    const check = await revalidate(session);
    if (!check.ok) {
      setBusy(false);
      onFailure(check);
      return;
    }
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setBusy(false);
      setError(submitError.message);
      return;
    }
    const { error: payError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}${confirmationUrl(session)}`, receipt_email: email },
      redirect: "if_required",
    });
    if (payError) {
      setBusy(false);
      setError(
        payError.type === "card_error" || payError.type === "validation_error"
          ? `${payError.message} You haven't been charged.`
          : "Something interrupted the payment. You haven't been charged — please try again.",
      );
      return;
    }
    if (paymentIntent && ["succeeded", "processing", "requires_capture"].includes(paymentIntent.status)) {
      track("purchase", { value: session.pricing.total / 100, order: session.orderNumber });
      router.push(confirmationUrl(session));
    } else {
      setBusy(false);
      setError("The payment didn't complete. You haven't been charged — please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PaymentElement options={{ layout: "tabs", wallets: { applePay: "auto", googlePay: "auto" } }} />
      {error ? (
        <Notice tone="fig" role="alert" title="Payment didn't go through.">
          {error}
        </Notice>
      ) : null}
      <Button size="lg" onClick={pay} disabled={!stripe || busy} className="w-full">
        <IconLock size={16} />
        {busy ? "Placing your order…" : `Place order · ${formatCentsExact(session.pricing.total)}`}
      </Button>
    </div>
  );
}

function DevPaymentPanel({ session, onFailure }: { session: Session; onFailure: (f: Failure) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const place = async () => {
    setBusy(true);
    const res = await fetch("/api/checkout/dev-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: session.orderId, accessKey: session.accessKey }),
    });
    const data = await res.json();
    if (!data.ok) {
      setBusy(false);
      onFailure(data);
      return;
    }
    track("purchase", { value: session.pricing.total / 100, order: session.orderNumber, dev: true });
    router.push(confirmationUrl(session));
  };
  return (
    <div className="flex flex-col gap-5">
      <Notice tone="pistachio" title="Development mode — payments aren't connected.">
        No card details are requested or stored. Placing this order records it with payment marked{" "}
        <strong className="font-medium">not collected</strong>, so the full flow can be tested. Add Stripe keys to take real
        payments.
      </Notice>
      <Button size="lg" onClick={place} disabled={busy} className="w-full">
        {busy ? "Placing order…" : `Place test order · ${formatCentsExact(session.pricing.total)}`}
      </Button>
    </div>
  );
}

function HoldTimer({ expiresAt }: { expiresAt: string }) {
  const [minutes, setMinutes] = useState<number>();
  useEffect(() => {
    const tick = () => setMinutes(Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 60_000)));
    tick();
    const t = setInterval(tick, 15_000);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (minutes === undefined) return null;
  return (
    <p className="text-[0.88rem] text-muted" aria-live="polite">
      {minutes > 0
        ? `We're holding your delivery window for about ${minutes} more minute${minutes === 1 ? "" : "s"}.`
        : "Your hold has lapsed — we'll re-check the window when you place the order."}
    </p>
  );
}

export function PaymentStep() {
  const cartHydrated = useCartHydrated();
  const detailsHydrated = useDetailsHydrated();
  const lines = useCart((s) => s.lines);
  const delivery = useCart((s) => s.delivery);
  const details = useCheckoutDetails((s) => s.details);
  const severeAllergy = useCheckoutDetails((s) => s.severeAllergy);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; session?: Session; failure?: Failure }>();

  // Everything that changes the order. A new key starts a fresh checkout session — including when this
  // route is revisited after edits, since Cache Components keeps hidden routes' state alive.
  const signature = JSON.stringify({ lines, delivery, details });
  const ready = cartHydrated && detailsHydrated && lines.length > 0 && Boolean(delivery.date && delivery.windowId);
  const requestKey = ready ? `${signature}#${attempt}` : null;

  useEffect(() => {
    if (!requestKey) return;
    let cancelled = false;
    const finish = (r: { session?: Session; failure?: Failure }) => {
      if (!cancelled) setResult({ key: requestKey, ...r });
    };
    (async () => {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as { signature: string; session: Session };
          if (parsed.signature === signature) {
            const check = await revalidate(parsed.session);
            if (check.ok) return finish({ session: parsed.session });
          }
        }
        const res = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lines, delivery, details, severeAllergy }),
        });
        const data = await res.json();
        if (!data.ok) return finish({ failure: data });
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ signature, session: data }));
        finish({ session: data as Session });
      } catch {
        finish({ failure: { code: "network", message: "We couldn't reach checkout. Check your connection and try again." } });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = result && result.key === requestKey ? result : undefined;
  const session = current?.session;
  const failure = current?.failure;
  const loading = Boolean(requestKey) && !current;
  const setFailure = (f: Failure) => requestKey && setResult({ key: requestKey, failure: f });
  const start = () => setAttempt((a) => a + 1);

  const area = delivery.areaId ? getArea(delivery.areaId) : undefined;
  const stripeReady = session?.mode === "stripe" && session.clientSecret && getStripePromise();

  return (
    <CheckoutShell step="Payment" title="Review and pay" summaryOverride={session?.pricing}>
      {() => (
        <div className="flex flex-col gap-10">
          {!delivery.date || !delivery.windowId ? (
            <Notice
              title="Let's pick a delivery time first."
              action={
                <ButtonLink href="/checkout/delivery" size="sm">
                  Choose delivery
                </ButtonLink>
              }
            />
          ) : (
            <>
              <section aria-labelledby="review-title" className="grid gap-4 sm:grid-cols-2">
                <h2 id="review-title" className="sr-only">
                  Review
                </h2>
                <div className="rounded-2xl border border-line bg-paper p-5">
                  <p className="label-caps text-[0.66rem] text-olive">Delivery</p>
                  <p className="mt-2 font-medium">
                    {formatDateLong(delivery.date)}, {getWindow(delivery.windowId).display}
                  </p>
                  <p className="text-[0.92rem] text-muted">
                    {delivery.address?.line1}
                    {delivery.address?.line2 ? `, ${delivery.address.line2}` : ""}, {delivery.address?.city} {delivery.address?.zip}
                    {area ? ` · ${area.name}` : ""}
                  </p>
                  <Link href="/checkout/delivery" className="mt-2 inline-block text-[0.85rem] text-olive underline underline-offset-4">
                    Change
                  </Link>
                </div>
                <div className="rounded-2xl border border-line bg-paper p-5">
                  <p className="label-caps text-[0.66rem] text-olive">Contact</p>
                  <p className="mt-2 font-medium">
                    {details.customer.firstName} {details.customer.lastName}
                  </p>
                  <p className="text-[0.92rem] text-muted">
                    {details.customer.email} · {details.customer.phone}
                  </p>
                  {details.isGift && details.giftMessage ? (
                    <p className="mt-1 text-[0.88rem] italic text-muted">“{details.giftMessage}”</p>
                  ) : null}
                  <Link href="/checkout/details" className="mt-2 inline-block text-[0.85rem] text-olive underline underline-offset-4">
                    Change
                  </Link>
                </div>
              </section>

              <section aria-labelledby="payment-title" className="flex flex-col gap-5">
                <h2 id="payment-title" className="font-display text-[1.6rem] text-olive">
                  Payment
                </h2>
                {failure ? (
                  <FailurePanel failure={failure} onRetry={start} />
                ) : loading || !session ? (
                  <div className="h-56 animate-pulse rounded-2xl bg-linen/70" aria-busy="true" aria-label="Preparing secure payment" />
                ) : (
                  <>
                    <HoldTimer expiresAt={session.holdExpiresAt} />
                    {session.mode === "dev" ? (
                      <DevPaymentPanel session={session} onFailure={setFailure} />
                    ) : stripeReady ? (
                      <Elements stripe={getStripePromise()} options={{ clientSecret: session.clientSecret, appearance }}>
                        <StripePaymentForm session={session} onFailure={setFailure} />
                      </Elements>
                    ) : (
                      <Notice tone="fig" title="Payment couldn't load.">
                        Please refresh the page. Nothing has been charged.
                      </Notice>
                    )}
                    <p className="flex items-start gap-2 text-[0.85rem] text-muted">
                      <IconLock size={16} className="mt-0.5 shrink-0 text-olive" />
                      Payments are processed by Stripe. Signiorina never sees or stores your card number. No service charge, no
                      card surcharge, no mandatory gratuity.
                    </p>
                  </>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </CheckoutShell>
  );
}

function FailurePanel({ failure, onRetry }: { failure: Failure; onRetry: () => void }) {
  if (failure.code === "slot-unavailable") {
    return (
      <Notice
        tone="fig"
        role="alert"
        title="That window filled up."
        action={
          <ButtonLink href="/checkout/delivery" size="sm">
            Choose another time
          </ButtonLink>
        }
      >
        <p>{failure.message}</p>
        {failure.suggestions?.length ? (
          <p className="mt-2">Open soon: {failure.suggestions.map((d) => formatDateShort(d.date)).join(" · ")}</p>
        ) : null}
      </Notice>
    );
  }
  if (failure.code === "invalid") {
    const fieldKeys = Object.keys(failure.fieldErrors ?? {});
    const deliveryIssue = fieldKeys.some((k) => k.startsWith("address") || k.startsWith("cabin") || k === "areaId");
    return (
      <Notice
        tone="fig"
        role="alert"
        title={failure.message}
        action={
          <ButtonLink href={deliveryIssue ? "/checkout/delivery" : "/checkout/details"} size="sm">
            {deliveryIssue ? "Review delivery" : "Review details"}
          </ButtonLink>
        }
      >
        <ul className="list-disc pl-5">
          {Object.values(failure.fieldErrors ?? {}).slice(0, 4).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </Notice>
    );
  }
  if (failure.code === "payments-unavailable" || failure.code === "severe-allergy") {
    return (
      <Notice
        tone="fig"
        role="alert"
        title={failure.code === "severe-allergy" ? "Let's talk before you order." : "Online payment isn't on yet."}
        action={
          <ButtonLink href={failure.code === "severe-allergy" ? "/inquire?type=allergy" : "/inquire"} size="sm">
            Contact us
          </ButtonLink>
        }
      >
        {failure.message}
      </Notice>
    );
  }
  return (
    <Notice
      tone="fig"
      role="alert"
      title="Checkout hit a snag."
      action={
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      }
    >
      {failure.message} Nothing has been charged.
    </Notice>
  );
}
