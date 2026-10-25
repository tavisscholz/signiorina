import type { StaticImageData } from "next/image";

import aperitivoBox from "@/assets/images/aperitivo-box.jpg";
import boardLargeWide from "@/assets/images/board-large-wide.jpg";
import boxForTwoWide from "@/assets/images/box-for-two-wide.jpg";
import boxForTwo from "@/assets/images/box-for-two.jpg";
import bridalSuite from "@/assets/images/bridal-suite.jpg";
import cabinEvening from "@/assets/images/cabin-evening.jpg";
import gatheringBoardLarge from "@/assets/images/gathering-board-large.jpg";
import gatheringBoardSmall from "@/assets/images/gathering-board-small.jpg";
import groomsRoom from "@/assets/images/grooms-room.jpg";
import irina from "@/assets/images/irina.jpg";
import irinaBoard from "@/assets/images/irina-board.jpg";
import officeGrazingWide from "@/assets/images/office-grazing-wide.jpg";
import officeGrazing from "@/assets/images/office-grazing.jpg";
import pranzoLunchBox from "@/assets/images/pranzo-lunch-box.jpg";
import vbAbundantBoard from "@/assets/images/vb-abundant-board.jpg";
import vbApron from "@/assets/images/vb-apron.jpg";
import vbCandlelitTable from "@/assets/images/vb-candlelit-table.jpg";
import vbFigsProsciutto from "@/assets/images/vb-figs-prosciutto.jpg";
import vbGiftBoxes from "@/assets/images/vb-gift-boxes.jpg";
import vbMenuCard from "@/assets/images/vb-menu-card.jpg";
import vbOfficeGathering from "@/assets/images/vb-office-gathering.jpg";
import vbWaxSeal from "@/assets/images/vb-wax-seal.jpg";
import vbWeddingTable from "@/assets/images/vb-wedding-table.jpg";

export interface MediaItem {
  src: StaticImageData;
  alt: string;
  /**
   * "mockup" = launch mockup imagery from the vision board / product renders.
   * Replace with owned photography per the shot list in README before launch.
   */
  status: "mockup" | "final";
  /** Brief for the replacement photograph. */
  shot: string;
}

