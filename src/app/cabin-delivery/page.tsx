import type { Metadata } from "next";
import Link from "next/link";

import { Photo } from "@/components/brand/Photo";
import { PriceOval, SectionHeading } from "@/components/brand/SectionHeading";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ZoneCalculator } from "@/components/commerce/ZoneCalculator";
import { Reveal } from "@/components/motion/Reveal";
import { CTABand, PageHero, ProcessSteps } from "@/components/sections/Sections";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { getAddOn, getProduct } from "@/config/catalog";
import { deliveryAreas, deliveryWindows, servedZones } from "@/config/delivery";
import { leadTimeLabel } from "@/lib/format";
import { formatDollars } from "@/lib/money";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { routes } from "@/config/journeys";

export const metadata: Metadata = pageMetadata({
  title: "Cabin Food Delivery — Gatlinburg, Pigeon Forge + Smoky Mountain Cabins",
  description:
    "Arrival-night charcuterie delivered to Smoky Mountain cabins: the Cabin Welcome Box ($145, serves 4–6), Box for Two ($55) and boards for the whole house. Afternoon delivery to Gatlinburg, Pigeon Forge, Wears Valley and Sevierville.",
  path: "/cabin-delivery",
});

const guests = [
  { who: "Couples + honeymooners", pick: "Box for Two" },
  { who: "Families", pick: "Cabin Welcome Box" },
  { who: "Bachelorette weekends", pick: "Gathering Board — Large + Celebration Pack" },
  { who: "Reunions", pick: "Gathering Board — Large" },
  { who: "Birthday trips", pick: "Any box + Celebration Pack" },
  { who: "Cabin celebrations", pick: "Cabin Welcome Box" },
  { who: "Corporate retreats", pick: "Boards or a styled table" },
];

