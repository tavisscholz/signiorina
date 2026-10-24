import { scheduling } from "@/config/delivery";
import { formatDollars } from "@/lib/money";
import type { Product } from "@/lib/types";

/** "48-hour notice" / "14 days' notice" */
export function leadTimeLabel(days: number): string {
  return days <= 3 ? `${days * 24}\u2011hour notice` : `${days} days' notice`;
}

/** "Order by noon, two days ahead" style sentence. */
export function leadTimeSentence(days: number): string {
  const words = ["zero", "one", "two", "three", "four", "five", "six", "seven"];
  const n = days < words.length ? words[days] : String(days);
  const hour = scheduling.cutoffHour === 12 ? "noon" : `${scheduling.cutoffHour % 12 || 12}${scheduling.cutoffHour < 12 ? " AM" : " PM"}`;
  return `Order by ${hour}, ${n} day${days === 1 ? "" : "s"} before delivery`;
}

export function priceLabel(product: Product): string {
  return product.priceUnit === "person" ? `${formatDollars(product.price)} / guest` : formatDollars(product.price);
}

/** The minimum a quick-add should drop in the cart. */
export function quickAddQuantity(product: Product): number {
  return product.minimumQuantity ?? product.deliveryBundle?.quantity ?? 1;
}

/** Products whose options must be chosen on the product page first. */
export function needsConfiguration(product: Product): boolean {
  return Boolean(product.personalization?.required);
}
