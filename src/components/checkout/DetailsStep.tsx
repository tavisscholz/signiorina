"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { CheckoutShell } from "@/components/checkout/CheckoutShell";
import { useDetailsHydrated } from "@/components/providers/StoreHydrator";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, TextAreaField, TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { getWindow } from "@/config/delivery";
import { ALLERGEN_STATEMENT } from "@/config/content";
import { useCart, useCheckoutDetails } from "@/lib/cart-store";
import { formatDateLong } from "@/lib/dates";
import { validateDetails, type FieldErrors } from "@/lib/validation";

function DetailsBody() {
  const id = useId();
  const router = useRouter();
  const hydrated = useDetailsHydrated();
  const delivery = useCart((s) => s.delivery);
  const details = useCheckoutDetails((s) => s.details);
  const setDetails = useCheckoutDetails((s) => s.setDetails);
  const setCustomer = useCheckoutDetails((s) => s.setCustomer);
  const severeAllergy = useCheckoutDetails((s) => s.severeAllergy);
  const setSevereAllergy = useCheckoutDetails((s) => s.setSevereAllergy);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Prefill company from the delivery step.
  useEffect(() => {
    if (hydrated && delivery.company && !details.customer.company) setCustomer({ company: delivery.company });
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!delivery.date || !delivery.windowId || !delivery.address) {
    return (
      <Notice
        title="Let's pick a delivery time first."
        action={
          <ButtonLink href="/checkout/delivery" size="sm">
            Choose delivery
          </ButtonLink>
        }
      >
        We confirm the address, date and window before collecting your details.
      </Notice>
    );
  }
  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;

  const c = details.customer;
  const submit = () => {
    const errs = validateDetails(details);
    setErrors(errs);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    if (severeAllergy) return;
    router.push("/checkout/payment");
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-10"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="rounded-2xl border border-line bg-paper px-5 py-4 text-[0.95rem]">
        <p className="font-medium">
          {formatDateLong(delivery.date)} · {getWindow(delivery.windowId).display}
        </p>
        <p className="text-muted">
          {delivery.address.line1}, {delivery.address.city} ·{" "}
          <Link href="/checkout/delivery" className="text-olive underline underline-offset-4">
            Change
          </Link>
        </p>
      </div>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-display text-[1.5rem] text-olive">Your details</legend>
        <TextField id={`${id}-first`} label="First name" required autoComplete="given-name" value={c.firstName} error={errors["customer.firstName"]} onChange={(e) => setCustomer({ firstName: e.target.value })} />
        <TextField id={`${id}-last`} label="Last name" required autoComplete="family-name" value={c.lastName} error={errors["customer.lastName"]} onChange={(e) => setCustomer({ lastName: e.target.value })} />
        <TextField id={`${id}-email`} label="Email" type="email" required autoComplete="email" hint="For your confirmation." value={c.email} error={errors["customer.email"]} onChange={(e) => setCustomer({ email: e.target.value })} />
        <TextField id={`${id}-phone`} label="Phone" type="tel" required autoComplete="tel" hint="Only for delivery-day questions." value={c.phone} error={errors["customer.phone"]} onChange={(e) => setCustomer({ phone: e.target.value })} />
        <TextField id={`${id}-company`} label="Company" optional autoComplete="organization" value={c.company ?? ""} onChange={(e) => setCustomer({ company: e.target.value })} wrapperClassName="sm:col-span-2" />
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="mb-4 font-display text-[1.5rem] text-olive">Recipient + gift</legend>
        <Checkbox
          id={`${id}-recipient`}
          label="Someone else will receive the delivery"
          checked={details.recipientDifferent}
          onChange={(e) => setDetails({ recipientDifferent: e.target.checked })}
        />
        {details.recipientDifferent ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id={`${id}-rname`}
              label="Recipient name"
              required
              value={details.recipient?.name ?? ""}
              error={errors["recipient.name"]}
              onChange={(e) => setDetails({ recipient: { ...details.recipient, name: e.target.value } })}
            />
            <TextField
              id={`${id}-rphone`}
              label="Recipient phone"
              optional
              type="tel"
              value={details.recipient?.phone ?? ""}
              onChange={(e) => setDetails({ recipient: { name: details.recipient?.name ?? "", phone: e.target.value } })}
            />
          </div>
        ) : null}
        <Checkbox id={`${id}-gift`} label="This is a gift" description="Add a message to go with the delivery." checked={details.isGift} onChange={(e) => setDetails({ isGift: e.target.checked })} />
        {details.isGift ? (
          <TextAreaField
            id={`${id}-giftmsg`}
            label="Gift message"
            optional
            maxLength={300}
            hint={`${(details.giftMessage ?? "").length}/300`}
            value={details.giftMessage ?? ""}
            onChange={(e) => setDetails({ giftMessage: e.target.value })}
            rows={3}
          />
        ) : null}
        <TextAreaField
          id={`${id}-notes`}
          label="Delivery notes"
          optional
          hint="Anything that helps on the day — buzzer, floor, who to ask for."
          value={details.deliveryNotes ?? ""}
          onChange={(e) => setDetails({ deliveryNotes: e.target.value })}
          rows={3}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-4 rounded-[1.5rem] border border-line bg-paper p-5 sm:p-6">
        <legend className="sr-only">Allergies</legend>
        <p className="text-[0.9rem] leading-relaxed text-muted">{ALLERGEN_STATEMENT}</p>
        <Checkbox
          id={`${id}-allergy`}
          label="Someone in our group has a severe allergy"
          checked={severeAllergy}
          onChange={(e) => setSevereAllergy(e.target.checked)}
        />
        {severeAllergy ? (
          <Notice
            tone="fig"
            role="alert"
            title="Let's talk before you order."
            action={
              <ButtonLink href="/inquire?type=allergy" size="sm">
                Contact us about the allergy
              </ButtonLink>
            }
          >
            We&apos;d rather get this right than rush it. Your cart is saved — send us the details and we&apos;ll tell you honestly
            what we can do. We may not be able to take orders we can&apos;t handle safely.
          </Notice>
        ) : null}
      </fieldset>

      <div className="flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/checkout/delivery" className="text-[0.92rem] text-olive underline underline-offset-4">
          Back to delivery
        </Link>
        <Button type="submit" size="lg" disabled={severeAllergy}>
          Continue to payment
        </Button>
      </div>
    </form>
  );
}

export function DetailsStep() {
  return <CheckoutShell step="Details" title="Your details">{() => <DetailsBody />}</CheckoutShell>;
}
