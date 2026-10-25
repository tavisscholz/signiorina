import type { Metadata } from "next";
import Link from "next/link";

import { LegalDoc, LegalSection } from "@/components/sections/LegalDoc";
import { Badge } from "@/components/ui/Notice";
import { ALLERGEN_STATEMENT } from "@/config/content";
import { eventFees } from "@/config/events";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Use",
  description: "The terms for using the Signiorina website, ordering online and booking events.",
  path: "/terms",
});

const UPDATED = "October 25, 2026";

const link = "text-olive underline underline-offset-4";

/** Only rules already published elsewhere on the site — no new policies are introduced here. */
export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Use"
      updated={UPDATED}
      intro={
        <p>
          These terms cover using this website, ordering online and booking an event with Signiorina (&ldquo;we&rdquo;). By
          using the site or placing an order, you agree to them.
        </p>
      }
    >
      <LegalSection title="Orders and prices">
        <p>
          Prices are in US dollars and published on the site. Sales tax is calculated at checkout, and delivery, rush and
          holiday fees are shown before you pay. There&apos;s no service charge, mandatory gratuity or card surcharge. Your
          order is placed when payment is complete and you see your order number.
        </p>
        <p>
          Our photos show our style; fruit and a few pieces change with the season, and each product page lists what&apos;s
          typically inside.
        </p>
      </LegalSection>

      <LegalSection title="Delivery">
        <p>
          Every online order is delivered in the window you choose at checkout. We&apos;ll have your order on its way during
          that window, but we can&apos;t promise an exact minute. Lead times and the delivery minimum are shown on each product
          page and on our{" "}
          <Link href="/delivery" className={link}>
            delivery page
          </Link>
          , along with the areas we serve.
        </p>
        <p>
          Someone needs to receive perishable orders, unless your property manager has authorized refrigerator access and
          we&apos;ve confirmed the details with them. We never leave perishable food outside or unattended. Perishables are best
          enjoyed the day they arrive — keep them chilled until you set the table.
        </p>
      </LegalSection>

      <LegalSection title="Changes and cancellations">
        {site.showPlaceholders ? (
          <div className="relative rounded-[1.25rem] border border-dashed border-olive/30 bg-paper p-6">
            <Badge tone="fig" className="absolute -top-3 left-5">
              Placeholder — cancellation + refund policy to confirm
            </Badge>
            <p>Hidden on the live site until the owner confirms the policy for online orders.</p>
          </div>
        ) : null}
        <p>
          Need to change or cancel an order? Contact us as soon as you can through our{" "}
          <Link href="/inquire" className={link}>
            contact form
          </Link>{" "}
          and we&apos;ll tell you what&apos;s possible.
        </p>
      </LegalSection>

      <LegalSection title="Events and weddings">
        <p>
          Estimates on the site are estimates, not quotes. We confirm availability and send a written quote or proposal,
          and a {eventFees.retainerPercent}% nonrefundable retainer reserves your date.
        </p>
      </LegalSection>

      <LegalSection title="Allergies">
        <p>{ALLERGEN_STATEMENT}</p>
      </LegalSection>

      <LegalSection title="Alcohol">
        <p>We don&apos;t sell, serve or deliver alcohol.</p>
      </LegalSection>

      <LegalSection title="Using this website">
        <p>
          The words, photos and design on this site belong to Signiorina. Please don&apos;t copy them for commercial use without
          asking. Don&apos;t misuse the site — for example, by placing orders you don&apos;t intend to pay for or trying to
          interfere with how it works.
        </p>
        <p>
          How we handle your information is described in our{" "}
          <Link href="/privacy" className={link}>
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>These terms are governed by the laws of the State of Tennessee.</p>
      </LegalSection>

      <LegalSection title="Changes to these terms">
        <p>If we change these terms, we&apos;ll update them here and change the date at the top.</p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          <Link href="/inquire" className={link}>
            Send us a note
          </Link>{" "}
          — we&apos;re happy to help.
        </p>
      </LegalSection>
    </LegalDoc>
  );
}
