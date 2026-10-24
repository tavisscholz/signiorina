import "server-only";

import Stripe from "stripe";

/**
 * Payment mode:
 * - "stripe": STRIPE_SECRET_KEY + NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY set. Cards, Apple Pay and
 *   Google Pay via the Payment Element. Card data never touches this server.
 * - "dev": no keys, outside production (or ALLOW_DEV_ORDERS=true). Orders are recorded with
 *   payment "not collected" and clearly labelled — nothing is charged or simulated.
 * - "unavailable": production without keys. Checkout stops before payment.
 */
export type PaymentMode = "stripe" | "dev" | "unavailable";

export function paymentMode(): PaymentMode {
  if (process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) return "stripe";
  if (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_ORDERS === "true") return "dev";
  return "unavailable";
}

let client: Stripe | undefined;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured.");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}
