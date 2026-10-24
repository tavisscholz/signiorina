/**
 * Local landing pages. Each has unique, useful copy — no keyword stuffing.
 * Area facts (zone, fees, ZIPs) come from the delivery config.
 */
export interface AreaPage {
  slug: string;
  areaId: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  highlights: string[];
  productIds: string[];
  media: string;
}

export const areaPages: AreaPage[] = [
  {
    slug: "gatlinburg",
    areaId: "gatlinburg",
    title: "Gatlinburg cabins, weddings + gatherings",
    metaTitle: "Gatlinburg Charcuterie + Cabin Food Delivery · Wedding Grazing Tables",
    metaDescription:
      "Italian-inspired charcuterie delivered to Gatlinburg cabins and Chalet Village, plus styled grazing tables for Gatlinburg weddings. Published prices and afternoon cabin delivery.",
    intro:
      "From Chalet Village to the cabins above the Parkway, Gatlinburg stays begin with a long drive and a steep driveway. We plan for both: afternoon delivery timed to check-in, and the questions about gate codes and gravel asked up front.",
    highlights: [
      "Cabin Welcome Box delivered 2:30–5:00 PM",
      "Styled grazing tables for Gatlinburg weddings and welcome parties",
    ],
    productIds: ["cabin-welcome-box", "box-for-two", "gathering-board-large"],
    media: "cabinEvening",
  },
  {
    slug: "pigeon-forge",
    areaId: "pigeon-forge",
    title: "Pigeon Forge charcuterie delivery",
    metaTitle: "Pigeon Forge Charcuterie Delivery — Boxes, Boards + Cabin Welcome Boxes",
    metaDescription:
      "Charcuterie boxes and boards delivered across Pigeon Forge: cabin arrival suppers, boards for big groups and Box for Two date nights, with published delivery fees.",
    intro:
      "Pigeon Forge is cabin country with a lot of people in each cabin. Our Large Gathering Board feeds twelve to fifteen, and the Cabin Welcome Box makes the first night a sit-down supper instead of a grocery run.",
    highlights: ["Boards for bachelorettes, reunions and big groups", "Box for Two for the quieter weekends"],
    productIds: ["gathering-board-large", "cabin-welcome-box", "box-for-two"],
    media: "gatheringBoardLarge",
  },
  {
    slug: "sevierville",
    areaId: "sevierville",
    title: "Sevierville charcuterie, lunches + events",
    metaTitle: "Sevierville Charcuterie — Boxes, Office Lunches + Grazing Tables",
    metaDescription:
      "Italian-inspired charcuterie in Sevierville: Aperitivo Boxes, Gathering Boards, Pranzo office lunches and styled grazing tables for showers and celebrations.",
    intro:
      "Sevierville sits at the heart of our core zone, where delivery is simplest and every window is open. Office lunches, shower boards and Saturday parties all travel easily here.",
    highlights: ["Pranzo Lunch Boxes for offices", "Styled grazing tables for showers and birthdays"],
    productIds: ["pranzo-lunch-box", "gathering-board-small", "aperitivo-box"],
    media: "gatheringBoardSmall",
  },
  {
    slug: "wears-valley",
    areaId: "wears-valley",
    title: "Wears Valley cabin delivery",
    metaTitle: "Wears Valley Cabin Food Delivery — Cabin Welcome Box + Boards",
    metaDescription:
      "Arrival-night charcuterie for Wears Valley cabins: the Cabin Welcome Box, Box for Two and boards for the whole house, with afternoon delivery and gravel-driveway planning.",
    intro:
      "Wears Valley cabins trade traffic for quiet — and for winding roads. Tell us about the driveway and the gate at checkout, and we'll arrive in the afternoon window with supper for the first night.",
    highlights: ["Afternoon delivery to line up with check-in", "Fridge handoff with your property manager's authorization"],
    productIds: ["cabin-welcome-box", "box-for-two", "gathering-board-small"],
    media: "boxForTwo",
  },
  {
    slug: "knoxville",
    areaId: "knoxville",
    title: "Knoxville corporate lunches + charcuterie",
    metaTitle: "Knoxville Corporate Catering + Charcuterie — Tue/Thu Route Days",
    metaDescription:
      "Knoxville office lunches and charcuterie: Pranzo Lunch Boxes, Office Grazing Spreads and gift boxes, delivered on Tuesday + Thursday route days with published delivery fees.",
    intro:
      "We come to Knoxville on route days, batching office deliveries in the morning and midday windows — which keeps metro delivery affordable, and free for larger corporate orders.",
    highlights: ["Pranzo Lunch Boxes and Office Grazing Spreads", "Standing Lunch Program with monthly invoicing"],
    productIds: ["pranzo-lunch-box", "office-grazing-spread", "gift-box"],
    media: "officeGrazing",
  },
];

export function getAreaPage(slug: string): AreaPage | undefined {
  return areaPages.find((a) => a.slug === slug);
}
