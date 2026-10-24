import { z } from "zod";

import { completeDevOrder } from "@/server/checkout";

const bodySchema = z.object({ orderId: z.string().uuid(), accessKey: z.string().min(10).max(64) });

/**
 * Development only: records the order without collecting payment (no card data is
 * requested or simulated). Refused whenever Stripe is configured or in production.
 */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  const result = await completeDevOrder(parsed.data.orderId, parsed.data.accessKey);
  if (!result.ok) return Response.json(result, { status: 409 });
  return Response.json({ ok: true, orderId: result.order.id });
}
