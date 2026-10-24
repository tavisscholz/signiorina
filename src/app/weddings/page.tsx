import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { Photo } from "@/components/brand/Photo";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { ProductCard } from "@/components/commerce/ProductCard";
import { EventEstimator, EventEstimatorFromUrl } from "@/components/events/EventEstimator";
import { WeddingPackageCard } from "@/components/events/WeddingPackageCard";
import { Reveal } from "@/components/motion/Reveal";
import { FaqList } from "@/components/sections/FaqList";
import { CTABand, PageHero, ProcessSteps } from "@/components/sections/Sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { getProduct } from "@/config/catalog";
import { faqSections } from "@/config/content";
import { eventFees, weddingPackages, weddingRules } from "@/config/events";
import { formatDollars } from "@/lib/money";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Smoky Mountain Wedding Catering — Italian Grazing Tables from $24/Guest",
  description:
    "Italian-inspired wedding grazing tables for Gatlinburg, Pigeon Forge and Smoky Mountain weddings of 30–80 guests: The Aperitivo Hour $24, The Gathering Table $32 and The Hosted Table $42 per guest.",
  path: "/weddings",
});

const bridal = getProduct("bridal-suite-board")!;
const grooms = getProduct("grooms-room-board")!;
const welcome = getProduct("wedding-welcome-box")!;
const pantry = getProduct("pantry-welcome-box")!;
const [aperitivo, gathering, hosted] = weddingPackages;

const moments = [
  { title: "Welcome party", body: `${aperitivo.name} at the cabin or venue the night before.`, price: `${formatDollars(aperitivo.pricePerPerson)}/guest` },
  { title: "Rehearsal gathering", body: `${gathering.name}, with a panini tray to turn it into supper.`, price: `${formatDollars(gathering.pricePerPerson)}/guest` },
  { title: "Bridal suite", body: "A lighter, fruit-forward board for the getting-ready hours.", price: formatDollars(bridal.price), href: `/order/${bridal.slug}` },
  { title: "Groom's room", body: "Meat-forward, panini, pickles and aged cheeses.", price: formatDollars(grooms.price), href: `/order/${grooms.slug}` },
  { title: "Cocktail hour", body: `${aperitivo.name} — while photos happen and everyone mingles.`, price: `${formatDollars(aperitivo.pricePerPerson)}/guest` },
  { title: "Micro reception", body: `${hosted.name}: meal-level grazing with an attendant.`, price: `${formatDollars(hosted.pricePerPerson)}/guest` },
  { title: "Cabin wedding", body: "A styled table in the great room, set before the vows.", price: `From ${formatDollars(aperitivo.pricePerPerson)}/guest` },
  { title: "Guest welcome boxes", body: "Tagged with your names, for every room or rental.", price: `${formatDollars(welcome.price)} each`, href: `/order/${welcome.slug}` },
];

