/**
 * Signiorina commerce + operations data model.
 *
 * Every operational rule lives in `src/config/*` as data shaped by these types,
 * so the same records can later come from a CMS or database without touching
 * presentation code.
 */

/** Calendar date in the business time zone, formatted YYYY-MM-DD. */
export type ISODate = string;

export type ZoneId = "A" | "B" | "C";
export type WindowId = "morning" | "midday" | "afternoon";
export type CategoryId =
  | "for-one"
  | "for-two"
  | "gather"
  | "cabin"
  | "corporate"
  | "gifts"
  | "wedding-weekend";
export type DietaryId = "vegetarian" | "pork-free" | "gluten-conscious" | "nut-free";

/* ------------------------------------------------------------------ */
/* Catalog                                                             */
/* ------------------------------------------------------------------ */

export interface Category {
  id: CategoryId;
  label: string;
  description: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  description?: string;
}

export interface VolumePrice {
  /** Applies when the cart holds at least this many of the product (all lines combined). */
  minQuantity: number;
  unitPrice: number;
}

export interface Personalization {
  label: string;
  helper?: string;
  maxLength: number;
  required: boolean;
}

export type ProductStatus = "active" | "hidden" | "test";

export interface Product {
  id: string;
  slug: string;
  name: string;
  status: ProductStatus;
  categories: CategoryId[];
  /** Whole-dollar unit price. */
  price: number;
  priceUnit: "each" | "person";
  volumePricing?: VolumePrice[];
  serves: string;
  /** Card + listing line. */
  tagline: string;
  description: string[];
  /** Indicative ingredients. Seasonal swaps happen. */
  contents: string[];
  useCases: string[];
  /** Order by the lead-time cutoff hour, this many days before delivery. */
  leadTimeDays: number;
  /** May be ordered inside the normal lead time for the rush fee, capacity permitting. */
  allowRush: boolean;
  /** Minimum quantity across all cart lines of this product. */
  minimumQuantity?: number;
  /** e.g. Aperitivo Box: deliver 4+, unless the cart otherwise reaches the delivery minimum. */
  deliveryBundle?: { quantity: number; waivedAtSubtotal: number };
  /** Restricts the delivery windows this product can travel in. */
  allowedWindows?: WindowId[];
  perishable: boolean;
  dietaryOptions: DietaryId[];
  /** Gluten-conscious upcharge per unit (boards) or per person (per-person products). */
  glutenConsciousFee: number;
  addOnIds: string[];
  variants?: ProductVariant[];
  personalization?: Personalization;
  corporate?: boolean;
  signature?: boolean;
  badge?: string;
  /** Label used on quantity controls, e.g. "Boxes" or "Guests". */
  quantityLabel: string;
  maxQuantity: number;
  images: string[];
  /** Products to suggest when this one can't be delivered on a chosen date. */
  alternatives?: string[];
  /** Extra notes shown on the product page (delivery specifics etc.). */
  notes?: string[];
  seo: { title: string; description: string };
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  priceUnit: "each" | "person" | "hour";
  serves?: string;
  /** Where the add-on can be chosen. */
  scope: Array<"cart" | "event">;
  minimumQuantity?: number;
  maxQuantity?: number;
  perishable?: boolean;
  note?: string;
}

export interface DietaryOption {
  id: DietaryId;
  label: string;
  short: string;
  description: string;
  /** True when the option carries a fee (amount lives on the product / event config). */
  hasFee: boolean;
}

/* ------------------------------------------------------------------ */
/* Delivery                                                            */
/* ------------------------------------------------------------------ */

export interface DeliveryArea {
  id: string;
  name: string;
  city: string;
  county: string;
  zone: ZoneId;
  zips: string[];
  /** Areas that are cabin-heavy prompt the cabin access questions up front. */
  cabinCountry?: boolean;
  /** Local landing page slug, when this area has one. */
  pageSlug?: string;
}

export interface RouteDays {
  /** 0 = Sunday … 6 = Saturday. */
  weekdays: number[];
  fee: number;
  /** Corporate orders on route days ship free at or above this merchandise subtotal. */
  corporateFreeDeliveryAt: number;
  windows: WindowId[];
  label: string;
}

export interface DeliveryZone {
  id: ZoneId;
  name: string;
  label: string;
  description: string;
  fee: number;
  /** Free delivery at or above this merchandise subtotal. Null = never automatically free. */
  freeDeliveryAt: number | null;
  routeDays?: RouteDays;
  /** Off-route orders below this merchandise subtotal are not accepted online. */
  offRouteMinimumSubtotal?: number;
}

export interface DeliveryWindow {
  id: WindowId;
  label: string;
  start: string;
  end: string;
  display: string;
  uses: string[];
}

export type HolidayRule =
  | { type: "dates"; month: number; days: number[] }
  | { type: "range"; startMonth: number; startDay: number; endMonth: number; endDay: number }
  | { type: "mothers-day-weekend" }
  | { type: "thanksgiving-week" };

export interface HolidayPeriod {
  id: string;
  name: string;
  rule: HolidayRule;
  /** No rush orders; normal lead times apply and quantities are capped. */
  preorderOnly: boolean;
  /** Flat fee added to direct orders delivered on these dates. */
  directOrderFee: number;
  /** Maximum direct orders per date. */
  maxOrdersPerDay: number;
  /** Optional per-product unit caps per date. */
  productCaps?: Record<string, number>;
}

