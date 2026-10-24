import type { Metadata } from "next";
import Link from "next/link";

import { OliveSprig } from "@/components/brand/OliveSprig";
import { Photo } from "@/components/brand/Photo";
import { PriceOval, SectionHeading } from "@/components/brand/SectionHeading";
import { ProductCard } from "@/components/commerce/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { CTABand, ProcessSteps, Testimonials } from "@/components/sections/Sections";
import { ButtonLink } from "@/components/ui/Button";
import { IconArrow, IconClock, IconLock, IconPin } from "@/components/ui/Icons";
import { getProduct } from "@/config/catalog";
import { deliveryWindows } from "@/config/delivery";
import { weddingPackages, weddingRules } from "@/config/events";
import { formatDollars } from "@/lib/money";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Signiorina — Modern Italian-Inspired Charcuterie + Hospitality in the Smokies",
  description:
    "Modern Italian-inspired grazing for Smoky Mountain weddings, cabin weekends, office lunches and tables worth gathering around. Published prices, delivery across Sevierville, Pigeon Forge, Gatlinburg and Knoxville.",
  path: "/",
});

const pathways = [
  {
    eyebrow: "Weddings",
    title: "Tables worth gathering around.",
    body: "Cocktail hours, welcome parties and micro-wedding receptions, styled and set before the first guest arrives.",
    href: "/weddings",
    cta: "Explore weddings",
    media: "weddingTable",
  },
  {
    eyebrow: "Cabin + gatherings",
    title: "Arrive hungry. We'll handle the first spread.",
    body: "Arrival suppers, boards for the whole house and styled tables for showers, birthdays and reunions.",
    href: "/cabin-delivery",
    cta: "Explore cabin delivery",
    media: "cabinEvening",
  },
  {
    eyebrow: "Corporate",
    title: "Office food without the office-food feeling.",
    body: "Pranzo lunch boxes, grazing spreads for the conference room and a standing lunch program on Knoxville route days.",
    href: "/corporate",
    cta: "Explore corporate",
    media: "pranzoLunchBox",
  },
];

const featured = ["box-for-two", "gathering-board-small", "cabin-welcome-box", "gift-box"].map((id) => getProduct(id)!);

