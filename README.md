# Signiorina

**Modern Italian-inspired mobile charcuterie + hospitality** for Sevierville, Pigeon Forge, Gatlinburg, the Great Smoky Mountains destination market and Knoxville.

> The spelling **Signiorina** (with the extra "i") is intentional. Don't let a spellchecker "fix" it.

This repository is the complete website and ordering system:

- **Discovery → wedding / event inquiry** — wedding-led marketing pages with published per-guest pricing and an itemized event estimator that carries into the inquiry form.
- **Discovery → product → cart → delivery address → date → window → details → payment → confirmation** — a delivery-first checkout that confirms Signiorina can deliver *before* asking for payment.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS v4, Zustand, Zod and Stripe.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — the site runs without any keys
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (Next + React Compiler rules) |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests for pricing, availability, holidays and the event estimator |

Without Stripe keys, development builds run checkout in a **clearly labelled test mode**: the order is recorded with payment marked *not collected*. No card fields are shown and nothing is simulated. Development also loads a small **demo operations calendar** (a fully booked Saturday, a sold-out midday window and an event-blocked afternoon) so the sold-out and blocked states can be seen.

---

## Payments (Stripe)

1. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
2. Add a webhook endpoint at `https://<your-domain>/api/stripe/webhook` for `payment_intent.succeeded` and `payment_intent.payment_failed`, then set `STRIPE_WEBHOOK_SECRET`.
3. For Apple Pay, verify your domain in the Stripe dashboard. Google Pay and cards need no extra setup.

How it works:

- `POST /api/checkout/session` re-prices the cart **from the catalog on the server** (client prices are never trusted), validates the address, cabin handoff and contact details, re-checks the delivery slot, then creates the order with a **20-minute capacity hold** and a PaymentIntent.
- Right before the card is confirmed, `POST /api/checkout/revalidate` re-checks capacity and refreshes the hold.
- The Payment Element (cards, Apple Pay, Google Pay) runs in Stripe's iframe, so card data never touches this server.
- The webhook (or the confirmation page, if the webhook hasn't landed yet) marks the order paid. A payment that arrives after its hold lapsed is kept but flagged `needs_attention` for review.
- No service charge, no mandatory gratuity, no card surcharge.

In a production build without keys, checkout stops before payment and points customers to the inquiry form. `ALLOW_DEV_ORDERS=true` turns the test mode back on (for staging only).

---

## Where to change things

Every operational rule is data in `src/config/`. Presentation code reads it through small accessors, so the same records can later come from a CMS or database.

| To change… | Edit |
| --- | --- |
| Products, prices, serving sizes, contents, lead times, minimums, volume pricing, dietary options, add-ons per product | `src/config/catalog.ts` |
| Add-on prices, dietary options, categories | `src/config/catalog.ts` |
| Delivery zones, areas + ZIPs, fees, free-delivery thresholds, route days, off-route minimum | `src/config/delivery.ts` → `zones`, `deliveryAreas` |
| Delivery windows, cutoff hour, booking horizon, $55 minimum, rush fee, Sunday/Saturday rules, pickup (off) | `src/config/delivery.ts` → `deliveryWindows`, `scheduling` |
| Window capacity, zone "stop points", route-day corporate reserve | `src/config/delivery.ts` → `capacity` |
| Holiday preorder periods, holiday fee, daily caps, product caps | `src/config/delivery.ts` → `holidays` |
| Sales-tax rates | `src/config/delivery.ts` → `tax` |
| Booked events, sold-out windows, blackout dates, per-date capacity | `src/config/operations.ts` |
| Wedding packages, grazing tiers, event minimums, peak months, bundle, event fees, retainer | `src/config/events.ts` |
| FAQ answers, allergen statement, testimonials | `src/config/content.ts` |
| Local landing pages (`/areas/*`) | `src/config/areas.ts` |
| Photography (and the alt text / shot brief for each slot) | `src/config/media.ts` + `src/assets/images/` |
| Contact email, phone, Instagram, address, hours, placeholder visibility | `src/config/site.ts` |
| Pre-arrival fridge handoff via property managers (on/off) | `src/lib/validation.ts` → `cabinHandoffConfig` |
| Morning Table (test offering, not shown) | `src/config/events.ts` → `futureOfferings` |

### How delivery availability works

`src/lib/availability.ts` decides, per date and window, whether the current cart can be delivered:

- **Lead time:** each product is due by **noon**, *N* days before delivery (48 h boxes → noon two days prior; 72 h for the Cabin Welcome Box, Large Board and Gift Box; 14 days for bridal/groom's boards; 21 days for welcome boxes). Inside the normal lead time, 48-hour products can be **rushed** for $25 if there's room (orders still close at noon the day before).
- **Capacity:** each window holds **12 stop points** per date. A Zone A stop uses 3 (≈4 per window), Zone B 6 in the morning / 4 in the afternoon, an off-route Zone C stop the whole window, a Knoxville route-day stop 3. On route days, 6 midday points are held for corporate orders. Points come from paid orders plus active checkout holds.
- **Rules:** no Sunday delivery (events only, not shown as available); a Saturday with 2+ significant events closes; event bookings block their windows; manual sell-outs and blackout dates; holiday dates are preorder-only (no rush) with daily and per-product caps; the Cabin Welcome Box travels in the afternoon window only; metro orders under $350 travel only on Tuesday/Thursday route windows.
- Unavailable dates explain why (fully booked, needs more notice, not every item available, route days only) and suggest the next open dates or alternative products.

### Data model

`src/lib/types.ts` defines Product, ProductVariant, AddOn, DietaryOption, Category, DeliveryZone, DeliveryArea, DeliveryWindow, CapacityConfig, OperationsCalendar, Booking, Cart/CartLine, Address, CabinDetails, Customer, Recipient, Order, OrderItem, OrderTotals, PaymentStatus, FulfillmentStatus, EventInquiry and CorporateAccount.

---

## Architecture

```
src/
  app/                 Routes (App Router) + API route handlers
    api/availability       POST  delivery calendar for a cart + area
    api/checkout/session   POST  validate, price, hold capacity, create PaymentIntent
    api/checkout/revalidate POST re-check capacity right before payment
    api/checkout/dev-complete POST test-mode completion (dev only)
    api/stripe/webhook     POST  payment events (signature-verified)
    api/inquiries          POST  event + wedding inquiries
  config/              All business data (see table above)
  lib/                 Pure, shared logic — pricing.ts, availability.ts, event-estimate.ts,
                       dates.ts, holidays.ts, delivery-fees.ts, validation.ts, seo.ts,
                       cart-store.ts (persisted guest cart), analytics.ts
  server/              Server-only: checkout service, Stripe client, data store, notifications
  components/          brand/, commerce/, checkout/, events/, sections/, layout/, ui/, motion/
```

- **Pricing is shared**: the browser uses `priceCart` for live totals; the server runs the same function from scratch before taking payment.
- **Cart** persists in `localStorage` (survives navigation and refresh); checkout contact details live in `sessionStorage`. Guest checkout only — no accounts.
- **Data store**: `src/server/store.ts` is a JSON-file adapter behind a `DataStore` interface. It's right for local development and a single long-running server. **Before deploying to serverless or multiple instances, implement `DataStore` against a database** (e.g. Postgres) — capacity checks need shared bookings, and `exclusive()` should become a transaction or row lock.
- **Notifications**: inquiries are stored and logged; set `INQUIRY_WEBHOOK_URL` to forward them to email/CRM. Order emails are not sent by this app — Stripe can send receipts.
- **Estimate hand-off**: the wedding and grazing-table estimators put their full state (package/portion, guests, date, zone, options, pickup, attendant hours, add-ons) in the `/inquire` URL (`src/lib/estimate-params.ts`), so the link survives refresh and can be shared. The inquiry form shows the itemized estimate with an *Edit estimate* link back to the estimator, and the server recomputes the estimate from those inputs before storing it — client totals are never trusted.
- **Site URL**: `site.url` resolves from `NEXT_PUBLIC_SITE_URL`, then Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`), then the deployment URL, then localhost.
- **Analytics**: `src/lib/analytics.ts` pushes privacy-safe events (no personal data) to `window.dataLayer` if a tag manager is present: view_product, add_to_cart, remove_from_cart, begin_checkout, select_delivery_date, select_delivery_window, delivery_zone_validated, purchase, wedding_inquiry_started, wedding_inquiry_submitted, corporate_inquiry_submitted, inquiry_submitted, event_estimate_used.

---

## Brand system

Defined in `src/app/globals.css` (`@theme`) and the brand components.

| Token | Hex | Use |
| --- | --- | --- |
| Olive Ink | `#41483A` | Signature color — buttons, dark sections, type |
| Parmigiano Cream | `#F2E8D5` | Primary light background |
| Fig Skin | `#49323C` | Selective accent — badges, errors (never red) |
| Pistachio Dust | `#B8BE9B` | Soft support — dietary chips, notices |
| Espresso | `#24231F` | Body type, grounding neutral |
| Prosecco | `#D8C5A1` | Champagne accent on dark, used sparingly |

- **Type:** Bodoni Moda (high-contrast editorial display, with italic accents) + Jost (clean sans for UI and body).
- **Geometry:** ovals and arches from shared platters — photo crops, price ovals, the platter-rim section edges, the oval CTA card, oval calendar days. Used deliberately, not everywhere.
- **Materials:** subtle paper grain, deckle-style menu cards, hand-drawn olive sprig used sparingly.
- **Motion:** fade/rise and oval-mask reveals, cart drawer slide, add-to-cart confirmation. Everything is disabled under `prefers-reduced-motion`, and content is visible without JavaScript. Above-the-fold hero content uses a CSS-only, transform-only entrance (`.hero-enter` / `.hero-settle`), so it's fully visible from the first frame; scroll reveals are reserved for content below the fold.

---

## SEO

- Unique titles and descriptions per page (weddings, corporate, cabin delivery, order online, gatherings, every product, local area pages).
- JSON-LD: Organization, LocalBusiness (service-area: cities served, **no address, hours, ratings or reviews until supplied**), Service, Product, FAQPage, BreadcrumbList.
- Local landing pages for Gatlinburg, Pigeon Forge, Sevierville, Wears Valley and Knoxville (`/areas/*`), a published fees page (`/delivery`), `sitemap.xml`, `robots.txt` and a branded share image on every page (product pages use the product photo).
- Canonicals, `og:url`, `og:image`, the sitemap and the robots sitemap line all use the production origin (see *Site URL* above).

---

## Quality checks run

- 43 unit tests (lead-time cutoffs, holidays, minimums, volume pricing, zone fees, route days, rush and holiday fees, tax, capacity, Saturday/Sunday rules, event minimums, bundles, retainers, estimate URL round trips and tamper rejection).
- TypeScript and ESLint clean; production build passes.
- axe-core accessibility audit (WCAG 2.1 AA): no violations on any page, the cart drawer, scheduler, details step or inquiry form.
- End-to-end walkthroughs at desktop and phone width: product → cart → address → date → window → details → payment → confirmation; out-of-area, wrong ZIP, off-route metro day, sold-out date, sold-out window, event-blocked window, severe-allergy gate, inquiry validation and estimate hand-off. Keyboard navigation in the date picker (arrows, Page Up/Down).

---

## Decisions for the owner

These are working assumptions, flagged so nothing is silently invented. Each lives in config and is quick to change.

1. **Contact details** — email, phone and Instagram are blank, so they're hidden. Add them in `site.ts`.
2. **Rush window** — inside 48 hours, a rush ($25) is offered when there's room, but orders still close at noon the day before; same-day isn't offered online. The FAQ answer is marked *awaiting owner confirmation* in development.
3. **Gluten-conscious fee on single-serve boxes** — the brief says +$5/board and +$1/person for events. Single-serve boxes (Aperitivo, Pranzo, welcome boxes) are set to +$1 each; Box for Two and up to +$5.
4. **Serving-piece pickup for The Aperitivo Hour and The Gathering Table** — currently charged ($75 next day / $125 same night). The pricing report suggested including next-day pickup in Zones A/B. The Hosted Table includes teardown.
5. **Metro (Zone C) off-route minimum** — $350 applies to every non-route-day metro order, including Townsend cabins. Route days run in the morning and midday windows only.
6. **Capacity numbers** — 12 points per window, the zone point costs, and 6 midday points reserved for corporate on route days are launch estimates for one vehicle.
7. **Holiday caps** — 10–14 orders per day by holiday, 24 Box for Two on Valentine's dates (Feb 12–14). Thanksgiving Day and Christmas Day are open for preorders unless added to `blackoutDates`.
8. **Tax** — 7% state + county rate (9.75% Sevier/Blount/Jefferson/Cocke, 9.25% Knox), applied to food, delivery, rush and holiday fees; setup and attendant labor in event estimates are untaxed. The Pigeon Forge 1% restaurant privilege tax is not applied. Confirm with the TN Department of Revenue, or switch to Stripe Tax.
9. **Pantry Welcome Box lead time** — set to 21 days to match the perishable version.
10. **Property-manager fridge handoff** — enabled per the brief, pending insurer / health-department confirmation. Turn it off in `validation.ts`; perishable cabin orders then require someone on site.
11. **Standing Lunch Program accounts** — modeled (`CorporateAccount`, including a 24-hour lead-time override), but not exposed in checkout until accounts exist. Set up through the corporate inquiry for now.
12. **Policies** — no cancellation or refund policy is published beyond the 50% nonrefundable event retainer. No licensing, permit or kitchen claims are made, and pickup stays off.
13. **ZIP codes per area** — reasonable defaults; please verify, especially where Wears Valley straddles Sevierville, Pigeon Forge and Townsend ZIPs.
14. **Placeholders** — testimonials and the founder story show labelled placeholders in development and are hidden in production until real content is added.

---

## Photography shot list

Current images are the launch mockups (vision board + product renders), cropped to remove alcohol and tobacco from product shots. Each slot in `src/config/media.ts` has a `shot` brief for the replacement photograph:

| Slot | Brief |
| --- | --- |
| Box for Two | On a cabin porch rail at golden hour, two hands reaching in |
| Cabin Welcome Box | Unpacked on a cabin kitchen island at dusk, mountain view through the window |
| Wedding table | The Gathering Table at a 60-guest mountain wedding, guests circling at dusk |
| Bridal Suite Board | On a dressing table, morning light, robe and flowers soft in the background |
| Groom's Room Board | On a leather ottoman, jackets on hangers behind |
| Gathering Board Large | Mid-party: several hands, small plates, linen napkins |
| Gathering Board Small | Coffee table during a shower; candles, guests out of focus |
| Pranzo Lunch Box | A stack on a reception desk, one open |
| Office Grazing Spread | Conference table, team mid-conversation |
| Aperitivo Box | Three-quarter angle, hand lifting a fig |
| Gift Box | Stack with branded sleeve, realtor keys on the table |
| Menu + allergen card | Printed on linen |

Replace a file in `src/assets/images/` (or point the slot at a new import) and update its `alt` text and `status` to `"final"`.

---

## Background video

The home page's **The idea** section has a slot for a muted 10–12 second loop behind white type (`ambientLoops.idea` in `src/config/media.ts`). Until a clip is added it shows a **placeholder animation**: a slow 12-second pan over the candlelit wedding-table photo with flickering candle glows and drifting bokeh. Visitors who prefer reduced motion, or have Data Saver on, always get a still; the video only downloads and plays while the section is on screen.

**The shot:** a wedding party gathered around a generous grazing table at dusk. The table is sharp in the foreground; the guests behind it are softly out of focus, laughing, talking, reaching in for a plate. Warm candle and string-light glow, a slow sideways slide, no faces in focus. Keep the brightest detail in the lower half of the frame — the text sits over the upper two-thirds.

**Getting the footage — any one of these:**

1. **Film it at a real event (best).** Tripod or slider, camera at table height, lens wide open (f/1.8–f/2.8) focused on the food, guests 2–4 m behind. 4K or 1080p at 24/30 fps, white balance around 3200 K, one slow 15–20 second move. Get the guests' and couple's permission to use the footage.
2. **License stock footage.** Search "wedding reception grazing table bokeh", "charcuterie table party blurred guests", "candlelit dinner party shallow depth of field" on Artgrid, Storyblocks, Adobe Stock or Pexels (free). Check the license allows website use.
3. **Generate it with AI video.** ElevenLabs needs a paid plan for video (Seedance 2.5 or Veo 3.1), as do Runway, Sora or Veo directly. Ask for 13 seconds at 16:9, 1080p, no audio, with this prompt:

   > Slow cinematic slide along a long rustic wooden grazing table at an evening wedding reception. The table is in sharp focus in the foreground: folded prosciutto, salami, wedges of aged cheese, halved figs, grapes, olives, focaccia, honey and brass candlesticks with lit candles. Behind it, wedding guests in soft focus laugh, talk and reach in for plates under warm string lights. Shallow depth of field, cozy amber evening light, gentle film grain. No text, no logos, no bottles or drinks in focus, faces never sharp.

   AI footage is a stand-in like the other mockup imagery — replace it with real event footage when you have it.

**Encoding (needs [ffmpeg](https://ffmpeg.org)).** Start from a clip at least 13 seconds long. This keeps seconds 1–13 and crossfades the last second into the first so the 12-second loop has no visible jump, drops the audio, and writes web-sized files (about 2 MB each at 1600 px):

```bash
mkdir -p public/media
ffmpeg -i source.mp4 -filter_complex "[0:v]fps=30,scale=1600:-2,setsar=1,split[a][b];[a]trim=1:13,setpts=PTS-STARTPTS[main];[b]trim=0:1,setpts=PTS-STARTPTS[head];[main][head]xfade=transition=fade:duration=1:offset=11,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 27 -profile:v high -movflags +faststart public/media/idea-loop.mp4
ffmpeg -i public/media/idea-loop.mp4 -an -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 public/media/idea-loop.webm
ffmpeg -i public/media/idea-loop.mp4 -frames:v 1 -q:v 3 public/media/idea-loop.jpg
```

For a 10-second loop instead, use `trim=1:11` and `offset=9` (and a source of at least 11 seconds).

**Turning it on:** in `src/config/media.ts`, set

```ts
idea: {
  mp4: "/media/idea-loop.mp4",
  webm: "/media/idea-loop.webm",
  poster: "/media/idea-loop.jpg",
  ...
}
```

then commit the three files and redeploy. Keep each file under about 4 MB.