export const media = {
  aperitivoBox: {
    src: aperitivoBox,
    alt: "An individual cream box with parmigiano, salame, grapes, a halved fig and a bowl of marinated antipasti",
    status: "mockup",
    shot: "Single Aperitivo Box, three-quarter angle, hand lifting a fig.",
  },
  boxForTwo: {
    src: boxForTwo,
    alt: "A cream gift box filled with prosciutto, salame, focaccia sandwiches, olives, whipped ricotta, honey, figs, berries and sliced cheeses",
    status: "mockup",
    shot: "Box for Two on a cabin porch rail at golden hour, two hands reaching in.",
  },
  boxForTwoWide: {
    src: boxForTwoWide,
    alt: "Close view of a Signiorina box with prosciutto, salame, focaccia squares, olives, honey and figs",
    status: "mockup",
    shot: "Box for Two detail, shallow depth of field.",
  },
  bridalSuite: {
    src: bridalSuite,
    alt: "An open cream box of prosciutto, mini focaccia sandwiches, olives, honey and fresh fruit beside white roses",
    status: "mockup",
    shot: "Bridal Suite Board on a dressing table, morning light, robe and flowers soft in the background.",
  },
  gatheringBoardLarge: {
    src: gatheringBoardLarge,
    alt: "A large walnut tray of grilled panini, prosciutto, salame, chorizo, olives, artichokes, figs, grapes and wedges of cheese",
    status: "mockup",
    shot: "Gathering Board Large mid-party: several hands, small plates, linen napkins.",
  },
  boardLargeWide: {
    src: boardLargeWide,
    alt: "Overhead view of a generous grazing tray with panini, cured meats, cheeses, olives and figs",
    status: "mockup",
    shot: "Wide overhead of the Large board on stone.",
  },
  gatheringBoardSmall: {
    src: gatheringBoardSmall,
    alt: "A long cream grazing box of prosciutto, salame, cheeses, olives, roasted peppers, figs, focaccia and honey on a stone table",
    status: "mockup",
    shot: "Gathering Board Small on a coffee table during a shower; candles, guests out of focus.",
  },
  cabinEvening: {
    src: cabinEvening,
    alt: "A grazing tray of panini, prosciutto, salame, cornichons and olives on a stone table in front of a leather armchair",
    status: "mockup",
    shot: "Cabin Welcome Box unpacked on a cabin kitchen island at dusk, mountain view through the window.",
  },
  groomsRoom: {
    src: groomsRoom,
    alt: "A walnut tray of grilled panini, cured meats, cornichons, olives and aged cheeses",
    status: "mockup",
    shot: "Groom's Room Board on a leather ottoman, jackets on hangers behind.",
  },
  officeGrazing: {
    src: officeGrazing,
    alt: "A long grazing box of meats, cheeses, olives, figs and focaccia on a conference table beside a laptop and sparkling water",
    status: "mockup",
    shot: "Office Grazing Spread on a conference table, team mid-conversation.",
  },
  officeGrazingWide: {
    src: officeGrazingWide,
    alt: "A grazing spread of prosciutto, salame, olives, roasted peppers and cheeses laid out for an office meeting",
    status: "mockup",
    shot: "Wide shot of a drop-off spread in a bright office.",
  },
  pranzoLunchBox: {
    src: pranzoLunchBox,
    alt: "An open Pranzo Lunch Box with a prosciutto and mozzarella focaccia panino, antipasti salad, parmigiano, salame, grapes, a fig and amaretti",
    status: "mockup",
    shot: "A stack of Pranzo boxes on a reception desk, one open.",
  },
  irina: {
    src: irina,
    alt: "Irina, smiling in a white chef's jacket and olive apron, holding brass cheese knives",
    status: "final",
    shot: "Owner-supplied portrait.",
  },
  irinaBoard: {
    src: irinaBoard,
    alt: "Chef Irina in a white chef's jacket and olive apron, smiling behind a grazing board of salame, cheeses, figs, grapes and crackers",
    status: "final",
    shot: "Owner-supplied portrait at the grazing board.",
  },
  weddingTable: {
    src: vbWeddingTable,
    alt: "A long grazing table set with candles, white garden roses and abundant cheeses, olives and grissini at an outdoor wedding",
    status: "mockup",
    shot: "The Gathering Table at a 60-guest mountain wedding, guests circling at dusk.",
  },
  candlelitTable: {
    src: vbCandlelitTable,
    alt: "Candlelit grazing table with brass candlesticks, greenery, cheeses and grapes",
    status: "mockup",
    shot: "Candlelit detail of The Hosted Table.",
  },
  officeGathering: {
    src: vbOfficeGathering,
    alt: "A grazing spread with olives, grissini and cheeses at an office event, colleagues talking in the background",
    status: "mockup",
    shot: "Staff appreciation lunch, people mid-laugh around the spread.",
  },
  menuCard: {
    src: vbMenuCard,
    alt: "A deckle-edged Signiorina menu card beside an olive sprig and a fig",
    status: "mockup",
    shot: "Printed menu + allergen card on linen.",
  },
  giftBoxes: {
    src: vbGiftBoxes,
    alt: "Signiorina gift boxes with cheese, crackers, olives, grapes and a halved fig, a branded card tucked in",
    status: "mockup",
    shot: "Gift Box stack with branded sleeve, realtor keys on the table.",
  },
  apron: {
    src: vbApron,
    alt: "A cream linen apron with the Signiorina wordmark and leather strap",
    status: "mockup",
    shot: "Team member in apron arranging a table, face out of frame.",
  },
  waxSeal: {
    src: vbWaxSeal,
    alt: "An olive-green wax seal with an olive sprig impression on cream paper",
    status: "mockup",
    shot: "Wax seal on a welcome box tag.",
  },
  abundantBoard: {
    src: vbAbundantBoard,
    alt: "A close view of a grazing spread with prosciutto, figs, grapes, olives, cookies and honey-drizzled brie",
    status: "mockup",
    shot: "Close, tactile detail of hands tearing focaccia.",
  },
  figsProsciutto: {
    src: vbFigsProsciutto,
    alt: "Halved figs, folded prosciutto and soft cheese with rosemary",
    status: "mockup",
    shot: "Figs and prosciutto macro.",
  },
} satisfies Record<string, MediaItem>;

export type MediaKey = keyof typeof media;

export function getMedia(key: string): MediaItem {
  const item = (media as Record<string, MediaItem>)[key];
  if (!item) throw new Error(`Unknown media key: ${key}`);
  return item;
}

/**
 * Background video loops. Each slot plays a muted, looping clip from /public/media once
 * `mp4` is set; until then (and for visitors who prefer reduced motion) the section shows
 * a placeholder animation built from `placeholder`, a photo from the registry above.
 * Encoding steps are in the README under "Background video".
 */
export interface AmbientLoop {
  /** e.g. "/media/idea-loop.mp4" — H.264, no audio track. */
  mp4: string | null;
  /** Optional smaller VP9/AV1 version, e.g. "/media/idea-loop.webm". */
  webm: string | null;
  /** First frame of the clip as a JPG, e.g. "/media/idea-loop.jpg". Shown before playback and under reduced motion. */
  poster: string | null;
  placeholder: MediaKey;
  /** object-position for the placeholder still, e.g. "50% 75%" to favour the table. */
  placeholderPosition?: string;
  /** Brief for the footage. */
  shot: string;
}

export const ambientLoops = {
  idea: {
    mp4: null,
    webm: null,
    poster: null,
    placeholder: "weddingTable",
    placeholderPosition: "50% 78%",
    shot:
      "10–12 s seamless loop: a wedding party gathered around a generous grazing table at dusk. The table is sharp in the foreground; guests behind it are softly blurred, laughing and reaching in. Warm candle and string-light glow, slow lateral slide, no faces in focus.",
  },
} satisfies Record<string, AmbientLoop>;