export default function WeddingsPage() {
  const weddingFaq = faqSections.find((s) => s.id === "weddings")!.items;
  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Wedding grazing tables",
          description: "Italian-inspired styled grazing tables for Smoky Mountain weddings, welcome parties and rehearsals.",
          path: "/weddings",
          priceFrom: aperitivo.pricePerPerson,
        })}
      />
      <JsonLd data={faqJsonLd(weddingFaq.filter((f) => !f.clientInput))} />

      <PageHero
        eyebrow="Weddings"
        title={
          <>
            Give them something to <span className="accent">gather around.</span>
          </>
        }
        lede={`Styled grazing tables for Smoky Mountain weddings of ${weddingRules.focusGuestRange} — from the welcome party to the last toast. Priced per guest, published right here.`}
        actions={
          <>
            <ButtonLink href="/inquire?type=wedding" size="lg">
              Plan a wedding
            </ButtonLink>
            <ButtonLink href="#packages" variant="secondary" size="lg">
              See the packages
            </ButtonLink>
          </>
        }
        media="bridalSuite"
        mediaSecondary="weddingTable"
      />

      {/* Positioning */}
      <section className="border-y border-line bg-paper">
        <div className="container-page grid gap-10 py-16 md:py-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionHeading eyebrow="Where we fit" title={<>Made for the middle of the <span className="accent">celebration.</span></>} size="md" />
          </Reveal>
          <Reveal delay={120} className="flex flex-col gap-5 text-[1.05rem] text-muted lg:col-span-7">
            <p>
              Destination weddings, micro-weddings and cabin weddings don&apos;t need a banquet hall&apos;s worth of catering. They
              need a table people actually gather around — generous, beautiful and easy to love.
            </p>
            <p>
              That&apos;s what we do: Italian-inspired grazing for cocktail hours, welcome parties, rehearsals and intimate
              receptions, set up and styled on site. You&apos;ll know the price per guest, the minimum and every fee before you
              ever fill in a form.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Moments */}
      <section className="container-page py-20 md:py-28" aria-labelledby="moments">
        <SectionHeading eyebrow="The wedding weekend" title={<span id="moments">Every moment that needs feeding.</span>} />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-[1.75rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {moments.map((m, i) => (
            <Reveal as="li" key={m.title} delay={(i % 4) * 80} className="flex flex-col gap-2 bg-cream p-6">
              <span aria-hidden="true" className="h-3 w-5 rounded-[50%] border border-olive/50" />
              <h3 className="font-display text-[1.35rem] text-olive">{m.title}</h3>
              <p className="text-[0.92rem] text-muted">{m.body}</p>
              <p className="mt-auto pt-2 text-[0.9rem] text-olive">
                {m.href ? (
                  <Link href={m.href} className="underline underline-offset-4">
                    {m.price} · order online
                  </Link>
                ) : (
                  m.price
                )}
              </p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Packages */}
      <section id="packages" className="on-dark relative scroll-mt-24 bg-olive text-cream" aria-labelledby="packages-title">
        <div className="platter-top absolute inset-x-0 -top-10 h-12 bg-olive" aria-hidden="true" />
        <div className="container-page py-20 md:py-28">
          <SectionHeading
            tone="light"
            eyebrow="Three packages"
            title={<span id="packages-title">Real prices, per guest.</span>}
            lede="Every package includes the styled table, the food, eco plates, napkins and picks, a menu card and allergen card, our serving pieces, and setup and styling."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {weddingPackages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 120}>
                <WeddingPackageCard pkg={pkg} tone="dark" featured={pkg.id === "gathering-table"} />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 grid gap-6 text-[0.95rem] text-cream/80 md:grid-cols-3">
            <p>
              <span className="text-cream">Peak Saturdays</span> in May, June, September, October and December carry a higher food
              minimum — not a higher price per guest.
            </p>
            <p>
              <span className="text-cream">Delivery and tax</span> are added at the zone rate. No service charge, no mandatory
              gratuity, no card surcharge.
            </p>
            <p>
              <span className="text-cream">Serving-piece pickup</span> for {aperitivo.name} and {gathering.name}:{" "}
              {formatDollars(eventFees.pickup.nextDay)} next day or {formatDollars(eventFees.pickup.sameNight)} same night.{" "}
              {hosted.name} includes teardown.
            </p>
          </div>
        </div>
        <div className="platter-bottom absolute inset-x-0 -bottom-10 h-12 bg-olive" aria-hidden="true" />
      </section>

      {/* Estimator */}
      <section id="estimate" className="container-page scroll-mt-24 pb-20 pt-28 md:pb-28 md:pt-36" aria-labelledby="estimate-title">
        <SectionHeading
          eyebrow="Price your table"
          title={<span id="estimate-title">See the whole number.</span>}
          lede="Choose a package, your guest count and where you're celebrating. The estimate updates as you go — minimums, fees, tax and the retainer included."
        />
        <div className="mt-12">
          {/* Restores a shared or "Edit estimate" link's state from the URL. */}
          <Suspense fallback={<EventEstimator kind="wedding" />}>
            <EventEstimatorFromUrl kind="wedding" />
          </Suspense>
        </div>
      </section>

      {/* Order-online extras */}
      <section className="border-y border-line bg-paper" aria-labelledby="extras-title">
        <div className="container-page py-20 md:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Order online"
              title={<span id="extras-title">For the rest of the weekend.</span>}
              lede={`Fixed-price extras you can order right now. Book two or more Signiorina events for the same weekend and we take ${weddingRules.bundle.foodDiscountPercent}% off the food.`}
            />
            <ButtonLink href="/order?category=wedding-weekend" variant="secondary">
              All wedding-weekend items
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
            {[bridal, grooms, welcome, pantry].map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="container-page grid gap-14 py-20 md:py-28 lg:grid-cols-12" aria-labelledby="booking-title">
        <div className="lg:col-span-5">
          <Reveal variant="oval">
            <Photo media="candlelitTable" shape="arch" className="aspect-[3/4] w-full max-w-sm" sizes="(min-width: 1024px) 30vw, 80vw" />
          </Reveal>
        </div>
        <div className="lg:col-span-7">
          <SectionHeading eyebrow="How booking works" title={<span id="booking-title">Simple, and in writing.</span>} />
          <ProcessSteps
            className="mt-12"
            steps={[
              { title: "Tell us where you're gathering.", body: "Date, venue or cabin, guest count and the moments you're picturing." },
              {
                title: "We shape the spread.",
                body: `A package and menu that fit, with a written quote — every fee itemized. A ${eventFees.retainerPercent}% nonrefundable retainer reserves your date.`,
              },
              {
                title: "We bring it together beautifully.",
                body: `Final count ${weddingRules.finalCountDays} days before. On the day, we arrive, style the table and let you get on with celebrating.`,
              },
            ]}
          />
          <div className="mt-12 rounded-[1.5rem] border border-line bg-paper p-6 md:p-8">
            <h3 className="display-sm text-olive">For planners + venues</h3>
            <p className="mt-3 text-muted">
              Published per-guest pricing, itemized quotes, a menu card and allergen card on every table, and setup that respects
              your timeline. Book {weddingRules.bookingLeadDays}+ days out; we&apos;ll confirm everything in writing.
            </p>
            <ButtonLink href="/inquire?type=wedding" variant="text" className="mt-4">
              Send a planner inquiry
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-narrow pb-8" aria-labelledby="wedding-faq">
        <h2 id="wedding-faq" className="display-md mb-8 text-olive">
          Wedding questions
        </h2>
        <FaqList items={weddingFaq} />
      </section>

      <CTABand
        title="Let's talk about your weekend."
        lede="Tell us the date and the place. We'll come back with availability and a written quote."
        primary={{ href: "/inquire?type=wedding", label: "Plan a wedding" }}
        secondary={{ href: "/order?category=wedding-weekend", label: "Order wedding extras" }}
      />
    </>
  );
}
