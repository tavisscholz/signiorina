import { getAddOn, getProduct } from "@/config/catalog";
import { getArea, getWindow, getZone, holidays, scheduling, tax, taxRateForArea, zones } from "@/config/delivery";
import { formatDateLong, isBeforeCutoff } from "@/lib/dates";
import { feeForWindow, minimumOrderCents, routeDayNames, zoneFeeSummary } from "@/lib/delivery-fees";
import { holidayForDate } from "@/lib/holidays";
import { formatCents, formatDollars, toCents } from "@/lib/money";
import type {
  AddOn,
  CartLine,
  DeliverySelection,
  HolidayPeriod,
  Product,
  ProductVariant,
  ZoneId,
} from "@/lib/types";

/**
 * Cart pricing. Pure and shared: the browser uses it to show live totals and the
 * server re-runs it from scratch before taking payment — client prices are never trusted.
 * All money values are integer cents.
 */

export interface PricedAddOn {
  addOn: AddOn;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PricedLine {
  line: CartLine;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  listUnitPrice: number;
  volumeApplied: boolean;
  baseTotal: number;
  dietaryFee: number;
  addOns: PricedAddOn[];
  addOnsTotal: number;
  lineTotal: number;
}

export type IssueCode =
  | "empty"
  | "below-minimum"
  | "delivery-bundle"
  | "product-minimum"
  | "personalization-required"
  | "unknown-product"
  | "off-route-minimum";

export interface CartIssue {
  code: IssueCode;
  message: string;
  productId?: string;
  /** Blocking issues prevent checkout. */
  blocking: boolean;
}

export interface DeliveryQuote {
  /** "estimated": area known and the fee doesn't depend on the date. */
  status: "needs-address" | "needs-date" | "estimated" | "quoted";
  fee: number;
  label: string;
  detail?: string;
  routeStop?: boolean;
}

export interface CartPricing {
  lines: PricedLine[];
  itemsSubtotal: number;
  addOnsTotal: number;
  merchandiseSubtotal: number;
  delivery: DeliveryQuote;
  rushFee: number;
  rushRequired: boolean;
  holidayFee: number;
  holiday?: HolidayPeriod;
  taxRate: number;
  taxEstimated: boolean;
  tax: number;
  total: number;
  isCorporate: boolean;
  zoneId?: ZoneId;
  issues: CartIssue[];
  /** Cents still needed to reach the online delivery minimum. */
  amountToMinimum: number;
  canCheckout: boolean;
}

function unitPriceFor(product: Product, totalQuantity: number): { unit: number; volumeApplied: boolean } {
  const tiers = [...(product.volumePricing ?? [])].sort((a, b) => b.minQuantity - a.minQuantity);
  const tier = tiers.find((t) => totalQuantity >= t.minQuantity);
  return tier ? { unit: toCents(tier.unitPrice), volumeApplied: true } : { unit: toCents(product.price), volumeApplied: false };
}

export function cartIsCorporate(lines: CartLine[], delivery?: DeliverySelection): boolean {
  return Boolean(delivery?.isBusiness) || lines.some((l) => getProduct(l.productId)?.corporate);
}

/** True when the chosen date sits inside a product's normal lead time but rush is still possible. */
export function rushRequiredFor(lines: CartLine[], date: string, now: Date): boolean {
  return lines.some((line) => {
    const product = getProduct(line.productId);
    if (!product) return false;
    return !isBeforeCutoff(now, date, product.leadTimeDays, scheduling.cutoffHour);
  });
}

export function priceLines(lines: CartLine[]): { priced: PricedLine[]; unknown: CartLine[] } {
  const totals = new Map<string, number>();
  for (const line of lines) totals.set(line.productId, (totals.get(line.productId) ?? 0) + line.quantity);

  const priced: PricedLine[] = [];
  const unknown: CartLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product || product.status !== "active") {
      unknown.push(line);
      continue;
    }
    const { unit, volumeApplied } = unitPriceFor(product, totals.get(product.id) ?? line.quantity);
    const baseTotal = unit * line.quantity;
    const dietaryFee = line.dietary.includes("gluten-conscious") ? toCents(product.glutenConsciousFee) * line.quantity : 0;
    const addOns: PricedAddOn[] = line.addOns
      .map((a) => {
        const addOn = getAddOn(a.addOnId);
        if (!addOn || !addOn.scope.includes("cart") || a.quantity <= 0) return null;
        const unitPrice = toCents(addOn.price);
        return { addOn, quantity: a.quantity, unitPrice, total: unitPrice * a.quantity };
      })
      .filter((a): a is PricedAddOn => a !== null);
    const addOnsTotal = addOns.reduce((sum, a) => sum + a.total, 0);
    priced.push({
      line,
      product,
      variant: product.variants?.find((v) => v.id === line.variantId),
      quantity: line.quantity,
      unitPrice: unit,
      listUnitPrice: toCents(product.price),
      volumeApplied,
      baseTotal,
      dietaryFee,
      addOns,
      addOnsTotal,
      lineTotal: baseTotal + dietaryFee + addOnsTotal,
    });
  }
  return { priced, unknown };
}

