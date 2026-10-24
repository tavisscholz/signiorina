"use client";

import { useMemo } from "react";

import { useCartHydrated } from "@/components/providers/StoreHydrator";
import { useCart } from "@/lib/cart-store";
import { priceCart, type CartPricing } from "@/lib/pricing";
import { useNow } from "@/lib/use-now";

/** Live cart totals in the browser. The server re-prices everything before payment. */
export function useCartPricing(): { pricing: CartPricing; hydrated: boolean } {
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const delivery = useCart((s) => s.delivery);
  const now = useNow();

  const pricing = useMemo(
    () =>
      priceCart({
        lines: hydrated ? lines : [],
        delivery: hydrated ? delivery : {},
        now: now === undefined ? undefined : new Date(now),
      }),
    [hydrated, lines, delivery, now],
  );
  return { pricing, hydrated };
}
