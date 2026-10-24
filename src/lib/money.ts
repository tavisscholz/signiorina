/** Money helpers. Config prices are whole dollars; engines work in integer cents. */

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

const whole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const exact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** "$55" for whole dollars, "$55.36" otherwise. */
export function formatCents(cents: number): string {
  return cents % 100 === 0 ? whole.format(cents / 100) : exact.format(cents / 100);
}

/** Always two decimals — used on totals that include tax. */
export function formatCentsExact(cents: number): string {
  return exact.format(cents / 100);
}

/** Config dollars → "$1,000" (or "$1.50" when there are cents). */
export function formatDollars(dollars: number): string {
  return Number.isInteger(dollars) ? whole.format(dollars) : exact.format(dollars);
}

export function percentOf(cents: number, percent: number): number {
  return Math.round((cents * percent) / 100);
}
