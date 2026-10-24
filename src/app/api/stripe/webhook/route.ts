import type Stripe from "stripe";

import { markOrderPaid, markPaymentFailed } from "@/server/checkout";
import { getStripe } from "@/server/payments";

/** Stripe webhook: confirms orders when payment succeeds. Signature-verified. */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook not configured", { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    console.error("[stripe] Invalid webhook signature", error);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object;
      await markOrderPaid(intent.id, intent.amount_received);
      break;
    }
    case "payment_intent.payment_failed": {
      await markPaymentFailed(event.data.object.id);
      break;
    }
    default:
      break;
  }
  return Response.json({ received: true });
}
