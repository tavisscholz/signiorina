import { z } from "zod";

import { revalidateOrder } from "@/server/checkout";

const bodySchema = z.object({ orderId: z.string().uuid(), accessKey: z.string().min(10).max(64) });

/** Re-checks delivery capacity immediately before payment is confirmed. */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, message: "Invalid request." }, { status: 400 });
  const result = await revalidateOrder(parsed.data.orderId, parsed.data.accessKey);
  if (!result.ok) return Response.json(result, { status: 409 });
  return Response.json({ ok: true, holdExpiresAt: result.order.holdExpiresAt }, { headers: { "Cache-Control": "no-store" } });
}