export interface CapacityConfig {
  /** Capacity units ("stop points") available per window, per date. One vehicle at launch. */
  windowPoints: Record<WindowId, number>;
  /** Points one stop consumes, by zone. */
  zonePoints: Record<ZoneId, number>;
  /** Window-specific overrides of zone points. */
  zonePointsByWindow?: Partial<Record<WindowId, Partial<Record<ZoneId, number>>>>;
  /** Zone points on route days (batched stops cost less). */
  routeDayZonePoints: Partial<Record<ZoneId, number>>;
  /** Points held back for corporate orders on route days. */
  routeDayCorporateReserve: Partial<Record<WindowId, number>>;
  /** A window is shown as "few left" when remaining stops after this order are at or below this count. */
  fewLeftStops: number;
}

export interface OperationsCalendar {
  /** Booked events that block delivery windows. */
  eventBlocks: Array<{
    date: ISODate;
    windows: WindowId[] | "all";
    /** Counts toward the Saturday close threshold. */
    significant: boolean;
    label?: string;
  }>;
  /** Manually closed windows or dates. */
  soldOut: Array<{ date: ISODate; windows?: WindowId[]; zones?: ZoneId[] }>;
  blackoutDates: ISODate[];
  capacityOverrides: Array<{ date: ISODate; windowPoints: Partial<Record<WindowId, number>> }>;
}

/** A unit of booked delivery capacity (from paid orders or active checkout holds). */
export interface Booking {
  orderId: string;
  date: ISODate;
  windowId: WindowId;
  zoneId: ZoneId;
  points: number;
  corporate: boolean;
  productQuantities: Record<string, number>;
}

/* ------------------------------------------------------------------ */
/* Cart + checkout                                                     */
/* ------------------------------------------------------------------ */

export interface CartAddOn {
  addOnId: string;
  quantity: number;
}

export interface CartLine {
  lineId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  dietary: DietaryId[];
  addOns: CartAddOn[];
  personalization?: string;
}

export type LocationType = "home" | "cabin" | "office" | "venue" | "hotel" | "other";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export type CabinHandoff = "guest-present" | "property-manager";

export interface CabinDetails {
  roadAccessNotes?: string;
  gateCode?: string;
  /** Customer's answer about the driveway. */
  driveway?: "standard" | "steep-or-gravel";
  drivewayConfirmed?: boolean;
  propertyContactName?: string;
  propertyContactPhone?: string;
  handoff?: CabinHandoff;
  propertyManagerCompany?: string;
  propertyManagerContact?: string;
  propertyManagerPhone?: string;
  authorizationNotes?: string;
  unitInfo?: string;
}

export interface DeliverySelection {
  areaId?: string;
  address?: Address;
  locationType?: LocationType;
  isBusiness?: boolean;
  company?: string;
  cabin?: CabinDetails;
  date?: ISODate;
  windowId?: WindowId;
}

export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
}

export interface Recipient {
  name: string;
  phone?: string;
}

export interface CheckoutDetails {
  customer: Customer;
  recipientDifferent: boolean;
  recipient?: Recipient;
  isGift: boolean;
  giftMessage?: string;
  deliveryNotes?: string;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export type PaymentStatus =
  | "requires_payment"
  | "processing"
  | "paid"
  | "failed"
  | "refunded"
  /** Development only: order placed without a payment provider. */
  | "not_collected_dev";

export type FulfillmentStatus =
  | "unscheduled"
  | "scheduled"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderStatus = "pending_payment" | "confirmed" | "needs_attention" | "expired" | "cancelled";

export interface OrderItem {
  lineId: string;
  productId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  priceUnit: "each" | "person";
  unitPrice: number;
  dietary: DietaryId[];
  dietaryFee: number;
  addOns: Array<{ addOnId: string; name: string; quantity: number; unitPrice: number; total: number }>;
  personalization?: string;
  lineTotal: number;
}

/** All money values on orders and totals are integer cents. */
export interface OrderTotals {
  itemsSubtotal: number;
  addOnsTotal: number;
  merchandiseSubtotal: number;
  delivery: number;
  rushFee: number;
  holidayFee: number;
  tax: number;
  taxRate: number;
  total: number;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  totals: OrderTotals;
  delivery: {
    areaId: string;
    areaName: string;
    zoneId: ZoneId;
    address: Address;
    locationType: LocationType;
    company?: string;
    date: ISODate;
    windowId: WindowId;
    windowDisplay: string;
    cabin?: CabinDetails;
    notes?: string;
  };
  customer: Customer;
  recipient?: Recipient;
  isGift: boolean;
  giftMessage?: string;
  corporate: boolean;
  corporateAccountId?: string;
  capacityPoints: number;
  holdExpiresAt?: string;
  paymentProvider: "stripe" | "none";
  stripePaymentIntentId?: string;
  /** Unguessable key required to read the order back on the confirmation page. */
  accessKey: string;
}

export interface CorporateAccount {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone?: string;
  /** Standing Lunch Program: orders at least this many times per month. */
  standingProgram: boolean;
  freeDelivery: boolean;
  priorityWindow?: WindowId;
  monthlyInvoicing: boolean;
  /** Standing accounts may book with a shorter lead time when capacity permits. */
  leadTimeDaysOverride?: number;
}

/* ------------------------------------------------------------------ */
/* Events                                                              */
/* ------------------------------------------------------------------ */

export interface EventInquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  eventType: string;
  eventDate?: ISODate;
  eventLocation: string;
  estimatedGuests?: number;
  serviceInterest: string;
  budgetRange?: string;
  heardAbout?: string;
  /** Optional for planner submissions (older inquiries always have one). */
  message?: string;
  estimate?: Record<string, unknown>;
  /** Planner submissions only (threeJourneyArchitectureV2). */
  planner?: { journey: "weddings" | "events"; start?: "preset" | "custom"; preset?: string; occasion?: string; area?: string };
}
