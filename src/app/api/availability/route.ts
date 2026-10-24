import { z } from "zod";

import { cartLineSchema } from "@/lib/validation";
import { availabilityFor } from "@/server/checkout";

const bodySchema = z.object({
  lines: z.array(cartLineSchema).max(30),
  areaId: z.string().max(64),
  isBusiness: z.boolean().optional(),
});

/** Delivery calendar for the current cart and area. Runs against live bookings. */
export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, reason: "invalid" }, { status: 400 });
  const { lines, areaId, isBusiness } = parsed.data;
  const result = await availabilityFor({ lines, delivery: { areaId, isBusiness } });
  return Response.json(result, { status: result.ok ? 200 : 422, headers: { "Cache-Control": "no-store" } });
}