export default function HomePage() {
  const cabinBox = getProduct("cabin-welcome-box")!;
  const pranzo = getProduct("pranzo-lunch-box")!;
  const spread = getProduct("office-grazing-spread")!;
  const afternoon = deliveryWindows.find((w) => w.id === "afternoon")!;

  return (
    <>
      {/* HERO ------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-12 pb-16 pt-10 md:pt-14 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-6 xl:col-span-6">
            <Reveal>
              <p className="eyebrow flex flex-col gap-1 text-olive-soft sm:flex-row sm:items-center sm:gap-3">
                <span>Modern Aperitivo</span>
                <span aria-hidden="true" className="hidden h-px w-6 bg-olive/40 sm:block" />
                <span>Mobile charcuterie + hospitality</span>
              </p>
              <h1 className="display-xl mt-6 text-olive">
                Good things, <span className="accent">generously</span> served.
              </h1>
              <p className="lede mt-7 max-w-xl text-muted">
                Modern Italian-inspired grazing for Smoky Mountain weddings, cabin weekends, office lunches and tables
                worth gathering around.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/weddings" size="lg">
                  Plan a wedding
                </ButtonLink>
                <ButtonLink href="/order" variant="secondary" size="lg">
                  Order online
                </ButtonLink>
              </div>
              <p className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-[0.88rem] text-muted">
                <span>Wedding tables from {formatDollars(weddingPackages[0].pricePerPerson)}/guest</span>
                <span aria-hidden="true">·</span>
                <span>Boxes from {formatDollars(getProduct("aperitivo-box")!.price)}</span>
                <span aria-hidden="true">·</span>
                <span>Every fee shown up front</span>
              </p>
            </Reveal>
          </div>

          <div className="relative lg:col-span-6 xl:col-span-6">
            <div className="relative mx-auto aspect-[5/6] w-full max-w-[36rem] lg:mr-0">
              <Reveal variant="oval" className="absolute right-0 top-0 h-[92%] w-[74%]">
                <Photo
                  media="boxForTwo"
                  shape="arch"
                  priority
                  className="h-full w-full"
                  sizes="(min-width: 1024px) 34vw, 70vw"
                  position="50% 45%"
                />
              </Reveal>
              <Reveal delay={300} className="absolute bottom-0 left-0 w-[44%]">
                <Photo
                  media="weddingTable"
                  shape="oval"
                  className="aspect-[4/5] w-full border-[7px] border-cream shadow-[var(--shadow-lift)]"
                  sizes="(min-width: 1024px) 18vw, 40vw"
                />
              </Reveal>
              <Reveal delay={500} className="absolute left-[2%] top-[8%] hidden w-[38%] sm:block">
                <div className="menu-card rotate-[-3deg] rounded-sm px-5 py-6 text-center">
                  <OliveSprig className="mx-auto w-14 text-olive/70" />
                  <p className="eyebrow mt-3 text-[0.6rem] text-olive-soft">Aperitivo</p>
                  <ul className="mt-3 space-y-1.5 font-display text-[0.98rem] italic leading-tight text-olive">
                    <li>Prosciutto + figs</li>
                    <li>Parmigiano, honey</li>
                    <li>Warm focaccia</li>
                    <li>Something sweet</li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STATEMENT -------------------------------------------- */}
      <section className="border-y border-line bg-paper">
        <div className="container-page grid gap-10 py-20 md:py-28 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionHeading eyebrow="The idea" title={<>A beautiful reason to <span className="accent">gather.</span></>} />
          </Reveal>
          <Reveal delay={150} className="lg:col-span-7">
            <p className="font-display text-[clamp(1.4rem,2.4vw,2rem)] leading-[1.35] text-espresso">
              Aperitivo is less a menu than a habit: slowing down, sharing something good, making people feel looked after.
              Signiorina brings that to wherever you&apos;re already gathering — grazing tables for the middle of the
              celebration, generous boards for the cabin, lunches worth leaving your desk for, and thoughtfully packed boxes
              for everything in between.
            </p>
            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-[0.95rem] text-muted sm:grid-cols-3">
              {["Grazing tables", "Wedding experiences", "Generous boards", "Corporate lunches", "Cabin arrival spreads", "Packed-to-go boxes"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span aria-hidden="true" className="h-2.5 w-3.5 rounded-[50%] border border-olive/50" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* THREE PATHWAYS ---------------------------------------------- */}
      <section className="container-page py-20 md:py-28" aria-labelledby="pathways-title">
        <h2 id="pathways-title" className="sr-only">
          Three ways to gather with Signiorina
        </h2>
        <div className="grid gap-10 md:grid-cols-3 md:gap-6 lg:gap-10">
          {pathways.map((p, i) => (
            <Reveal key={p.href} delay={i * 120}>
              <Link href={p.href} className="group flex h-full flex-col">
                <Photo
                  media={p.media}
                  shape="arch"
                  className="aspect-[4/5] w-full"
                  sizes="(min-width: 768px) 30vw, 92vw"
                  zoom
                />
                <p className="eyebrow mt-7 text-olive-soft">{p.eyebrow}</p>
                <h3 className="display-sm mt-3 text-olive">{p.title}</h3>
                <p className="mt-3 text-[0.98rem] text-muted">{p.body}</p>
                <span className="label-caps mt-5 inline-flex items-center gap-2 text-[0.7rem] text-olive">
                  {p.cta}
                  <IconArrow size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* WEDDING FEATURE --------------------------------------------- */}
      <section className="on-dark relative bg-olive text-cream" aria-labelledby="wedding-feature">
        <div className="platter-top absolute inset-x-0 -top-10 h-12 bg-olive" aria-hidden="true" />
        <div className="container-page py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-7">
              <SectionHeading
                tone="light"
                eyebrow="Weddings"
                title={
                  <span id="wedding-feature">
                    Made for the <span className="accent">middle</span> of the celebration.
                  </span>
                }
                lede={`Three ways to feed a wedding of ${weddingRules.focusGuestRange} — cocktail hour to the whole reception — with the price per guest right here, not hidden behind a form.`}
              />
            </Reveal>
            <Reveal delay={150} className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
              <ButtonLink href="/weddings" variant="light" size="lg">
                Explore weddings
              </ButtonLink>
              <ButtonLink href="/inquire?type=wedding" variant="outline-light" size="lg">
                Plan a wedding
              </ButtonLink>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {weddingPackages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={i * 120}>
                <article className="flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-cream/15 bg-olive-deep/50">
                  <Photo media={pkg.image} className="aspect-[3/2] w-full" sizes="(min-width: 768px) 30vw, 92vw" zoom />
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <h3 className="display-sm text-cream">{pkg.name}</h3>
                    <p className="accent text-[1.08rem] text-cream/80">{pkg.line}</p>
                    <p className="mt-auto flex items-baseline gap-2 border-t border-cream/15 pt-4">
                      <span className="price text-[2.2rem] leading-none text-cream">{formatDollars(pkg.pricePerPerson)}</span>
                      <span className="text-[0.88rem] text-cream/80">per guest · {formatDollars(pkg.minimumFood)} minimum</span>
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-[0.9rem] text-cream/80">
            Also for the wedding weekend: bridal suite and groom&apos;s room boards, welcome parties, rehearsal tables and guest
            welcome boxes. Book two or more and take {weddingRules.bundle.foodDiscountPercent}% off the food.
          </p>
        </div>
        <div className="platter-bottom absolute inset-x-0 -bottom-10 h-12 bg-olive" aria-hidden="true" />
      </section>

      {/* DIRECT ORDER FEATURE ---------------------------------------- */}
      <section className="container-page pb-16 pt-28 md:pb-24 md:pt-36" aria-labelledby="shop-feature">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              eyebrow="Order online"
              title={
                <span id="shop-feature">
                  Little lunches. Long tables. <span className="accent">Everything between.</span>
                </span>
              }
              lede="Fixed prices, delivery windows you choose, and no form to fill in first."
            />
          </Reveal>
          <Reveal delay={120}>
            <ButtonLink href="/order" variant="secondary">
              Shop all
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
      </section>

      {/* CABIN FEATURE ----------------------------------------------- */}
      <section className="bg-linen/60" aria-labelledby="cabin-feature">
        <div className="container-page grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-16">
          <Reveal variant="oval" className="relative lg:col-span-6">
            <Photo media="cabinEvening" shape="oval" className="mx-auto aspect-[4/5] w-full max-w-[32rem]" sizes="(min-width: 1024px) 40vw, 92vw" />
            <PriceOval tone="olive" className="absolute bottom-8 right-4 px-6 py-4 text-[1.4rem] md:right-12">
              {formatDollars(cabinBox.price)}
            </PriceOval>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-6">
            <SectionHeading
              eyebrow="Smoky Mountain signature"
              title={
                <span id="cabin-feature">
                  Check in. Unpack. <span className="accent">Gather.</span>
                </span>
              }
              lede="A generous first-night spread delivered to your Smoky Mountain stay — supper, not snacks, for four to six."
            />
            <p className="mt-6 text-muted">
              Italian meats and cheeses, a whole focaccia, fresh mozzarella, marinated vegetables, olive oil for dipping and
              something sweet, with a printed card on how to set it all out. Your first night is handled.
            </p>
            <ul className="mt-8 flex flex-col gap-4 border-t border-line pt-6 text-[0.95rem]">
              <li className="flex gap-3">
                <IconClock size={20} className="mt-0.5 shrink-0 text-olive" />
                <span>
                  Delivered in the afternoon window, {afternoon.display}, to line up with check-in.
                </span>
              </li>
              <li className="flex gap-3">
                <IconPin size={20} className="mt-0.5 shrink-0 text-olive" />
                <span>Gatlinburg, Pigeon Forge, Wears Valley, Sevierville and the cabins around them.</span>
              </li>
              <li className="flex gap-3">
                <IconLock size={20} className="mt-0.5 shrink-0 text-olive" />
                <span>Handed to you, or into the fridge with your property manager&apos;s go-ahead. Never left outside.</span>
              </li>
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href={`/order/${cabinBox.slug}`} size="lg">
                Order a Cabin Welcome Box
              </ButtonLink>
              <ButtonLink href="/cabin-delivery" variant="text">
                How cabin delivery works
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CORPORATE FEATURE ------------------------------------------- */}
      <section className="container-page py-20 md:py-28" aria-labelledby="corporate-feature">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              eyebrow="Corporate"
              title={
                <span id="corporate-feature">
                  Corporate catering without the <span className="accent">corporate catering</span> energy.
                </span>
              }
              lede="Lunch your team actually looks forward to, delivered on schedule — with Tuesday and Thursday route days for Knoxville offices."
            />
            <ButtonLink href="/corporate" className="mt-9" size="lg">
              Corporate ordering
            </ButtonLink>
          </Reveal>
          <div className="lg:col-span-7">
            <ul className="divide-y divide-line border-y border-line">
              {[
                {
                  name: pranzo.name,
                  line: pranzo.tagline,
                  price: `${formatDollars(pranzo.price)} each`,
                  note: `${pranzo.minimumQuantity}-box minimum`,
                  href: `/order/${pranzo.slug}`,
                },
                {
                  name: spread.name,
                  line: "Drop-off grazing for meetings and celebrations.",
                  price: `${formatDollars(spread.price)} / guest`,
                  note: `${spread.minimumQuantity}-guest minimum`,
                  href: `/order/${spread.slug}`,
                },
                {
                  name: "Standing Lunch Program",
                  line: "Order twice a month or more for free delivery where it applies, a priority window and monthly invoicing.",
                  price: "Menu prices",
                  note: "No discount games",
                  href: "/corporate#standing-lunch",
                },
              ].map((o, i) => (
                <Reveal as="li" key={o.name} delay={i * 100}>
                  <Link href={o.href} className="group grid grid-cols-[1fr_auto] items-center gap-6 py-7">
                    <div>
                      <h3 className="display-sm text-olive group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                        {o.name}
                      </h3>
                      <p className="mt-1.5 text-[0.95rem] text-muted">{o.line}</p>
                    </div>
                    <div className="text-right">
                      <p className="price text-[1.5rem] text-olive">{o.price}</p>
                      <p className="text-[0.8rem] uppercase tracking-[0.14em] text-muted">{o.note}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PROCESS ----------------------------------------------------- */}
      <section className="border-y border-line bg-paper" aria-labelledby="how-it-works">
        <div className="container-page py-20 md:py-28">
          <SectionHeading eyebrow="How it works" title={<span id="how-it-works">Two easy ways in.</span>} align="center" />
          <div className="mt-16 grid gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
            <div>
              <h3 className="label-caps mb-8 flex items-center gap-3 text-olive">
                <span className="rounded-full bg-olive px-3 py-1 text-[0.65rem] text-cream">Plan</span>
                Weddings + events
              </h3>
              <ProcessSteps
                steps={[
                  { title: "Tell us where you're gathering.", body: "The date, the place, the guest count and the kind of evening you're picturing." },
                  { title: "We shape the spread.", body: "A package and menu that fit, with a written quote — every fee itemized." },
                  { title: "We bring it together beautifully.", body: "We arrive, style the table, and leave you to the good part." },
                ]}
              />
              <ButtonLink href="/inquire" className="mt-10">
                Plan your gathering
              </ButtonLink>
            </div>
            <div className="lg:border-l lg:border-line lg:pl-16">
              <h3 className="label-caps mb-8 flex items-center gap-3 text-olive">
                <span className="rounded-full border border-olive px-3 py-1 text-[0.65rem]">Order</span>
                Boxes, boards + lunches
              </h3>
              <ol className="flex flex-col gap-6">
                {[
                  { word: "Choose.", body: "Fixed prices, sizes for one to fifteen, dietary versions built in." },
                  { word: "Schedule.", body: "Pick your date and one of three delivery windows. Fees shown before you pay." },
                  { word: "We deliver.", body: "Fresh, packed and on its way in your window." },
                ].map((s, i) => (
                  <Reveal as="li" key={s.word} delay={i * 100} className="flex items-baseline gap-5">
                    <span className="display-md accent text-olive">{s.word}</span>
                    <span className="text-[0.95rem] text-muted">{s.body}</span>
                  </Reveal>
                ))}
              </ol>
              <ButtonLink href="/order" variant="secondary" className="mt-10">
                Order online
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
      <CTABand />
    </>
  );
}
