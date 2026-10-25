import { Parisienne } from "next/font/google";
import Link from "next/link";

import { Photo } from "@/components/brand/Photo";
import { SectionHeading } from "@/components/brand/SectionHeading";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ZoneCalculator } from "@/components/commerce/ZoneCalculator";
import { JourneyCards } from "@/components/journeys/JourneyCards";
import { AmbientLoop } from "@/components/motion/AmbientLoop";
import { Reveal } from "@/components/motion/Reveal";
import { FaqList } from "@/components/sections/FaqList";
import { Testimonials } from "@/components/sections/Sections";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Notice";
import { getProduct } from "@/config/catalog";
import { faqSections } from "@/config/content";
import { deliveryWindows, zones } from "@/config/delivery";
import { grazingTables, weddingPackages, weddingRules } from "@/config/events";
import { ambientLoops } from "@/config/media";
import { site } from "@/config/site";
import { eventPackageViews } from "@/lib/event-packages";
import { formatDollars } from "@/lib/money";

// The script half of the hero headline. Loaded here, not in the layout, so only the homepage downloads it.
const script = Parisienne({ weight: "400", subsets: ["latin"], display: "swap" });

const featured = ["box-for-two", "gathering-board-small", "cabin-welcome-box", "gift-box"].map((id) => getProduct(id)!);
const homeFaq = ["notice", "where", "cabins", "allergies"]
  .map((id) => faqSections.flatMap((s) => s.items).find((i) => i.id === id))
  .filter((i) => i !== undefined);

/**
 * Homepage for threeJourneyArchitectureV2: one brand, three entrances. The first screen
 * answers what Signiorina is and offers Weddings, Events and Shop; the sections below
 * follow the same order, then sell the brand and point back into a journey.
 */
