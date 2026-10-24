import { randomUUID } from "node:crypto";

import { inquirySchema, toFieldErrors } from "@/lib/validation";
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
  const { website: _honeypot, ...data } = parsed.data;
  void _honeypot;
  const inquiry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
    eventDate: data.eventDate || undefined,
  };
  await store.addInquiry(inquiry);
  await notifyInquiry(inquiry);
  return Response.json({ ok: true, reference: inquiry.id.slice(0, 8).toUpperCase() });
}
