"use client";

import { useEffect, useSyncExternalStore } from "react";

import { useCart, useCheckoutDetails } from "@/lib/cart-store";

/** Rehydrates persisted stores after mount so server and client markup match. */
export function StoreHydrator() {
  useEffect(() => {
    void useCart.persist.rehydrate();
    void useCheckoutDetails.persist.rehydrate();
    document.documentElement.classList.add("hydrated");
  }, []);
  return null;
}

function subscribeCart(callback: () => void) {
  const unsubs = [useCart.persist.onFinishHydration(callback), useCart.persist.onHydrate(callback)];
  return () => unsubs.forEach((u) => u());
}

/** True once the persisted cart has loaded in the browser. */
export function useCartHydrated(): boolean {
  return useSyncExternalStore(
    subscribeCart,
    () => useCart.persist.hasHydrated(),
    () => false,
  );
}

function subscribeDetails(callback: () => void) {
  const unsubs = [useCheckoutDetails.persist.onFinishHydration(callback), useCheckoutDetails.persist.onHydrate(callback)];
  return () => unsubs.forEach((u) => u());
}

export function useDetailsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeDetails,
    () => useCheckoutDetails.persist.hasHydrated(),
    () => false,
  );
}
