import Link from "next/link";

import { OliveSprig } from "@/components/brand/OliveSprig";
import { Wordmark } from "@/components/brand/Wordmark";
import { deliveryAreas } from "@/config/delivery";
import { flags } from "@/config/flags";
import { site } from "@/config/site";

const classicColumns = [
  {
    title: "Plan",
    links: [
      { href: "/weddings", label: "Weddings" },
      { href: "/gatherings", label: "Gatherings + grazing tables" },
      { href: "/corporate", label: "Corporate" },
      { href: "/inquire", label: "Plan your gathering" },
    ],
  },
  {
    title: "Order online",
    links: [
      { href: "/order", label: "Shop all" },
      { href: "/order/cabin-welcome-box", label: "Cabin Welcome Box" },
      { href: "/order/box-for-two", label: "Box for Two" },
      { href: "/order/pranzo-lunch-box", label: "Pranzo Lunch Box" },
      { href: "/order/signiorina-gift-box", label: "Gift Box" },
    ],
  },
  {
    title: "Good to know",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/delivery", label: "Delivery areas + fees" },
      { href: "/cabin-delivery", label: "Cabin delivery" },
    ],
  },
];

/** threeJourneyArchitectureV2: one column per journey, then the information pages. */
const journeyColumns = [
  {
    title: "Weddings",
    links: [
      { href: "/weddings", label: "Weddings" },
      { href: "/weddings/build", label: "Build Your Table" },
      { href: "/everyday?category=wedding-weekend", label: "Wedding weekend extras" },
    ],
  },
  {
    title: "Events",
    links: [
      { href: "/events", label: "Event packages" },
      { href: "/events/plan", label: "Plan an event" },
      { href: "/corporate", label: "Corporate" },
    ],
  },
  {
    title: "Shop",
    links: [
      { href: "/everyday", label: "Shop Treats" },
      { href: "/order/cabin-welcome-box", label: "Cabin Welcome Box" },
      { href: "/order/box-for-two", label: "Box for Two" },
      { href: "/order/pranzo-lunch-box", label: "Pranzo Lunch Box" },
      { href: "/order/signiorina-gift-box", label: "Gift Box" },
    ],
  },
  {
    title: "Good to know",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: "/delivery", label: "Delivery areas + fees" },
      { href: "/cabin-delivery", label: "Cabin delivery" },
    ],
  },
];

const columns = flags.threeJourneyArchitectureV2 ? journeyColumns : classicColumns;

export function SiteFooter() {
  const areaPages = deliveryAreas.filter((a) => a.pageSlug);
  return (
    <footer className="on-dark relative mt-24 bg-olive pb-28 text-cream md:pb-12">
      <div className="platter-top absolute inset-x-0 -top-10 h-12 bg-olive" aria-hidden="true" />
      <div className="container-page relative pt-14">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="flex flex-col items-start gap-6">
            <Wordmark tone="cream" size="md" />
            <p className="max-w-sm font-display text-[1.45rem] leading-snug text-cream">
              Modern Italian-inspired hospitality for the Smokies — from wedding tables to cabin arrivals to the office lunch.
            </p>
            <OliveSprig className="w-28 text-prosecco/70" />
          </div>
          <div className={flags.threeJourneyArchitectureV2 ? "grid gap-10 sm:grid-cols-2 xl:grid-cols-4" : "grid gap-10 sm:grid-cols-3"}>
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="eyebrow mb-4 text-prosecco">{col.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[0.98rem] text-cream/85 transition-colors hover:text-cream">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-cream/15 pt-8 md:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="eyebrow mb-3 text-prosecco">Where we gather</h2>
            <p className="max-w-2xl text-[0.95rem] leading-relaxed text-cream/80">
              {site.serviceArea.summary} We deliver to cabins, homes, venues and offices around Great Smoky Mountains
              National Park — not inside it.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.9rem]">
              {areaPages.map((a) => (
                <Link key={a.id} href={`/areas/${a.pageSlug}`} className="text-cream/85 underline decoration-cream/30 underline-offset-4 hover:decoration-cream">
                  {a.name}
                </Link>
              ))}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-[0.92rem] text-cream/80 md:items-end md:text-right">
            {site.contact.email ? <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> : null}
            {site.contact.phone ? <a href={`tel:${site.contact.phone}`}>{site.contact.phone}</a> : null}
            <Link href="/inquire" className="text-cream underline decoration-cream/40 underline-offset-4 hover:decoration-cream">
              Questions? Send us a note
            </Link>
            <p>Prices in USD. Sales tax calculated at checkout.</p>
          </div>
        </div>
        <p className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8rem] text-cream/75">
          <span>© Signiorina. Good people, beautiful food, anywhere.</span>
          <span aria-hidden="true">·</span>
          <Link href="/privacy" className="underline decoration-cream/30 underline-offset-4 hover:text-cream hover:decoration-cream">
            Privacy Policy
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="underline decoration-cream/30 underline-offset-4 hover:text-cream hover:decoration-cream">
            Terms of Use
          </Link>
        </p>
      </div>
    </footer>
  );
}