export default function CabinDeliveryPage() {
  const cabin = getProduct("cabin-welcome-box")!;
  const forTwo = getProduct("box-for-two")!;
  const large = getProduct("gathering-board-large")!;
  const pack = getAddOn("celebration-pack")!;
  const afternoon = deliveryWindows.find((w) => w.id === "afternoon")!;
  const cabinAreas = deliveryAreas.filter((a) => a.cabinCountry);

  return (
    <>
      <JsonLd
        data={serviceJsonLd({
          name: "Cabin arrival food delivery",
          description: "Italian-inspired arrival suppers and boards delivered to Smoky Mountain cabins and vacation rentals.",
          path: "/cabin-delivery",
        })}
      />
      <PageHero
        eyebrow="Cabin delivery"
        title={
          <>
            Check in. Gather. <span className="accent">We&apos;ll bring the good part.</span>
          </>
        }
        lede="An arrival supper, a board for the whole house or a box for two — delivered to cabins and rentals around Gatlinburg, Pigeon Forge, Wears Valley and Sevierville."
        actions={
          <>
            <ButtonLink href={`/order/${cabin.slug}`} size="lg">
              Order a Cabin Welcome Box
            </ButtonLink>
            <ButtonLink href="#areas" variant="secondary" size="lg">
              Check your area
            </ButtonLink>
          </>
        }
        media="cabinEvening"
        mediaSecondary="boxForTwo"
      />

      {/* Signature product */}
      <section className="bg-linen/60" aria-labelledby="welcome-box">
        <div className="container-page grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-16">
          <Reveal variant="oval" className="relative lg:col-span-6">
            <Photo media="boardLargeWide" shape="oval" className="mx-auto aspect-[5/4] w-full max-w-xl" sizes="(min-width: 1024px) 45vw, 92vw" />
            <PriceOval tone="olive" className="absolute -bottom-2 right-6 px-6 py-4 text-[1.4rem]">
              {formatDollars(cabin.price)}
            </PriceOval>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6">
            <SectionHeading
              eyebrow="The Smoky Mountain signature"
              title={<span id="welcome-box">Your first night is handled.</span>}
              lede="Not a gift basket, not snacks for the car — supper for four to six, waiting when you walk in."
            />
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-[0.95rem] text-muted">
              {cabin.contents.map((c) => (
                <li key={c} className="flex items-center gap-2.5">
                  <span aria-hidden="true" className="h-2 w-3 shrink-0 rounded-[50%] border border-olive/60" />
                  {c}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.95rem] text-muted">
              {cabin.serves} · {leadTimeLabel(cabin.leadTimeDays)} · Afternoon delivery, {afternoon.display}
            </p>
            <ButtonLink href={`/order/${cabin.slug}`} size="lg" className="mt-8">
              Order a Cabin Welcome Box
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* Who it's for */}
      <section className="container-page py-20 md:py-24" aria-labelledby="who-title">
        <SectionHeading eyebrow="Who it's for" title={<span id="who-title">Everyone who drove up the mountain.</span>} />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-[1.75rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {guests.map((g) => (
            <li key={g.who} className="flex flex-col gap-1 bg-cream p-6">
              <p className="font-display text-[1.3rem] text-olive">{g.who}</p>
              <p className="text-[0.9rem] text-muted">Try: {g.pick}</p>
            </li>
          ))}
          <li className="flex flex-col justify-center gap-2 bg-olive p-6 text-cream">
            <p className="font-display text-[1.3rem]">{pack.name} · {formatDollars(pack.price)}</p>
            <p className="text-[0.9rem] text-cream/80">{pack.description}</p>
          </li>
        </ul>
      </section>

      <section className="container-page pb-20" aria-labelledby="cabin-products">
        <h2 id="cabin-products" className="display-md text-olive">
          For the cabin
        </h2>
        <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {[cabin, forTwo, large].map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="on-dark relative bg-olive text-cream" aria-labelledby="how-cabin">
        <div className="platter-top absolute inset-x-0 -top-10 h-12 bg-olive" aria-hidden="true" />
        <div className="container-page py-20 md:py-28">
          <SectionHeading tone="light" eyebrow="How cabin delivery works" title={<span id="how-cabin">Mountain roads, handled.</span>} />
          <ProcessSteps
            tone="dark"
            className="mt-14"
            steps={[
              {
                title: "Order ahead.",
                body: `The Cabin Welcome Box needs ${leadTimeLabel(cabin.leadTimeDays)}; most boxes need 48 hours. Order by noon.`,
              },
              {
                title: "Pick the afternoon.",
                body: `We deliver to cabins in the ${afternoon.display} window — timed to check-in.`,
              },
              {
                title: "Tell us the road.",
                body: "Gate codes, steep or gravel driveways, which door — we ask at checkout so we arrive on time.",
              },
            ]}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <div className="rounded-[1.5rem] border border-cream/15 p-6">
              <p className="font-display text-[1.4rem]">Someone will be there</p>
              <p className="mt-2 text-cream/75">We hand it over in person and you&apos;re straight into the evening.</p>
            </div>
            <div className="rounded-[1.5rem] border border-cream/15 p-6">
              <p className="font-display text-[1.4rem]">Your property manager has authorized fridge access</p>
              <p className="mt-2 text-cream/75">
                We confirm the details with them and put everything in the refrigerator before you arrive.
              </p>
            </div>
          </div>
          <p className="mt-6 text-[0.95rem] text-prosecco">We never leave perishable food outside or unattended.</p>
        </div>
        <div className="platter-bottom absolute inset-x-0 -bottom-10 h-12 bg-olive" aria-hidden="true" />
      </section>

      {/* Areas */}
      <section id="areas" className="container-page grid scroll-mt-24 gap-12 pb-20 pt-28 md:pt-36 lg:grid-cols-12" aria-labelledby="areas-title">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Where we deliver"
            title={<span id="areas-title">Cabins around the park — not inside it.</span>}
            lede="We deliver to the cabins, rentals, resorts and towns that surround Great Smoky Mountains National Park. We don't deliver inside the park itself."
          />
          <ul className="mt-8 flex flex-col gap-3 text-[0.95rem]">
            {servedZones.map((z) => (
              <li key={z.id} className="border-b border-line pb-3">
                <span className="font-medium text-olive">{z.label}</span> · {formatDollars(z.fee)}
                {z.freeDeliveryAt ? `, free over ${formatDollars(z.freeDeliveryAt)}` : ""}
                <span className="block text-muted">{z.description}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.9rem] text-muted">
            Cabin country we know well: {cabinAreas.map((a) => a.name).join(", ")}.{" "}
            <Link href="/delivery" className="text-olive underline underline-offset-4">
              All delivery details
            </Link>
          </p>
        </div>
        <div className="lg:col-span-7">
          <ZoneCalculator />
          <div className="mt-6 rounded-[1.5rem] border border-line bg-paper p-6">
            <p className="font-display text-[1.3rem] text-olive">Manage vacation rentals?</p>
            <p className="mt-2 text-[0.95rem] text-muted">
              We&apos;d love to talk about arrival boxes for your guests, and about fridge handoffs that work for your properties.
            </p>
            <ButtonLink href="/inquire?type=event" variant="text" className="mt-3">
              Get in touch
            </ButtonLink>
          </div>
        </div>
      </section>

      <CTABand
        title="Arrive hungry."
        lede="Order the Cabin Welcome Box up to a few months ahead, or a few days — we'll handle the first spread."
        primary={{ href: `/order/${cabin.slug}`, label: "Order a Cabin Welcome Box" }}
        secondary={{ href: `${routes.store}?category=cabin`, label: "Everything for the cabin" }}
      />
    </>
  );
}
