# Everyday · Events · Weddings — implementation record (v2)

One homepage, three entrances, three ways to buy — behind the feature flag
`threeJourneyArchitectureV2`. **Launched:** approved by the owner and merged into the production
branch; the flag now defaults to on. Setting it to `false` serves the original site, verified
pixel-for-pixel (see *Tests*). See [BASELINE.md](./BASELINE.md) for the
pre-change audit and [ROLLBACK.md](./ROLLBACK.md) for turning it off or reverting it.

## Git references

| | |
| --- | --- |
| Work branch | `feature/signiorina-three-journeys-v2` (pushed) |
| Baseline commit | `6424d4bae4db0826bfe946b4812d9aa91020e174` — still the tip of the production branch `claude/confident-keller-fnabw9` |
| Baseline tag | `pre-three-journeys-v2` (local only — the git proxy refuses tag pushes; the commit hash is the durable reference) |

The production branch was not touched. Vercel builds the work branch as a **preview** only.

## The flag

The flag is read at build time, so every change needs a redeploy.

| Variable | Value | Effect |
| --- | --- | --- |
| `NEXT_PUBLIC_FLAG_THREE_JOURNEY_ARCHITECTURE_V2` | unset or `true` (default since launch) | New homepage, navigation, `/everyday`, `/events`, `/events/plan`, `/weddings/build`, journey redirects |
| | `false` | The original site, exactly as before |
| `NEXT_PUBLIC_SHOW_PLACEHOLDERS` | `true` (previews only) | Shows the *proposed* event package names (labelled) and the labelled placeholders for Irina's story and testimonials |

**Launch:** the branch was fast-forwarded into the production branch with the flag defaulting
to on, so the next production deployment serves the journeys with no Vercel setting needed.
Leave `NEXT_PUBLIC_SHOW_PLACEHOLDERS` unset in Production.

## Route map

| Route | Flag off (original) | Flag on |
| --- | --- | --- |
| `/` | Original homepage | Three-journey homepage |
| `/everyday` | 307 → `/order` | **Everyday** store |
| `/order` | Store | 307 → `/everyday` (query kept, e.g. `?category=cabin`) |
| `/order/[slug]` | Product page | Product page (unchanged URL; breadcrumb "Shop Everyday") |
| `/events` | 307 → `/gatherings` | **Events** package catalog |
| `/events/plan` | 307 → `/inquire` (query kept, so the estimate is attached) | Event planner (not indexed) |
| `/gatherings` | Grazing tables + estimator | 307 → `/events`; with an estimate (`?service=…`) → `/events/plan?…&step=2` |
| `/weddings` | Packages + estimator | Packages + Build Your Table invitation; with an estimate (`?service=…`) → `/weddings/build?…&step=3` |
| `/weddings/build` | 307 → `/weddings` (query kept, the estimator restores it) | **Build Your Table** planner |
| `/cart`, `/checkout/*`, `/inquire`, `/corporate`, `/cabin-delivery`, `/delivery`, `/faq`, `/about`, `/areas/*`, `/api/*` | Unchanged | Unchanged (shared links point at the journey routes) |

Every journey redirect is temporary (307), so turning the flag off never fights a cached
permanent redirect, and links created while the flag was on keep working after it is off.
The sitemap lists only routes that answer 200 for the current flag state.

Navigation with the flag on: **Weddings · Events · Shop · About** and the cart (the
homepage cards, homepage sections and footer columns use the same order). The
mobile menu adds Corporate, Cabin delivery, Delivery areas + fees and FAQ. The header
buttons and the sticky mobile action bar are not shown: the journeys are the way in.

## Functional status

| Journey | Status |
| --- | --- |
| Homepage fork | Done. All three choices visible without scrolling at 1280×860, 393×700 and 360×640; no carousel. |
| Everyday | Done. Existing catalog, category filters, quick add, product options, cart, delivery scheduling and guest checkout, unchanged underneath. Adds a "Do we deliver to you?" check. |
| Events | Done, **pending name approval**. Three packages on the existing tiers; planner (details → upgrades → review → request) submits a package-linked inquiry. Date availability is stated as pending confirmation. |
| Weddings | Done. Build Your Table: start from a favorite or build your own; details → customize → review → request; switching favorites asks before replacing custom selections. |

Both planners keep the whole plan in the URL (refresh, share, Back/Forward keep every
selection), price only through `src/lib/event-estimate.ts`, show the live estimate (sticky
column on desktop, total bar + details sheet on phones), and submit the configuration to the
existing `/api/inquiries`, which re-prices it on the server. No payment is taken and no
date is held by either planner.

## Proposed event package names — need approval

Built on the published grazing-table tiers; prices, minimums, setup and lead times are
unchanged. Edit in `src/config/events.ts` (`eventPackages`); set `namesApproved: true` to
publish them. Until then customers see "Light / Generous / Premium grazing table".

