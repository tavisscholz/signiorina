import { randomUUID } from "node:crypto";

import { businessNow } from "@/lib/dates";
import { kindForOption } from "@/lib/estimate-params";
import { estimateEvent } from "@/lib/event-estimate";
import { inquirySchema, toFieldErrors, type InquiryInput } from "@/lib/validation";
import { notifyInquiry } from "@/server/notify";
import { store } from "@/server/store";

/** Event + wedding inquiries. Stored, then handed to the notification adapter. */
export async function POST(request: Request) {
  const parsed = inquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { ok: false, message: "A few details need another look.", fieldErrors: toFieldErrors(parsed.error) },
      { status: 400 },
    );
  }
  const { website: _honeypot, estimateInput, ...data } = parsed.data;
  void _honeypot;
  const inquiry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
    eventDate: data.eventDate || undefined,
    estimate: recomputeEstimate(estimateInput),
  };
  await store.addInquiry(inquiry);
  await notifyInquiry(inquiry);
  return Response.json({ ok: true, reference: inquiry.id.slice(0, 8).toUpperCase() });
}

/** Re-prices the estimator inputs with the server's config and clock; the client's totals are never stored. */
function recomputeEstimate(input: InquiryInput["estimateInput"]) {
  if (!input || kindForOption(input.optionId) !== input.kind) return undefined;
  const estimate = estimateEvent({ ...input, today: businessNow(new Date()).date });
  if (!estimate) return undefined;
  return {
    input,
    optionName: estimate.optionName,
    guests: estimate.guests,
    lines: estimate.lines,
    subtotal: estimate.subtotal,
    tax: estimate.tax,
    total: estimate.total,
    retainer: estimate.retainer,
    warnings: estimate.warnings,
    notes: estimate.notes,
  };
}
