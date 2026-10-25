import type { Metadata } from "next";
import Link from "next/link";

import { LegalDoc, LegalSection } from "@/components/sections/LegalDoc";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "What Signiorina collects when you order or send an inquiry, how we use it, and the choices you have.",
  path: "/privacy",
});

const UPDATED = "October 25, 2026";

/** Describes what the site actually does — keep it in step with checkout, inquiries and analytics. */
export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated={UPDATED}
      intro={
        <p>
          This policy explains what Signiorina (&ldquo;we&rdquo;) collects when you use this website, order online or send us an
          inquiry, and how we use it. We collect only what we need to feed you well.
        </p>
      }
    >
      <LegalSection title="What we collect">
        <p>
          <strong className="font-medium text-espresso">When you order:</strong> your name, email, phone number and company
          (if you add one); the delivery address, date and window; delivery notes; for cabins, access details such as gate
          codes, driveway notes and property-manager contacts; a recipient&apos;s name and phone if someone else is receiving
          the order; gift and card messages; and your dietary choices, including whether someone in your group has a severe
          allergy.
        </p>
        <p>
          <strong className="font-medium text-espresso">When you send an inquiry or a proposal request:</strong> your name,
          email, phone and company, and the details of your event — date, place, guest count, your selections and estimate,
          and anything you write to us.
        </p>
        <p>
          <strong className="font-medium text-espresso">Payment:</strong> card payments are handled by Stripe. Your card
          details go directly to Stripe; we never see or store your full card number.
        </p>
      </LegalSection>

      <LegalSection title="How we use it">
        <p>
          To prepare and deliver your order, contact you about it, respond to inquiries and send proposals, take payment,
          and keep the business and tax records we&apos;re required to keep.
        </p>
        <p>We don&apos;t sell your information, and we don&apos;t share it for advertising.</p>
      </LegalSection>

      <LegalSection title="Who else handles it">
        <p>
          Only the services that run the site and the business: Stripe for payments, our hosting provider for the website
          and its records, and the email or business tools we use to receive your inquiries and orders. They handle your
          information only to provide those services to us.
        </p>
      </LegalSection>

      <LegalSection title="Your browser">
        <p>
          Your cart is saved in your own browser so it&apos;s still there when you come back; the contact details you type at
          checkout are kept only until you close the tab. We don&apos;t use advertising cookies. Stripe may use cookies on the
          payment step to prevent fraud.
        </p>
        <p>
          We may measure how the site is used — for example, which pages are viewed or when a cart is started. Those
          measurements never include your name, email, phone or address.
        </p>
      </LegalSection>

      <LegalSection title="How long we keep it">
        <p>As long as we need it to fulfil your order or event and to keep the business and tax records the law requires.</p>
      </LegalSection>

      <LegalSection title="Your choices">
        <p>
          You can ask to see, correct or delete the information we hold about you — just{" "}
          <Link href="/inquire" className="text-olive underline underline-offset-4">
            send us a note
          </Link>
          . We&apos;ll keep only what we&apos;re required to keep for business and tax records.
        </p>
      </LegalSection>

      <LegalSection title="Children">
        <p>This site is meant for adults planning orders and events. We don&apos;t knowingly collect information from children.</p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>If we change this policy, we&apos;ll update it here and change the date at the top.</p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          Questions about your information?{" "}
          <Link href="/inquire" className="text-olive underline underline-offset-4">
            Send us a note
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
