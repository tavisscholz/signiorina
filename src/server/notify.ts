import "server-only";

import type { EventInquiry } from "@/lib/types";

/**
 * Notification adapter. Wire this to the owner's email provider or CRM
 * (e.g. set INQUIRY_WEBHOOK_URL to a Zapier/Make/CRM endpoint). Until then,
 * inquiries are stored and logged on the server.
 */
export async function notifyInquiry(inquiry: EventInquiry): Promise<void> {
  const url = process.env.INQUIRY_WEBHOOK_URL;
  if (!url) {
    console.info(`[inquiry] ${inquiry.eventType} · ${inquiry.serviceInterest} · ref ${inquiry.id.slice(0, 8)}`);
    return;
  }
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inquiry),
    });
  } catch (error) {
    console.error("[inquiry] Notification failed", error);
  }
}
