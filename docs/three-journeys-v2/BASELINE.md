# Three Journeys v2 — Phase 0 baseline

Recorded before any change for `threeJourneyArchitectureV2`.

## Git

| | |
| --- | --- |
| Baseline commit | `6424d4bae4db0826bfe946b4812d9aa91020e174` ("Sturdier display type…") |
| Baseline tag (local) | `pre-three-journeys-v2` → the commit above |
| Production branch | `claude/confident-keller-fnabw9` — the repository's only and default branch, so the Vercel production deployment builds from it |
| Work branch | `feature/signiorina-three-journeys-v2` (created from the baseline commit; Vercel builds it as a preview, never production) |
| Working tree at start | Clean — no uncommitted changes to preserve |

## Stack (as found)

- Next.js 16.4 App Router, `cacheComponents` + partial prefetching, React 19, TypeScript, Tailwind CSS v4.
- No CMS: all catalog, package, fee and delivery rules live in `src/config/*.ts`. Pure engines in `src/lib` (`pricing.ts`, `availability.ts`, `event-estimate.ts`, `dates.ts`, `holidays.ts`, `delivery-fees.ts`).
- Cart: Zustand, persisted to `localStorage` (`src/lib/cart-store.ts`); checkout contact details in `sessionStorage`.
- Payments: Stripe Payment Element + signature-verified webhook when `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set; otherwise a labelled test mode in development and "payment unavailable" in production.
- Server data: JSON-file `DataStore` (`src/server/store.ts`) in `.data/` locally and the OS temp dir on Vercel. Inquiries are forwarded to `INQUIRY_WEBHOOK_URL` when set.

## Environment variables (names only)

`NEXT_PUBLIC_SITE_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `ALLOW_DEV_ORDERS`, `DEMO_OPERATIONS`, `NEXT_PUBLIC_SHOW_PLACEHOLDERS`, `DATA_DIR`, `INQUIRY_WEBHOOK_URL`; platform-provided: `VERCEL`, `VERCEL_URL`, `VERCEL_PROJECT_PRODUCTION_URL`, `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL`, `NODE_ENV`, `PORT`.

## Routes before the change

| Route | Purpose |
| --- | --- |
| `/` | Homepage (hero, The idea, three pathways: Weddings / Cabin + gatherings / Corporate, wedding feature, featured products, cabin, corporate, how it works, testimonials placeholder, CTA band) |
| `/weddings` | Wedding packages ($24 / $32 / $42) + wedding estimator (state in URL) |
| `/gatherings` | Styled grazing tables (Light $22 / Generous $30 / Premium $38) + estimator |
| `/corporate` | Office lunches, spreads, Standing Lunch Program |
| `/cabin-delivery` | Cabin arrival delivery + zone calculator |
| `/order` | Online store (category filter via `?category=`) |
| `/order/[slug]` | Product pages (12 products) |
| `/cart`, `/checkout/delivery`, `/checkout/details`, `/checkout/payment`, `/checkout/confirmation/[orderId]` | Cart and checkout |
| `/inquire` | Wedding / event / corporate / allergy inquiry form; shows an attached estimate from estimator links |
| `/delivery`, `/faq`, `/about`, `/areas/[slug]` (5 towns) | Information and local SEO |
| `/api/availability`, `/api/checkout/session`, `/api/checkout/revalidate`, `/api/checkout/dev-complete`, `/api/stripe/webhook`, `/api/inquiries` | Server endpoints |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image.jpg`, `/twitter-image.jpg`, `/icon.svg` | Metadata |

Header navigation: Weddings · Gatherings · Corporate · Cabin Delivery · About · FAQ, plus "Order Online" and "Plan Your Gathering" buttons and the cart. Mobile: sticky Order Online / Plan Your Gathering bar.

## Feature status (as found)

| Area | Status |
| --- | --- |
| Online store, cart, delivery scheduling (zone, date, window, capacity, lead times, holidays) | Functional |
| Checkout + payment | Functional with Stripe keys; without them production stops before payment (no orders can be taken) |
| Order confirmation | Functional |
| Wedding + grazing estimators, estimate hand-off to `/inquire`, server-side re-pricing | Functional |
| Inquiry storage + notification | Partial: stored in a temp-dir JSON file on Vercel (lost on redeploy) and only logged unless `INQUIRY_WEBHOOK_URL` is set |
| Wedding "Build Your Table" planner | Not built (spec Phase 2 never started) |
| Founder story, testimonials | Placeholders (shown labelled in development, hidden in production) |
| Background video for The idea | Placeholder animation; video slot empty |

## Live data and external dependencies

- No persistent order, lead or customer database exists. On Vercel the JSON store lives in the function's temp directory, so it holds no durable records this change could affect.
- External services: Stripe (only if keys are configured), the inquiry webhook (only if configured), Google Fonts at build time. None are modified by this change.
- No inventory system beyond the capacity rules in `src/config/delivery.ts` and `src/config/operations.ts`.

## Baseline checks

- `npx tsc --noEmit`: pass
- `npx eslint src`: pass
- `npx vitest run`: 5 files, 43 tests, all pass
- `npx next build`: pass, 47 static pages
- Screenshots: home, `/order`, `/order/aperitivo-box`, `/gatherings`, `/weddings`, `/corporate`, `/inquire`, `/cart` at 1280×860 and 393×760 (first screen and full page), kept outside the repository with the review materials.