| Tier | Price | Proposed name | Proposed line |
| --- | --- | --- | --- |
| Light | $22/guest | **The Spuntino** (Italian: a light bite) | A light graze before dinner |
| Generous | $30/guest | **The Festa** (a party) | The party table |
| Premium | $38/guest | **The Abbondanza** (abundance) | Abundant enough to be dinner |

All three: $650 food minimum, 20+ guests, 10 days' notice; setup $125 (Zones A + B) or
$175 (Zone C); delivery by zone; tax. Inclusions shown are the ones already published on
`/gatherings`: styled table built on site, all food, eco plates, napkins + picks, menu card
+ allergen card.

## Wedding favorites (Build Your Table presets)

Working labels, not products. Each is an editable starting point on an existing package —
same engine, same minimums, same peak-Saturday rule. Edit in `src/config/events.ts`
(`weddingPresets`).

| Favorite | Package | Starts with | Recommended (badged, not added) | Estimate at the starting count* |
| --- | --- | --- | --- | --- |
| Cocktail Hour | The Aperitivo Hour $24 | 50 guests, next-day pickup | Burrata + Focaccia, DOP upgrade | $1,415.78 (retainer $707.89) |
| The Celebration Table | The Gathering Table $32 | 60 guests, 1 Dolce Board, next-day pickup | Panini Tray, DOP upgrade | $2,255.36 (retainer $1,127.68) |
| The Full Reception | The Hosted Table $42 | 80 guests, DOP upgrade; attendants + teardown included | Extra attendant hours, Dolce Board | $3,967.46 (retainer $1,983.73) |

\*Zone A delivery, any date; at these counts no minimum binds, so a peak Saturday prices the
same. Without a place chosen yet the planner shows "about" totals before delivery
($1,399 / $2,239 / $3,951).

Loading a favorite replaces the package and enhancements but keeps the couple's date, place,
guest count and moment. Analytics record whether a plan began from a favorite or from scratch
(`wedding_builder_started`, `start`, `preset`), so the two can be compared.

## Analytics added

`journey_selected` (journey, location), `journey_landing_view`, `event_package_selected`,
`planner_link_copied`, `wedding_builder_started` (start = preset | custom), `wedding_preset_switched`,
`wedding_proposal_submitted`, `event_proposal_submitted`. Existing events (`add_to_cart`,
`begin_checkout`, `delivery_zone_validated`, `purchase`, …) cover the Everyday funnel. No
personal data is sent.

## Tests

- Unit: 66 tests (43 existing + 23 new: planner URL state, presets, custom-selection
  detection, prerequisites, journey redirects, package-name gating, inquiry payloads).
- Typecheck, lint, production build (51 pages) — clean with the flag off and on.
- **Flag off:** 32 baseline screenshots (8 pages × desktop/phone × first screen/full page)
  compared pixel-for-pixel with the pre-change site: 0.000% difference. Classic checkout to
  confirmation; all four new routes redirect to their originals with the query kept.
- **Flag on:** Everyday quick-add ×2 → cart survives visiting Events and Weddings → product
  page add → delivery address, date, window → details → fees shown (subtotal, add-ons,
  delivery, tax, total) → confirmation. Events package → details → upgrades → review →
  required-field validation → submit; the server's re-priced total matched the screen
  ($1,722.48). Weddings from a favorite and from scratch, Back then Next keeps later
  selections, favorite switch asks first, phone-width submission, classic estimate link opens
  the planner with its state. Server totals matched the screen ($2,535.23).
- Accessibility: axe on 24 URLs including every planner step, desktop and phone — 0
  violations, no horizontal scroll, one `h1` each, no console errors. Keyboard: favorites
  reachable by Tab and Enter, focus moves to each step's heading, the replace dialog focuses
  "Keep my selections" and closes with Escape.

## Known limitations

- **Inquiry storage on Vercel is not durable** (unchanged from before): submissions go to a
  temp-dir JSON file and are only forwarded if `INQUIRY_WEBHOOK_URL` is set. Set the webhook
  (or add a database + email) before relying on planner submissions in production.
- Event date availability is not checked in real time; the planners say so.
- The event packages show the existing board photography; there are no photos of styled
  event tables yet.
- The earlier "Build Your Table" spec's pricing-engine changes (its Phase 1: minimum applied
  after add-ons, T1–T5) were not part of this brief and are not implemented; both planners use
  the current engine unchanged.

## Preserved

Prices, minimums, peak-Saturday rules, fees, tax treatment, retainer terms, delivery zones,
windows, lead times, capacity, holidays, allergen statements, the product catalog, the cart,
checkout, payment handling and the inquiry endpoint's existing behaviour are unchanged. The
inquiry schema only gained optional fields (`planner`, and `message` optional for planner
submissions); classic submissions validate exactly as before. No data store, order or
inquiry format was migrated.
