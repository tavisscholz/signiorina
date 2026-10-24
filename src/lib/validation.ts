import { z } from "zod";

import { getProduct } from "@/config/catalog";
import { getArea } from "@/config/delivery";
import { isISODate } from "@/lib/dates";
import type { CabinDetails, CartLine, CheckoutDetails, DeliverySelection } from "@/lib/types";

/** Feature flag: pre-arrival refrigerator handoff via property managers (pending insurer confirmation). */
export const cabinHandoffConfig = {
  propertyManagerAccessEnabled: true,
};

const phone = z
  .string()
  .trim()
  .refine((v) => v.replace(/\D/g, "").length >= 10, "Enter a phone number with area code.");

export const cartLineSchema = z.object({
  lineId: z.string().min(1).max(64),
  productId: z.string().min(1).max(64),
  variantId: z.string().max(64).optional(),
  quantity: z.number().int().min(1).max(500),
  dietary: z.array(z.enum(["vegetarian", "pork-free", "gluten-conscious", "nut-free"])).max(4),
  addOns: z.array(z.object({ addOnId: z.string().max(64), quantity: z.number().int().min(0).max(50) })).max(12),
  personalization: z.string().trim().max(80).optional(),
});

export const addressSchema = z.object({
  line1: z.string().trim().min(3, "Enter the street address.").max(120),
  line2: z.string().trim().max(80).optional(),
  city: z.string().trim().min(2, "Enter the city.").max(60),
  state: z.literal("TN", { message: "We deliver in Tennessee only." }),
  zip: z.string().trim().regex(/^\d{5}$/, "Enter a 5-digit ZIP code."),
});

export const cabinSchema = z.object({
  roadAccessNotes: z.string().trim().max(500).optional(),
  gateCode: z.string().trim().max(40).optional(),
  driveway: z.enum(["standard", "steep-or-gravel"]).optional(),
  drivewayConfirmed: z.boolean().optional(),
  propertyContactName: z.string().trim().max(80).optional(),
  propertyContactPhone: z.string().trim().max(30).optional(),
  handoff: z.enum(["guest-present", "property-manager"]).optional(),
  propertyManagerCompany: z.string().trim().max(100).optional(),
  propertyManagerContact: z.string().trim().max(80).optional(),
  propertyManagerPhone: z.string().trim().max(30).optional(),
  authorizationNotes: z.string().trim().max(500).optional(),
  unitInfo: z.string().trim().max(120).optional(),
});

export const deliverySchema = z.object({
  areaId: z.string().min(1, "Choose a delivery area."),
  address: addressSchema,
  locationType: z.enum(["home", "cabin", "office", "venue", "hotel", "other"]),
  isBusiness: z.boolean().optional(),
  company: z.string().trim().max(100).optional(),
  cabin: cabinSchema.optional(),
  date: z.string().refine(isISODate, "Choose a delivery date."),
  windowId: z.enum(["morning", "midday", "afternoon"], { message: "Choose a delivery window." }),
});

export const detailsSchema = z.object({
  customer: z.object({
    firstName: z.string().trim().min(1, "Enter your first name.").max(60),
    lastName: z.string().trim().min(1, "Enter your last name.").max(60),
    email: z.string().trim().email("Enter a valid email address.").max(120),
    phone,
    company: z.string().trim().max(100).optional(),
  }),
  recipientDifferent: z.boolean(),
  recipient: z.object({ name: z.string().trim().max(80), phone: z.string().trim().max(30).optional() }).optional(),
  isGift: z.boolean(),
  giftMessage: z.string().trim().max(300).optional(),
  deliveryNotes: z.string().trim().max(500).optional(),
});

export const checkoutRequestSchema = z.object({
  lines: z.array(cartLineSchema).min(1).max(30),
  delivery: deliverySchema,
  details: detailsSchema,
  severeAllergy: z.boolean().optional(),
});

export type FieldErrors = Record<string, string>;

