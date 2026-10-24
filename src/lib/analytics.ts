/**
 * Privacy-respecting analytics hook-point. Events go to `window.dataLayer` (if a tag
 * manager is installed by the owner) and a DOM event other tools can listen to.
 * No personal data — names, emails, phones and addresses are never included.
 */

export type AnalyticsEvent =
  | "view_product"
  | "add_to_cart"
  | "remove_from_cart"
  | "begin_checkout"
  | "select_delivery_date"
  | "select_delivery_window"
  | "delivery_zone_validated"
  | "purchase"
  | "wedding_inquiry_started"
  | "wedding_inquiry_submitted"
  | "corporate_inquiry_submitted"
  | "inquiry_submitted"
  | "event_estimate_used";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;
  const payload = { event, ...props };
  window.dataLayer?.push(payload);
  window.dispatchEvent(new CustomEvent("signiorina:analytics", { detail: payload }));
  if (process.env.NODE_ENV === "development") console.debug("[analytics]", payload);
}