export function HomeJourneys() {
  const packages = eventPackageViews();
  return (
    <>
      {/* HERO + THE FORK -------------------------------------------- */}
      <section className="relative overflow-hidden" aria-labelledby="home-title">
        <div className="container-page pb-14 pt-4 sm:pt-8 md:pb-20 lg:pt-8">
          <div className="lg:grid lg:grid-cols-12 lg:items-center lg:gap-10">
            {/* Visible from the first frame (see .hero-enter). */}
            <div className="hero-enter lg:col-span-7">
              <p className="eyebrow hidden items-center gap-3 text-olive-soft sm:flex">
                <span>Modern Aperitivo</span>
                <span aria-hidden="true" className="h-px w-6 bg-olive/40" />
                <span>Mobile charcuterie + hospitality</span>
              </p>
              <h1
                id="home-title"
                className="font-display text-[min(12vw,3rem)] leading-[0.98] tracking-[-0.01em] text-olive sm:mt-5 sm:text-[clamp(2.8rem,6.4vw,5.6rem)]"
              >
                Charcuterie{" "}
                <span className={`${script.className} block text-[1.02em] leading-[1.18] tracking-normal`}>Beautifully Done</span>
              </h1>
              <p className="mt-3 max-w-xl text-[0.95rem] leading-normal text-muted sm:mt-5 sm:text-[1.15rem] sm:leading-relaxed">
                Italian-inspired, delivered for everyday enjoyment, celebrations and weddings.
              </p>
            </div>
            <div className="hero-enter relative hidden h-[19rem] lg:col-span-5 lg:block" style={{ ["--hero-delay" as string]: "150ms" }}>
              <div className="arch absolute right-0 top-0 h-full w-[56%]">
                <Photo media="boxForTwo" priority className="hero-settle h-full w-full" sizes="20vw" position="50% 45%" alt="" />
              </div>
              <div className="absolute bottom-0 left-[22%] w-[min(50%,15rem)] xl:left-[14%]">
                <Photo
                  media="irina"
                  shape="oval"
                  priority
                  className="aspect-[4/5] w-full border-[6px] border-cream shadow-[var(--shadow-lift)]"
                  sizes="15rem"
                  position="50% 30%"
                />
                {/* A handwritten sign-off beside the oval. */}
                <p
                  className={`${script.className} absolute bottom-[16%] right-full mr-3 -rotate-6 whitespace-nowrap text-right text-[1.55rem] leading-[1.05] text-olive xl:text-[1.95rem]`}
                >
                  Con Amore
                  <span className="block pr-1 text-[0.82em]">– Chef Irina</span>
                </p>
              </div>
            </div>
          </div>

          <div className="hero-enter mt-5 md:mt-8" style={{ ["--hero-delay" as string]: "100ms" }}>
            <h2 className="sr-only">Where would you like to start?</h2>
            <JourneyCards location="home-hero" priority headingLevel="h3" />
          </div>
        </div>
      </section>

      {/* WEDDINGS: BRAND SHOWCASE ----------------------------------- */}
      <section className="on-dark relative isolate overflow-hidden bg-espresso" aria-labelledby="wedding-showcase">
        <AmbientLoop loop={ambientLoops.idea} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-espresso/72 lg:bg-transparent lg:bg-linear-to-r lg:from-espresso/90 lg:via-espresso/75 lg:to-espresso/55"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-espresso/70 to-transparent" />
        <div className="container-page relative grid gap-12 py-24 [text-shadow:0_1px_16px_rgb(36_35_31/0.45)] md:py-32 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionHeading
              tone="white"
              eyebrow="Weddings"
              title={
                <span id="wedding-showcase">
                  A table worth <span className="accent">gathering</span> around.
                </span>
              }
              lede={`Styled grazing for Smoky Mountain weddings of ${weddingRules.focusGuestRange}, from cocktail hour to the whole reception. Start from a favorite or build your own, and watch the estimate as you go.`}
            />
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/weddings/build" variant="light" size="lg">
                Build Your Table
              </ButtonLink>
              <ButtonLink href="/weddings" variant="outline-light" size="lg">
                Explore weddings
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={150} as="ul" className="flex flex-col divide-y divide-white/20 border-y border-white/20 lg:col-span-5">
            {weddingPackages.map((pkg) => (
              <li key={pkg.id} className="flex items-baseline justify-between gap-4 py-4">
                <span>
                  <span className="block font-display text-[1.35rem] text-white">{pkg.name}</span>
                  <span className="text-[0.88rem] text-white/80">{pkg.bestFor.slice(0, 2).join(" · ")}</span>
                </span>
                <span className="price shrink-0 text-[1.35rem] text-white">
                  {formatDollars(pkg.pricePerPerson)}
                  <span className="text-[0.85rem] text-white/80">/guest</span>
                </span>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* EVENTS: PACKAGE PREVIEWS ----------------------------------- */}
      <section className="container-page py-20 md:py-28" aria-labelledby="events-feature">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Events"
              title={
                <span id="events-feature">
                  Three ways to <span className="accent">host a crowd.</span>
                </span>
              }
              lede={`Styled grazing tables for birthdays, showers, graduations and office gatherings of ${grazingTables.minimumGuests} or more — priced per guest and set up on site.`}
            />
          </Reveal>
          <Reveal delay={120}>
            <ButtonLink href="/events" variant="secondary">
              Explore Packages
            </ButtonLink>
          </Reveal>
        </div>
        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {packages.map((pkg, i) => (
            <Reveal as="li" key={pkg.tierId} delay={i * 110}>
              <Link
                href={`/events#package-${pkg.tierId}`}
                className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-paper transition-shadow hover:shadow-[var(--shadow-card)]"
              >
                <Photo media={pkg.image} className="aspect-[3/2] w-full" sizes="(min-width: 768px) 30vw, 92vw" zoom alt="" />
                <div className="flex flex-1 flex-col gap-2 p-6">
                  {pkg.proposed ? (
                    <Badge tone="fig" className="self-start">
                      Proposed name
                    </Badge>
                  ) : null}
                  <h3 className="display-sm text-olive">{pkg.name}</h3>
                  <p className="text-[0.95rem] text-muted">{pkg.subline}</p>
                  <p className="mt-auto flex items-baseline gap-2 border-t border-line pt-4">
                    <span className="price text-[1.9rem] leading-none text-olive">{formatDollars(pkg.tier.pricePerPerson)}</span>
                    <span className="text-[0.88rem] text-muted">
                      per guest · {formatDollars(grazingTables.minimumFood)} minimum
                    </span>
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* EVERYDAY: FEATURED PRODUCTS -------------------------------- */}
      <section className="border-y border-line bg-paper" aria-labelledby="everyday-feature">
        <div className="container-page py-20 md:py-28">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <SectionHeading
                eyebrow="Shop"
                title={
                  <span id="everyday-feature">
                    Little lunches. Long tables. <span className="accent">Everything between.</span>
                  </span>
                }
                lede="Boxes and boards at fixed prices, delivered in a window you choose. No form to fill in first."
              />
            </Reveal>
            <Reveal delay={120}>
              <ButtonLink href="/everyday" variant="secondary">
                Shop Treats
              </ButtonLink>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OWNER STORY ------------------------------------------------ */}
      <section className="bg-linen/60" aria-labelledby="meet-irina">
        <div className="container-page grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-16">
          <Reveal variant="oval" className="lg:col-span-5">
            <Photo
              media="irina"
              shape="oval"
              className="mx-auto aspect-[4/5] w-full max-w-[24rem]"
              sizes="(min-width: 1024px) 30vw, 80vw"
              position="50% 30%"
            />
          </Reveal>
          <Reveal delay={120} className="lg:col-span-7">
            <SectionHeading eyebrow="Who we are" title={<span id="meet-irina">Meet Chef Irina.</span>} />
            {site.showPlaceholders ? (
              <div className="relative mt-8 rounded-[1.5rem] border border-dashed border-olive/30 bg-paper p-7">
                <Badge tone="fig" className="absolute -top-3 left-6">
                  Placeholder — story + credentials to come
                </Badge>
                <p className="text-muted">
                  Reserved for Irina&apos;s story, in Irina&apos;s own words — the hospitality background, why Italian
                  hosting, why the Smokies — plus any training or credentials worth sharing. Hidden on the live site until
                  supplied.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-[1.05rem] text-muted">
                Signiorina serves the Smokies and Knoxville. We&apos;d love to feed your next gathering.
              </p>
            )}
            <ButtonLink href="/about" variant="text" className="mt-8">
              About Chef Irina
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <Testimonials />

      {/* SERVICE AREA, DELIVERY + QUESTIONS ------------------------- */}
      <section className="container-page grid gap-14 py-20 md:py-28 lg:grid-cols-2 lg:gap-16" aria-labelledby="where-we-deliver">
        <div>
          <SectionHeading
            eyebrow="Service area"
            title={<span id="where-we-deliver">Where we deliver.</span>}
            lede={site.serviceArea.summary}
            size="md"
          />
          <ul className="mt-8 flex flex-col gap-2 text-[0.95rem] text-muted">
            <li>
              Delivery {zones.map((z) => formatDollars(z.fee)).join(" / ")} by zone, shown before you pay.
            </li>
            <li>Windows: {deliveryWindows.map((w) => `${w.label.toLowerCase()} ${w.display}`).join(" · ")}.</li>
            <li>Homes, cabins, venues and offices around the national park — never inside it.</li>
          </ul>
          <ZoneCalculator className="mt-8" />
        </div>
        <div>
          <h2 className="display-md text-olive">Good to know</h2>
          <FaqList items={homeFaq} className="mt-6" />
          <ButtonLink href="/faq" variant="text" className="mt-6">
            All questions
          </ButtonLink>
        </div>
      </section>

      {/* THE THREE JOURNEYS, AGAIN ---------------------------------- */}
      <section className="on-dark relative bg-olive text-cream" aria-labelledby="start-here">
        <div className="platter-top absolute inset-x-0 -top-10 h-12 bg-olive" aria-hidden="true" />
        <div className="container-page py-20 md:py-24">
          <SectionHeading tone="light" title={<span id="start-here">Where would you like to start?</span>} align="center" size="md" />
          <JourneyCards location="home-footer" tone="dark" headingLevel="h3" className="mt-12" />
          <p className="mt-10 text-center text-[0.95rem] text-cream/85">Every price published. Every fee shown before you pay.</p>
        </div>
      </section>
    </>
  );
}
