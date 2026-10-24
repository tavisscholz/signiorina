import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import { getAddOn, getProduct } from "@/config/catalog";
import { getArea, getWindow, scheduling } from "@/config/delivery";
import { demoOperations, demoOperationsEnabled, mergeCalendars, operationsCalendar } from "@/config/operations";
import {
  checkSlot,
  computeAvailability,
  suggestDates,
  type AvailabilityRequest,
  type DayAvailability,
} from "@/lib/availability";
import { businessNow } from "@/lib/dates";
import { priceCart, type CartPricing } from "@/lib/pricing";
import type { CartLine, CheckoutDetails, DeliverySelection, Order, OrderItem } from "@/lib/types";
import { validateDeliveryAddress, validateDetails, type FieldErrors } from "@/lib/validation";
import { getStripe, paymentMode, type PaymentMode } from "@/server/payments";
import { bookingsFrom, store } from "@/server/store";

export function operationsFor(now: Date) {
  const today = businessNow(now).date;
  return demoOperationsEnabled() ? mergeCalendars(operationsCalendar, demoOperations(today)) : operationsCalendar;
}

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

export async function availabilityFor(args: { lines: CartLine[]; delivery: DeliverySelection; now?: Date }) {
  const now = args.now ?? new Date();
  const area = args.delivery.areaId ? getArea(args.delivery.areaId) : undefined;
  if (!area) return { ok: false as const, reason: "outside-area" };
  const pricing = priceCart({ lines: args.lines, delivery: { ...args.delivery, date: undefined, windowId: undefined } });
  const request: AvailabilityRequest = {
    lines: args.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    zoneId: area.zone,
    isCorporate: pricing.isCorporate,
    merchandiseSubtotal: pricing.merchandiseSubtotal,
    from: businessNow(now).date,
    days: scheduling.bookingHorizonDays + 1,
  };
  const orders = await store.listOrders();
  const days: DayAvailability[] = computeAvailability(request, {
    now,
    bookings: bookingsFrom(orders, now),
    ops: operationsFor(now),
  });
  return { ok: true as const, zoneId: area.zone, today: request.from, days };
}

/* ------------------------------------------------------------------ */
/* Order creation                                                      */
/* ------------------------------------------------------------------ */

export interface CheckoutInput {
  lines: CartLine[];
  delivery: DeliverySelection;
  details: CheckoutDetails;
  severeAllergy?: boolean;
}

export type CheckoutResult =
  | {
      ok: true;
      mode: PaymentMode;
      orderId: string;
      orderNumber: string;
      accessKey: string;
      clientSecret?: string;
      holdExpiresAt: string;
      pricing: CartPricing;
    }
  | { ok: false; code: string; message: string; fieldErrors?: FieldErrors; suggestions?: DayAvailability[] };

