import type { Metadata } from "next";
import Link from "next/link";

import { Photo } from "@/components/brand/Photo";
import { PriceOval, SectionHeading } from "@/components/brand/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { FaqList } from "@/components/sections/FaqList";
import { CTABand, FactList, PageHero } from "@/components/sections/Sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { IconCalendar, IconCheck, IconClock, IconTruck } from "@/components/ui/Icons";
import { getProduct } from "@/config/catalog";
import { faqSections } from "@/config/content";
import { deliveryWindows, zones } from "@/config/delivery";
import { routeDayNames } from "@/lib/delivery-fees";
import { leadTimeLabel } from "@/lib/format";
import { formatDollars } from "@/lib/money";
import { faqJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { routeLabels, routes } from "@/config/journeys";

export const metadata: Metadata = pageMetadata({
  title: "Corporate Catering — Boxed Lunches + Office Grazing in the Smokies",
  description:
    "Italian-inspired corporate catering for Sevier County offices: Pranzo Lunch Boxes $22, Office Grazing Spreads $18/guest, gift boxes and a standing lunch program with Tuesday + Thursday route days.",
  path: "/corporate",
});

const occasions = [
  "Team lunches",
  "Office meetings",
  "Client meetings",
  "Broker opens",
  "Medical office lunches",
  "Law + title meetings",
  "Employee appreciation",
  "Retreats",
  "Hospitality events",
];

export default function CorporatePage() {
  const pranzo = getProduct("pranzo-lunch-box")!;
  const spread = getProduct("office-grazing-spread")!;
  const small = getProduct("gathering-board-small")!;
  const large = getProduct("gathering-board-large")!;
  const gift = getProduct("gift-box")!;
  const zoneA = zones.find((z) => z.id === "A")!;
  const zoneC = zones.find((z) => z.id === "C")!;
  const route = zoneC.routeDays!;
  const midday = deliveryWindows.find((w) => w.id === "midday")!;
  const corporateFaq = faqSections.find((s) => s.id === "corporate")!.items;

  const offers = [
    {
      product: pranzo,
      price: `${formatDollars(pranzo.price)} each`,
      note: `${pranzo.minimumQuantity}-box minimum · ${leadTimeLabel(pranzo.leadTimeDays)}`,
      body: "Focaccia panino, antipasti salad, parmigiano + salame bites, fruit and amaretti. Classic or vegetarian caprese.",
    },
    {
      product: spread,
      price: `${formatDollars(spread.price)} / guest`,
      note: `${spread.minimumQuantity}-guest minimum · ${leadTimeLabel(spread.leadTimeDays)}`,
      body: "A generous drop-off spread on disposable trays. Nothing to return, nobody waiting around.",
    },
    {
      product: small,
      price: `${formatDollars(small.price)} / ${formatDollars(large.price)}`,
      note: "Small (6–8) or Large (12–15)",
      body: "Gathering Boards for smaller meetings, client visits and the afternoon slump.",
      label: "Gathering Boards",
    },
    {
      product: gift,
      price: `${formatDollars(gift.price)} · ${formatDollars(gift.volumePricing![0].unitPrice)} at ${gift.volumePricing![0].minQuantity}+`,
      note: leadTimeLabel(gift.leadTimeDays),
      body: "Closing gifts, client thank-yous and the holidays. Meats and cheeses for tonight, pantry favorites for later.",
      label: "Corporate Gift Box",
    },
  ];

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Corporate catering",
          description: "Italian-inspired boxed lunches, office grazing spreads and corporate gift boxes for Sevier County and the Smokies.",
          path: "/corporate",
          priceFrom: spread.price,
        })}
      />
      <JsonLd data={faqJsonLd(corporateFaq)} />

      <PageHero
        eyebrow="Corporate"
        title={
          <>
            Corporate catering without the <span className="accent">corporate catering</span> energy.
          </>
        }
        lede="Pranzo lunch boxes, drop-off grazing spreads and gift boxes for offices across Sevier County and the Smokies — with a standing lunch program for teams who order often."
        actions={
          <>
            <ButtonLink href={`/order/${pranzo.slug}`} size="lg">
              Order Pranzo boxes
            </ButtonLink>
            <ButtonLink href="/inquire?type=corporate" variant="secondary" size="lg">
              Set up a standing lunch
            </ButtonLink>
          </>
        }
        media="pranzoLunchBox"
        mediaSecondary="officeGathering"
      />

      <section className="container-page py-20 md:py-24" aria-labelledby="offers">
        <SectionHeading eyebrow="The menu" title={<span id="offers">Lunch people look forward to.</span>} />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {offers.map((o, i) => (
            <Reveal key={o.product.id} delay={(i % 2) * 120}>
              <article className="group grid h-full overflow-hidden rounded-[1.75rem] border border-line bg-paper sm:grid-cols-[0.9fr_1.1fr]">
                <Photo media={o.product.images[0]} className="aspect-[4/3] sm:aspect-auto sm:h-full" sizes="(min-width: 768px) 22vw, 92vw" zoom />
                <div className="flex flex-col gap-3 p-6">
                  <h3 className="display-sm text-olive">{o.label ?? o.product.name}</h3>
                  <p className="text-[0.95rem] text-muted">{o.body}</p>
                  <p className="mt-auto pt-2">
                    <span className="price text-[1.5rem] text-olive">{o.price}</span>
                    <span className="block text-[0.8rem] uppercase tracking-[0.14em] text-muted">{o.note}</span>
                  </p>
                  <Link href={`/order/${o.product.slug}`} className="label-caps text-[0.68rem] text-olive underline decoration-olive/40 underline-offset-[6px]">
                    Order online
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="standing-lunch" className="on-dark relative scroll-mt-24 bg-olive text-cream" aria-labelledby="standing-title">
        <div className="platter-top absolute inset-x-0 -top-10 h-12 bg-olive" aria-hidden="true" />
        <div className="container-page grid gap-12 py-20 md:py-28 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              tone="light"
              eyebrow="Standing Lunch Program"
              title={<span id="standing-title">Same menu prices. Better logistics.</span>}
              lede="For offices ordering at least twice a month. We don't play discount games with the food — we make the ordering effortless instead."
            />
            <ButtonLink href="/inquire?type=corporate" variant="light" size="lg" className="mt-9">
              Start a standing lunch
            </ButtonLink>
          </div>
          <ul className="flex flex-col gap-6 lg:col-span-6">
            {[
              { title: "Free delivery where it applies", body: "Delivery fees come off for standing accounts on their regular route." },
              { title: "A priority delivery window", body: `Your lunches hold their place in the ${midday.label.toLowerCase()} window (${midday.display}).` },
              { title: "Monthly invoicing", body: "One invoice a month instead of a card at every checkout." },
              { title: "Recurring orders", body: "Set the rhythm once — weekly, every other Tuesday, whatever suits the team." },
            ].map((b, i) => (
              <Reveal as="li" key={b.title} delay={i * 100} className="flex gap-4 border-b border-cream/15 pb-6">
                <IconCheck size={22} className="mt-1 shrink-0 text-prosecco" />
                <div>
                  <p className="font-display text-[1.35rem]">{b.title}</p>
                  <p className="mt-1 text-cream/75">{b.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
        <div className="platter-bottom absolute inset-x-0 -bottom-10 h-12 bg-olive" aria-hidden="true" />
      </section>

      <section className="container-page grid gap-12 pb-20 pt-28 md:pt-36 lg:grid-cols-12" aria-labelledby="route-title">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="Route days" title={<span id="route-title">{routeDayNames("C", false, " & ")}.</span>} size="md" />
          <p className="mt-5 text-muted">
            {zoneC.label} offices get our best pricing on route days, when we batch deliveries in the morning and midday
            windows.
          </p>
          <PriceOval tone="olive" className="mt-8 px-7 py-5 text-[1.4rem]">
            {formatDollars(route.fee)} route delivery
          </PriceOval>
        </div>
        <div className="lg:col-span-7">
          <FactList
            facts={[
              {
                icon: <IconTruck size={20} />,
                title: `Free over ${formatDollars(route.corporateFreeDeliveryAt)}`,
                body: `Corporate orders on ${routeDayNames()} route days ship free at ${formatDollars(route.corporateFreeDeliveryAt)}+. Otherwise ${formatDollars(route.fee)}.`,
              },
              {
                icon: <IconCalendar size={20} />,
                title: "Other days",
                body: `${formatDollars(zoneC.fee)} delivery for ${zoneC.label} orders over ${formatDollars(zoneC.offRouteMinimumSubtotal!)}.`,
              },
              {
                icon: <IconClock size={20} />,
                title: "Lunch window",
                body: `${midday.label}: ${midday.display}. Order by noon, two days ahead.`,
              },
              {
                icon: <IconTruck size={20} />,
                title: "Sevier County offices",
                body: `${zoneA.label}: ${formatDollars(zoneA.fee)}, free over ${formatDollars(zoneA.freeDeliveryAt!)}, any weekday.`,
              },
            ]}
          />
        </div>
      </section>

      <section className="border-y border-line bg-paper" aria-labelledby="corp-occasions">
        <div className="container-page grid gap-10 py-16 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Good for" title={<span id="corp-occasions">The whole work week.</span>} size="md" />
          </div>
          <ul className="flex flex-wrap content-start gap-3 lg:col-span-8">
            {occasions.map((o) => (
              <li key={o} className="rounded-full border border-olive/30 bg-cream px-5 py-2.5 font-display text-[1.1rem] text-olive">
                {o}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-narrow py-20" aria-labelledby="corp-faq">
        <h2 id="corp-faq" className="display-md mb-8 text-olive">
          Corporate questions
        </h2>
        <FaqList items={corporateFaq} />
      </section>

      <CTABand
        title="Make Tuesday lunch the good part of Tuesday."
        lede="Order boxes for this week, or tell us about your team and we'll set up a standing lunch."
        primary={{ href: "/inquire?type=corporate", label: "Corporate inquiry" }}
        secondary={{ href: `${routes.store}?category=corporate`, label: routeLabels.store }}
      />
    </>
  );
}