/** Flattens zod issues to { "address.zip": "message" }. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function cartHasPerishables(lines: Pick<CartLine, "productId">[]): boolean {
  return lines.some((l) => getProduct(l.productId)?.perishable);
}

/**
 * Address-step rules beyond field formats: ZIP must sit in the chosen area, and
 * perishable cabin deliveries need a confirmed handoff — never "leave outside".
 */
export function validateDeliveryAddress(
  delivery: DeliverySelection,
  lines: Pick<CartLine, "productId">[],
): FieldErrors {
  const errors: FieldErrors = {};
  const area = delivery.areaId ? getArea(delivery.areaId) : undefined;
  if (!area) {
    errors.areaId = "Choose a delivery area.";
    return errors;
  }
  if (!delivery.locationType) errors.locationType = "Tell us what kind of place this is.";
  const parsed = addressSchema.safeParse(delivery.address ?? {});
  if (!parsed.success) {
    for (const [k, v] of Object.entries(toFieldErrors(parsed.error))) errors[`address.${k}`] = v;
  } else if (!area.zips.includes(parsed.data.zip)) {
    errors["address.zip"] = `That ZIP isn't in our ${area.name} delivery area. Double-check it, or choose a different area.`;
  }
  if (delivery.locationType === "cabin") {
    Object.assign(errors, validateCabin(delivery.cabin ?? {}, cartHasPerishables(lines)));
  }
  return errors;
}

export function validateCabin(cabin: CabinDetails, perishable: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (!cabin.driveway) errors["cabin.driveway"] = "Let us know about the driveway.";
  if (cabin.driveway === "steep-or-gravel" && !cabin.drivewayConfirmed) {
    errors["cabin.drivewayConfirmed"] = "Please confirm how we should handle the driveway.";
  }
  if (perishable) {
    if (!cabin.handoff) errors["cabin.handoff"] = "Choose how we should hand off your order.";
    if (cabin.handoff === "property-manager") {
      if (!cabinHandoffConfig.propertyManagerAccessEnabled) {
        errors["cabin.handoff"] = "Someone needs to be at the cabin to receive perishable food.";
      }
      if (!cabin.propertyManagerCompany?.trim()) errors["cabin.propertyManagerCompany"] = "Enter the property manager or company.";
      if (!cabin.propertyManagerContact?.trim()) errors["cabin.propertyManagerContact"] = "Enter a contact name.";
      if ((cabin.propertyManagerPhone ?? "").replace(/\D/g, "").length < 10) {
        errors["cabin.propertyManagerPhone"] = "Enter the property manager's phone number.";
      }
      if (!cabin.authorizationNotes?.trim()) {
        errors["cabin.authorizationNotes"] = "Tell us how refrigerator access has been authorized.";
      }
      if (!cabin.unitInfo?.trim()) errors["cabin.unitInfo"] = "Enter the cabin name or unit number.";
    }
  }
  return errors;
}

export function validateDetails(details: CheckoutDetails): FieldErrors {
  const parsed = detailsSchema.safeParse(details);
  const errors = parsed.success ? {} : toFieldErrors(parsed.error);
  if (details.recipientDifferent && !details.recipient?.name?.trim()) {
    errors["recipient.name"] = "Enter the recipient's name.";
  }
  return errors;
}

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(120),
  phone,
  company: z.string().trim().max(100).optional(),
  eventType: z.string().trim().min(1, "Choose an event type.").max(60),
  eventDate: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isISODate(v), "Enter a valid date."),
  eventLocation: z.string().trim().min(2, "Where are you gathering?").max(160),
  estimatedGuests: z.coerce.number().int().min(1, "Roughly how many guests?").max(2000).optional(),
  serviceInterest: z.string().trim().min(1, "Choose a service.").max(60),
  budgetRange: z.string().trim().max(60).optional(),
  heardAbout: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, "Tell us a little about the occasion.").max(4000),
  estimate: z.record(z.string(), z.unknown()).optional(),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
