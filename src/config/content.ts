import { addOns, getProduct } from "@/config/catalog";
import { deliveryWindows, scheduling, servedZones } from "@/config/delivery";
import { eventFees, grazingTables, weddingPackages, weddingRules } from "@/config/events";
import { formatDollars } from "@/lib/money";

/**
 * Editable site content: FAQs and testimonials. Answers are generated from the
 * operational config wherever possible so they never drift from the real rules.
 * `clientInput: true` marks answers the owner still needs to confirm.
 */

export interface FaqItem {
  id: string;
  question: string;
  /** Paragraph shown before `points`. */
  intro?: string;
  /** Optional list shown above `answer`: "lead: text", or with `block` the text on its own line. */
  points?: Array<{ lead: string; text: string; block?: boolean }>;
  /** "paragraphs" sets each point as its own paragraph instead of a bullet. */
  pointsStyle?: "bullets" | "paragraphs";
  /** Closing paragraph; optional when `points` say it all. */
  answer?: string;
  clientInput?: boolean;
}

export interface FaqSection {
  id: string;
  title: string;
  items: FaqItem[];
}

const allergenStatement =
  "Vegetarian, pork-free, gluten-conscious and nut-free versions are available on request. Our kitchen handles milk, wheat, tree nuts, peanuts, sesame, soy, eggs and fish, and every product is assembled on shared surfaces with shared equipment. We can leave ingredients off your order, but we can't promise any product is free of allergens. If anyone in your group has a severe allergy, please contact us before you order.";

export const ALLERGEN_STATEMENT = allergenStatement;

const [, gathering, hosted] = weddingPackages;
const attendant = addOns.find((a) => a.id === "event-attendant")!;

