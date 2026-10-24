import { checkoutRequestSchema, toFieldErrors } from "@/lib/validation";
import { createCheckout } from "@/server/checkout";

/**
 * Creates the order with a short capacity hold and, when Stripe is configured,
 * a PaymentIntent. Prices are recomputed here from the catalog — never trusted from the client.
 */
export async function POST(request: Request) {
  const parsed = checkoutRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { ok: false, code: "invalid", message: "A few details need another look.", fieldErrors: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }
  const result = await createCheckout(parsed.data);
  return Response.json(result, { status: result.ok ? 200 : 422, headers: { "Cache-Control": "no-store" } });
}