function orderNumber(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return `SIG-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

function toItems(pricing: CartPricing): OrderItem[] {
  return pricing.lines.map((p) => ({
    lineId: p.line.lineId,
    productId: p.product.id,
    productName: p.product.name,
    variantName: p.variant?.name,
    quantity: p.quantity,
    priceUnit: p.product.priceUnit,
    unitPrice: p.unitPrice,
    dietary: p.line.dietary.filter((d) => p.product.dietaryOptions.includes(d)),
    dietaryFee: p.dietaryFee,
    addOns: p.addOns.map((a) => ({
      addOnId: a.addOn.id,
      name: getAddOn(a.addOn.id)?.name ?? a.addOn.name,
      quantity: a.quantity,
      unitPrice: a.unitPrice,
      total: a.total,
      message: a.message,
    })),
    personalization: p.line.personalization?.trim() || undefined,
    lineTotal: p.lineTotal,
  }));
}

/** Validates everything server-side, books a capacity hold and prepares payment. */
export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const now = new Date();
  const mode = paymentMode();
  if (mode === "unavailable") {
    return {
      ok: false,
      code: "payments-unavailable",
      message: "Online payment isn't switched on yet. Your cart is saved — please send us a note and we'll take your order directly.",
    };
  }
  if (input.severeAllergy) {
    return {
      ok: false,
      code: "severe-allergy",
      message: "Because someone in your group has a severe allergy, please contact us before ordering so we can talk it through.",
    };
  }

  // Drop invalid dietary choices and add-ons rather than trusting the client.
  const lines: CartLine[] = input.lines.map((l) => {
    const product = getProduct(l.productId);
    return {
      ...l,
      variantId: product?.variants?.some((v) => v.id === l.variantId) ? l.variantId : product?.variants?.[0]?.id,
      dietary: l.dietary.filter((d) => product?.dietaryOptions.includes(d)),
      addOns: l.addOns.filter((a) => product?.addOnIds.includes(a.addOnId) && a.quantity > 0),
    };
  });

  const addressErrors = validateDeliveryAddress(input.delivery, lines);
  const detailErrors = validateDetails(input.details);
  if (Object.keys(addressErrors).length || Object.keys(detailErrors).length) {
    return {
      ok: false,
      code: "invalid",
      message: "A few details need another look.",
      fieldErrors: { ...addressErrors, ...detailErrors },
    };
  }

  const area = getArea(input.delivery.areaId!)!;
  const pricing = priceCart({ lines, delivery: input.delivery, now });
  const blocking = pricing.issues.find((i) => i.blocking);
  if (blocking) return { ok: false, code: blocking.code, message: blocking.message };
  if (pricing.delivery.status !== "quoted" || !input.delivery.date || !input.delivery.windowId) {
    return { ok: false, code: "schedule", message: "Choose a delivery date and window." };
  }

  const date = input.delivery.date;
  const windowId = input.delivery.windowId;
  const slotRequest = {
    lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
    zoneId: area.zone,
    isCorporate: pricing.isCorporate,
    merchandiseSubtotal: pricing.merchandiseSubtotal,
  };

  const created = await store.exclusive(async () => {
    const orders = await store.listOrders();
    const ctx = { now, bookings: bookingsFrom(orders, now), ops: operationsFor(now) };
    const slot = checkSlot(date, windowId, slotRequest, ctx);
    if (!slot.ok) {
      return { ok: false as const, reason: slot.reason, suggestions: suggestDates(date, slotRequest, ctx) };
    }
    const holdExpiresAt = new Date(now.getTime() + scheduling.holdMinutes * 60_000).toISOString();
    const order: Order = {
      id: randomUUID(),
      number: orderNumber(),
      createdAt: now.toISOString(),
      status: "pending_payment",
      paymentStatus: "requires_payment",
      fulfillmentStatus: "unscheduled",
      items: toItems(pricing),
      totals: {
        itemsSubtotal: pricing.itemsSubtotal,
        addOnsTotal: pricing.addOnsTotal,
        merchandiseSubtotal: pricing.merchandiseSubtotal,
        delivery: pricing.delivery.fee,
        rushFee: pricing.rushFee,
        holidayFee: pricing.holidayFee,
        tax: pricing.tax,
        taxRate: pricing.taxRate,
        total: pricing.total,
      },
      delivery: {
        areaId: area.id,
        areaName: area.name,
        zoneId: area.zone,
        address: input.delivery.address!,
        locationType: input.delivery.locationType!,
        company: input.delivery.company?.trim() || undefined,
        date,
        windowId,
        windowDisplay: getWindow(windowId).display,
        cabin: input.delivery.locationType === "cabin" ? input.delivery.cabin : undefined,
        notes: input.details.deliveryNotes?.trim() || undefined,
      },
      customer: {
        ...input.details.customer,
        company: input.details.customer.company?.trim() || input.delivery.company?.trim() || undefined,
      },
      recipient: input.details.recipientDifferent ? input.details.recipient : undefined,
      isGift: input.details.isGift,
      giftMessage: input.details.isGift ? input.details.giftMessage?.trim() : undefined,
      corporate: pricing.isCorporate,
      capacityPoints: slot.window.points,
      holdExpiresAt,
      paymentProvider: mode === "stripe" ? "stripe" : "none",
      accessKey: randomBytes(18).toString("base64url"),
    };
    await store.saveOrder(order);
    return { ok: true as const, order };
  });

  if (!created.ok) {
    return { ok: false, code: "slot-unavailable", message: created.reason, suggestions: created.suggestions };
  }

  const order = created.order;
  let clientSecret: string | undefined;
  if (mode === "stripe") {
    try {
      const intent = await getStripe().paymentIntents.create(
        {
          amount: order.totals.total,
          currency: "usd",
          automatic_payment_methods: { enabled: true },
          receipt_email: order.customer.email,
          description: `Signiorina order ${order.number}`,
          metadata: { orderId: order.id, orderNumber: order.number, deliveryDate: order.delivery.date },
        },
        { idempotencyKey: `order-${order.id}` },
      );
      clientSecret = intent.client_secret ?? undefined;
      await store.updateOrder(order.id, (o) => ({ ...o, stripePaymentIntentId: intent.id }));
    } catch (error) {
      console.error("[checkout] Stripe PaymentIntent failed", error);
      await store.updateOrder(order.id, (o) => ({ ...o, status: "cancelled", holdExpiresAt: undefined }));
      return {
        ok: false,
        code: "payment-setup",
        message: "We couldn't start the payment just now. Nothing was charged — please try again in a moment.",
      };
    }
  }

  return {
    ok: true,
    mode,
    orderId: order.id,
    orderNumber: order.number,
    accessKey: order.accessKey,
    clientSecret,
    holdExpiresAt: order.holdExpiresAt!,
    pricing,
  };
}

/* ------------------------------------------------------------------ */
/* Revalidation right before payment, and dev-mode completion          */
/* ------------------------------------------------------------------ */

async function authorizedOrder(orderId: string, accessKey: string): Promise<Order | undefined> {
  const order = await store.getOrder(orderId);
  return order && order.accessKey === accessKey ? order : undefined;
}

/** Re-checks capacity at submission time and refreshes the hold. */
export async function revalidateOrder(orderId: string, accessKey: string) {
  return store.exclusive(async () => {
    const order = await authorizedOrder(orderId, accessKey);
    if (!order) return { ok: false as const, code: "not-found", message: "We couldn't find that order." };
    if (order.status === "confirmed") return { ok: true as const, order };
    if (order.status !== "pending_payment") {
      return { ok: false as const, code: "expired", message: "This checkout expired. Please review your delivery details again." };
    }
    const now = new Date();
    const orders = await store.listOrders();
    const req = {
      lines: order.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      zoneId: order.delivery.zoneId,
      isCorporate: order.corporate,
      merchandiseSubtotal: order.totals.merchandiseSubtotal,
    };
    const ctx = { now, bookings: bookingsFrom(orders, now, order.id), ops: operationsFor(now) };
    const slot = checkSlot(order.delivery.date, order.delivery.windowId, req, ctx);
    if (!slot.ok) {
      await store.updateOrder(order.id, (o) => ({ ...o, status: "expired", holdExpiresAt: undefined }));
      return {
        ok: false as const,
        code: "slot-unavailable",
        message: `${slot.reason} Nothing was charged — please choose another time.`,
        suggestions: suggestDates(order.delivery.date, req, ctx),
      };
    }
    const holdExpiresAt = new Date(now.getTime() + scheduling.holdMinutes * 60_000).toISOString();
    const updated = await store.updateOrder(order.id, (o) => ({ ...o, holdExpiresAt }));
    return { ok: true as const, order: updated! };
  });
}

export async function completeDevOrder(orderId: string, accessKey: string) {
  if (paymentMode() !== "dev") return { ok: false as const, message: "Development orders are disabled." };
  const check = await revalidateOrder(orderId, accessKey);
  if (!check.ok) return check;
  const order = await store.updateOrder(orderId, (o) => ({
    ...o,
    status: "confirmed",
    paymentStatus: "not_collected_dev",
    fulfillmentStatus: "scheduled",
    holdExpiresAt: undefined,
  }));
  return { ok: true as const, order: order! };
}

/** Marks a Stripe-paid order confirmed (from the webhook or a confirmation-page sync). */
export async function markOrderPaid(paymentIntentId: string, amountReceived: number) {
  const order = await store.findOrderByPaymentIntent(paymentIntentId);
  if (!order || order.paymentStatus === "paid") return order;
  const amountMatches = amountReceived === order.totals.total;
  const holdLapsed =
    order.status !== "pending_payment" || (order.holdExpiresAt !== undefined && new Date(order.holdExpiresAt) < new Date());
  return store.updateOrder(order.id, (o) => ({
    ...o,
    paymentStatus: "paid",
    // Paid after the hold lapsed (or for an unexpected amount): keep the booking, flag for the owner to review.
    status: amountMatches && !holdLapsed ? "confirmed" : "needs_attention",
    fulfillmentStatus: "scheduled",
    holdExpiresAt: undefined,
  }));
}

export async function markPaymentFailed(paymentIntentId: string) {
  const order = await store.findOrderByPaymentIntent(paymentIntentId);
  if (!order || order.paymentStatus === "paid") return order;
  return store.updateOrder(order.id, (o) => ({ ...o, paymentStatus: "failed" }));
}

/** Loads an order for its confirmation page, syncing with Stripe if the webhook hasn't landed yet. */
export async function getOrderForConfirmation(orderId: string, accessKey: string): Promise<Order | undefined> {
  const order = await authorizedOrder(orderId, accessKey);
  if (!order) return undefined;
  if (order.paymentProvider === "stripe" && order.paymentStatus !== "paid" && order.stripePaymentIntentId) {
    try {
      const intent = await getStripe().paymentIntents.retrieve(order.stripePaymentIntentId);
      if (intent.status === "succeeded") return (await markOrderPaid(intent.id, intent.amount_received)) ?? order;
      if (intent.status === "processing") {
        return (await store.updateOrder(order.id, (o) => ({ ...o, paymentStatus: "processing" }))) ?? order;
      }
    } catch (error) {
      console.error("[confirmation] Stripe sync failed", error);
    }
  }
  return order;
}