export function priceCart(args: { lines: CartLine[]; delivery?: DeliverySelection; now?: Date }): CartPricing {
  const { lines, delivery } = args;
  const { priced, unknown } = priceLines(lines);

  const itemsSubtotal = priced.reduce((sum, l) => sum + l.baseTotal + l.dietaryFee, 0);
  const addOnsTotal = priced.reduce((sum, l) => sum + l.addOnsTotal, 0);
  const merchandiseSubtotal = itemsSubtotal + addOnsTotal;
  const isCorporate = cartIsCorporate(lines, delivery);
  const issues: CartIssue[] = [];

  if (priced.length === 0) {
    issues.push({ code: "empty", message: "Nothing on the table yet.", blocking: true });
  }
  for (const line of unknown) {
    issues.push({
      code: "unknown-product",
      message: "One item is no longer available and will be removed.",
      productId: line.productId,
      blocking: true,
    });
  }

  // Product-level minimums and bundles (across all lines of the same product).
  const quantities = new Map<string, number>();
  for (const l of priced) quantities.set(l.product.id, (quantities.get(l.product.id) ?? 0) + l.quantity);
  let bundleIssue = false;
  for (const [productId, quantity] of quantities) {
    const product = getProduct(productId)!;
    if (product.minimumQuantity && quantity < product.minimumQuantity) {
      const unit = product.quantityLabel.toLowerCase();
      issues.push({
        code: "product-minimum",
        message: `${product.name} starts at ${product.minimumQuantity} ${unit} — add ${product.minimumQuantity - quantity} more.`,
        productId,
        blocking: true,
      });
    }
    if (
      product.deliveryBundle &&
      quantity < product.deliveryBundle.quantity &&
      merchandiseSubtotal < toCents(product.deliveryBundle.waivedAtSubtotal)
    ) {
      bundleIssue = true;
      issues.push({
        code: "delivery-bundle",
        message: `${product.name}: delivered in sets of ${product.deliveryBundle.quantity} — or add any number to an order over ${formatDollars(product.deliveryBundle.waivedAtSubtotal)}.`,
        productId,
        blocking: true,
      });
    }
  }
  for (const l of priced) {
    if (l.product.personalization?.required && !l.line.personalization?.trim()) {
      issues.push({
        code: "personalization-required",
        message: `Add the ${l.product.personalization.label.toLowerCase()} for your ${l.product.name}.`,
        productId: l.product.id,
        blocking: true,
      });
    }
  }

  const amountToMinimum = Math.max(0, minimumOrderCents - merchandiseSubtotal);
  if (priced.length > 0 && amountToMinimum > 0 && !bundleIssue) {
    issues.push({
      code: "below-minimum",
      message: `Delivery begins at ${formatDollars(scheduling.minimumOrder)}. Add ${formatCents(amountToMinimum)} more to schedule it.`,
      blocking: true,
    });
  }

  // Delivery
  const area = delivery?.areaId ? getArea(delivery.areaId) : undefined;
  let deliveryQuote: DeliveryQuote;
  let rushRequired = false;
  let holiday: HolidayPeriod | undefined;
  if (!area) {
    deliveryQuote = {
      status: "needs-address",
      fee: 0,
      label: "Delivery",
      detail: `From ${formatDollars(Math.min(...zones.map((z) => z.fee)))} — set by your delivery area.`,
    };
  } else if (!delivery?.date || !delivery.windowId) {
    if (getZone(area.zone).routeDays) {
      deliveryQuote = { status: "needs-date", fee: 0, label: `Delivery · ${area.name}`, detail: zoneFeeSummary(area.zone) };
    } else {
      const estimate = feeForWindow({ zoneId: area.zone, merchandiseSubtotal, isCorporate });
      deliveryQuote = {
        status: "estimated",
        fee: estimate.fee,
        label: estimate.waived ? `Delivery · ${area.name} (free)` : `Delivery · ${area.name}`,
        detail: zoneFeeSummary(area.zone),
      };
    }
  } else {
    const windowFee = feeForWindow({
      zoneId: area.zone,
      date: delivery.date,
      windowId: delivery.windowId,
      merchandiseSubtotal,
      isCorporate,
    });
    deliveryQuote = {
      status: "quoted",
      fee: windowFee.fee,
      label: windowFee.waived ? "Delivery (free)" : "Delivery",
      detail: `${area.name} · ${formatDateLong(delivery.date)}, ${getWindow(delivery.windowId).display}`,
      routeStop: windowFee.routeStop,
    };
    const offRouteMinimum = getZone(area.zone).offRouteMinimumSubtotal;
    if (windowFee.belowOffRouteMinimum && !windowFee.routeStop && offRouteMinimum !== undefined) {
      issues.push({
        code: "off-route-minimum",
        message: `${area.name} orders under ${formatDollars(offRouteMinimum)} travel on our ${routeDayNames(area.zone)} route. Choose a route-day morning or midday window, or add to your order.`,
        blocking: true,
      });
    }
    if (args.now) rushRequired = rushRequiredFor(lines, delivery.date, args.now);
    holiday = holidayForDate(delivery.date, holidays);
  }

  const rushFee = rushRequired ? toCents(scheduling.rush.fee) : 0;
  const holidayFee = holiday ? toCents(holiday.directOrderFee) : 0;
  const taxRate = taxRateForArea(area?.id);
  const taxable =
    merchandiseSubtotal +
    (tax.taxDelivery ? deliveryQuote.fee : 0) +
    (tax.taxRushAndHolidayFees ? rushFee + holidayFee : 0);
  const taxAmount = Math.round(taxable * taxRate);
  const total = merchandiseSubtotal + deliveryQuote.fee + rushFee + holidayFee + taxAmount;

  return {
    lines: priced,
    itemsSubtotal,
    addOnsTotal,
    merchandiseSubtotal,
    delivery: deliveryQuote,
    rushFee,
    rushRequired,
    holidayFee,
    holiday,
    taxRate,
    taxEstimated: !area,
    tax: taxAmount,
    total,
    isCorporate,
    zoneId: area?.zone,
    issues,
    amountToMinimum,
    canCheckout: !issues.some((i) => i.blocking),
  };
}
