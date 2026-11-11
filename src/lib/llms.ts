import { activeProducts } from "@/config/catalog";
import { deliveryAreas, deliveryWindows, scheduling, servedZones } from "@/config/delivery";
import { eventFees, grazingTables, weddingPackages, weddingRules } from "@/config/events";
import { site } from "@/config/site";
import { eventPackageViews } from "@/lib/event-packages";
import { formatDollars } from "@/lib/money";

/**
 * The text of /llms.txt — a plain-text summary of the business for AI assistants (llmstxt.org).
 * Built from the same config as the pages, so prices, areas and rules can't drift from what the
 * site says. Facts only: nothing that isn't published on the site, and nothing addressed to the
 * reader. Paused areas and unapproved package names stay out, as they do on the pages.
 */
export function llmsTxt(): string {
  const url = (path: string) => `${site.url}${path}`;
  const products = activeProducts();
  const leadTimes = products.map((p) => p.leadTimeDays);
  const events = eventPackageViews(false);
  const contact = [
    site.contact.email ? `- Email: ${site.contact.email}` : null,
    site.contact.phone ? `- Phone: ${site.contact.phone}` : null,
    site.contact.instagram ? `- Instagram: ${site.contact.instagram}` : null,
    `- Wedding and event inquiries: ${url("/inquire")}`,
  ].filter(Boolean);

  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.descriptor} in the Great Smoky Mountains, Tennessee: styled grazing tables for weddings and events, and boxes and boards delivered to homes, cabins and offices.`,
    "",
    `${site.positioning} The spelling "${site.name}" (with the extra "i") is intentional.`,
    "",
    "## Weddings",
    `Styled grazing tables for Smoky Mountain weddings, best for ${weddingRules.focusGuestRange}. Book at least ${weddingRules.bookingLeadDays} days ahead; a ${eventFees.retainerPercent}% nonrefundable retainer holds the date.`,
    ...weddingPackages.map(
      (p) =>
        `- ${p.name}: ${formatDollars(p.pricePerPerson)} per guest, ${formatDollars(p.minimumFood)} food minimum. ${p.bestFor.join(", ")}. ${p.portion}.`,
    ),
    `- Details and the planner: ${url("/weddings")}`,
    "",
    "## Events and parties",
    `Styled grazing tables for birthdays, showers, corporate gatherings and private parties. ${formatDollars(grazingTables.minimumFood)} food minimum, ${grazingTables.minimumGuests} guests or more, ${grazingTables.leadTimeDays} days' notice; setup is billed separately.`,
    ...events.map((e) => `- ${e.name}: ${formatDollars(e.tier.pricePerPerson)} per guest. ${e.tier.portion}. ${e.subline}`),
    `- Details and the planner: ${url("/events")}`,
    "",
    "## Boxes and boards (order online for delivery)",
    ...products.map((p) => `- ${p.name}: ${formatDollars(p.price)} (${p.serves}). ${p.tagline} ${url(`/order/${p.slug}`)}`),
    `- Shop: ${url("/everyday")}`,
    "",
    "## Where we deliver",
    ...servedZones.map((z) => {
      const areas = deliveryAreas.filter((a) => a.zone === z.id).map((a) => a.name);
      const free = z.freeDeliveryAt ? `, free on orders of ${formatDollars(z.freeDeliveryAt)} or more` : "";
      return `- ${z.label}: ${areas.join(", ")}. Delivery ${formatDollars(z.fee)}${free}.`;
    }),
    `- Delivery areas and fees: ${url("/delivery")}`,
    "",
    "## Ordering",
    `- Order online by ${scheduling.cutoffHour === 12 ? "noon" : `${scheduling.cutoffHour}:00`}, ${Math.min(...leadTimes)}–${Math.max(...leadTimes)} days before delivery depending on the item.`,
    `- Minimum online order: ${formatDollars(scheduling.minimumOrder)}.`,
    `- Delivery windows: ${deliveryWindows.map((w) => `${w.label} ${w.display}`).join("; ")}.`,
    ...(scheduling.sunday.directDelivery ? [] : ["- Sundays are for events only; no online delivery."]),
    ...(scheduling.pickup.enabled ? [] : ["- Delivery only; no pickup."]),
    "- No service charge, no mandatory gratuity and no card surcharge.",
    "",
    "## Key pages",
    `- Weddings: ${url("/weddings")}`,
    `- Events: ${url("/events")}`,
    `- Shop: ${url("/everyday")}`,
    `- Corporate: ${url("/corporate")}`,
    `- Cabin delivery: ${url("/cabin-delivery")}`,
    `- Delivery areas and fees: ${url("/delivery")}`,
    `- FAQ: ${url("/faq")}`,
    `- About: ${url("/about")}`,
    "",
    "## Contact",
    ...contact,
    "",
  ];
  return lines.join("\n");
}