export const faqSections: FaqSection[] = [
  {
    id: "about",
    title: "About Signiorina",
    items: [
      {
        id: "what-is",
        question: "What is Signiorina?",
        answer:
          "Modern Italian-inspired hospitality made mobile — generous, polished, social food that makes any gathering feel beautifully hosted. We serve the Smokies, and we'd love to feed your next gathering. The best part is usually around the table.",
      },
      {
        id: "name",
        question: "Is Signiorina misspelled?",
        answer:
          "On purpose! We tucked a little Irina into signorina—a nod to our chef and the Italian inspiration behind our food.",
      },
      {
        id: "aperitivo",
        question: "What does “modern aperitivo” mean?",
        answer:
          "A ritual, more than a menu. In Italy, aperitivo is the hour between the day and the evening — a drink in hand, something good on a small plate, nobody in a hurry. It's less about any particular dish than about the ritual: slowing down, sharing good things, making people feel looked after. That's what we bring to the Smokies: to the wedding between the vows and the dancing, to the cabin on the first night, to the conference room at noon on a Tuesday. Pranzo, aperitivo, the long table — we borrow the rituals, not the clichés.",
      },
    ],
  },
  {
    id: "ordering",
    title: "Ordering",
    items: [
      {
        id: "notice",
        question: "How much notice do you need?",
        points: [
          { lead: "48 hours", text: "Most boxes & boards (order by noon two days before delivery), plus corporate lunches." },
          { lead: "72 hours", text: "Cabin Welcome Box, Large Gathering Board & Gift Boxes." },
          { lead: `${grazingTables.leadTimeDays} days`, text: "Styled grazing tables." },
          { lead: "14 days", text: "Bridal Suite & Groom’s Room Boards." },
          { lead: "21 days", text: "Guest Welcome Boxes." },
          { lead: `${weddingRules.bookingLeadDays}+ days`, text: "Weddings." },
        ],
        answer: `Wedding guest counts are due ${weddingRules.finalCountDays} days before the event.`,
      },
      {
        id: "deliver",
        question: "Do you deliver?",
        answer: `Yes — every online order is delivered in a scheduled window you choose at checkout. The online delivery minimum is ${formatDollars(scheduling.minimumOrder)}.`,
      },
      {
        id: "where",
        question: "Where do you deliver?",
        points: [
          ...servedZones.map((z) => ({
            lead: `${z.name} — ${formatDollars(z.fee)} delivery${z.freeDeliveryAt ? ` · Free over ${formatDollars(z.freeDeliveryAt)}` : ""}`,
            // "Kodak & Seymour": an ampersand before the last area in each list.
            text: z.description.replace(/ and (?!.* and )/, " & "),
            block: true,
          })),
          { lead: "Beyond these areas", text: "Event travel quoted separately." },
        ],
      },
      {
        id: "prices",
        question: "Are your prices published?",
        answer:
          "Yes. Fixed prices for everything we deliver, and per-guest prices for events — published, not hidden behind a form.",
      },
      {
        id: "fees",
        question: "Are there any hidden fees?",
        answer:
          "No. Delivery, rush and holiday fees are shown before checkout. No service charge, no mandatory gratuity, no card surcharge.",
      },
      {
        id: "times",
        question: "What delivery times are available?",
        points: deliveryWindows.map((w) => ({ lead: w.label, text: w.display })),
        answer: "We’ll send your order out during your selected window. Exact arrival times vary.",
      },
      {
        id: "sundays",
        question: "Do you deliver Sundays?",
        answer: "Not for online orders at the moment. Sundays are reserved for events.",
      },
      {
        id: "same-day",
        question: "Can I order same-day?",
        answer: `Same-day orders aren't available online. If you're inside our usual 48-hour notice, the calendar shows any dates we can still rush for a ${formatDollars(scheduling.rush.fee)} fee — only when there's room in the schedule.`,
      },
      {
        id: "pickup",
        question: "Do you offer pickup?",
        answer: "Not at the moment — every online order is delivered.",
      },
      {
        id: "cabins",
        question: "Do you deliver to cabins?",
        answer:
          "Yes. Cabins are a big part of what we do. At checkout we'll ask about road access, gate codes and steep or gravel driveways so the food arrives the way it should. The Cabin Welcome Box travels in the afternoon window to line up with check-in.",
      },
      {
        id: "leave-at-cabin",
        question: "Can you leave food at my cabin before I arrive?",
        answer:
          "Only when your property manager has authorized refrigerator access and we've confirmed the details with them. Otherwise someone needs to be there to receive it. We never leave perishable food outside or unattended.",
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    items: [
      {
        id: "contents",
        question: "What comes in the boxes?",
        intro: "Five signatures shape our grazing:",
        points: [
          { lead: "Meats", text: "Prosciutto with finocchiona or soppressata." },
          { lead: "Cheeses", text: "Parmigiano and a soft cheese." },
          { lead: "Bread", text: "Focaccia or grissini, plus crackers." },
          { lead: "Antipasti", text: "Castelvetrano olives, marinated artichokes & roasted peppers." },
          { lead: "Finishing touches", text: "Amaretti, biscotti or chocolate, seasonal fruit, rosemary & basil." },
        ],
        answer: "Contents vary by product and season. See each product page for details.",
      },
      {
        id: "customize",
        question: "Can I customize them?",
        answer:
          "You can choose vegetarian, pork-free, gluten-conscious or nut-free versions and add things like burrata, a dolce board or a panini tray. For anything beyond that, tell us about it and we'll see what we can do.",
      },
      {
        id: "vegetarian",
        question: "Do you offer vegetarian options?",
        answer: "Yes, at no extra charge. We replace the meats with extra cheese, marinated vegetables and antipasti.",
      },
      {
        id: "allergies",
        question: "Do you accommodate allergies?",
        pointsStyle: "paragraphs",
        points: [
          {
            lead: "Dietary options",
            text: "Vegetarian, pork-free, gluten-conscious and no-added-nuts options are available on request.",
          },
          {
            lead: "Allergy notice",
            text: "We use shared surfaces and equipment in a kitchen that handles milk, wheat, tree nuts, peanuts, sesame, soy, eggs & fish. Ingredients can be omitted, but no product is guaranteed allergen-free.",
          },
          { lead: "Severe allergies", text: "Contact us before ordering." },
        ],
      },
      {
        id: "gluten",
        question: "Do you offer gluten-free products?",
        answer: `We offer gluten-conscious versions: gluten-free crackers packed separately and focaccia left off where it makes sense. It's +${formatDollars(getProduct("gathering-board-small")?.glutenConsciousFee ?? 5)} per board, or +${formatDollars(eventFees.perPerson.glutenConscious)} per guest for events. Our kitchen handles wheat, so we can't call anything gluten-free.`,
      },
      {
        id: "alcohol",
        question: "Do you provide drinks or alcohol?",
        answer:
          "No. Signiorina doesn't sell, serve or deliver alcohol — the table is ours; the glasses are yours. Any glassware in our photos is the host's own.",
      },
    ],
  },
  {
    id: "weddings",
    title: "Weddings",
    items: [
      {
        id: "book-ahead",
        question: "How far in advance should we book?",
        answer: `At least ${weddingRules.bookingLeadDays} days ahead — earlier for peak Saturdays in May, June, September, October and December. Your final guest count is due ${weddingRules.finalCountDays} days before the wedding.`,
      },
      {
        id: "minimum",
        question: "What is the minimum?",
        points: weddingPackages.map((p) => ({
          lead: p.name,
          text: `${formatDollars(p.minimumFood)}${p.peakSaturdayMinimum ? ` · ${formatDollars(p.peakSaturdayMinimum)} on peak Saturdays` : ""}.`,
        })),
        answer: "These are food minimums. Delivery and tax are additional.",
      },
      {
        id: "included",
        question: "What is included?",
        answer: `Every package includes the styled table, the food, eco plates, napkins and picks, a menu card and allergen card, our serving pieces, and setup and styling. ${gathering.name} adds a tiered display and a couple-name flag. ${hosted.name} adds meal-level grazing, burrata, panini, a dolce section, custom signage, teardown and an attendant.`,
      },
      {
        id: "plates",
        question: "Do you provide plates and serving pieces?",
        answer:
          "Yes. Eco plates, napkins and serving picks are included, and we style the table with our own boards and risers. We collect the pieces afterward.",
      },
      {
        id: "serve",
        question: "Do you stay and serve?",
        answer: `${hosted.name} includes one attendant for three hours per 75 guests. For the other packages we set up, style and step away — you can add an attendant for ${formatDollars(attendant.price)} an hour (${eventFees.attendant.minimumHours}-hour minimum).`,
      },
      {
        id: "welcome-party",
        question: "Can we book Signiorina for the welcome party too?",
        answer: `Please do. Book two or more Signiorina events for the same wedding weekend — a welcome party and cocktail hour, say — and we take ${weddingRules.bundle.foodDiscountPercent}% off the food.`,
      },
      {
        id: "retainer",
        question: "How does booking work?",
        answer: `Tell us about your plans, we'll confirm availability and send a written quote. A ${eventFees.retainerPercent}% nonrefundable retainer reserves your date.`,
      },
    ],
  },
  {
    id: "corporate",
    title: "Corporate",
    items: [
      {
        id: "recurring",
        question: "Do you offer recurring lunches?",
        answer:
          "Yes — the Standing Lunch Program is for offices ordering at least twice a month. You pay the same menu prices and get free delivery where it applies, a priority delivery window and monthly invoicing.",
      },
      {
        id: "invoice",
        question: "Can you invoice businesses?",
        answer: "Monthly invoicing is part of the Standing Lunch Program. One-off orders are paid online at checkout.",
      },
      {
        id: "large",
        question: "Do you accommodate large office orders?",
        answer: `Yes. Pranzo Lunch Boxes start at ${getProduct("pranzo-lunch-box")?.minimumQuantity} and Office Grazing Spreads at ${getProduct("office-grazing-spread")?.minimumQuantity} guests. For very large orders or more than one drop-off, send us an inquiry so we can confirm the schedule for your date.`,
      },
    ],
  },
];

export interface Testimonial {
  quote: string;
  attribution: string;
  context: string;
  placeholder: boolean;
}

/** Placeholders until real reviews exist. Shown with a visible label in development only. */
export const testimonials: Testimonial[] = [
  {
    quote: "Placeholder — a review from a couple whose wedding Signiorina served will go here.",
    attribution: "Wedding couple",
    context: "The Gathering Table",
    placeholder: true,
  },
  {
    quote: "Placeholder — a review from a cabin guest who ordered the Cabin Welcome Box will go here.",
    attribution: "Cabin guest",
    context: "Cabin Welcome Box",
    placeholder: true,
  },
  {
    quote: "Placeholder — a review from an office manager on the Standing Lunch Program will go here.",
    attribution: "Office manager",
    context: "Pranzo Lunch Box",
    placeholder: true,
  },
];
