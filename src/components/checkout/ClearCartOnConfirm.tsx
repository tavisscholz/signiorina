"use client";

import { useEffect } from "react";

import { useCart, useCheckoutDetails } from "@/lib/cart-store";

/** Empties the cart once an order is confirmed. */
export function ClearCartOnConfirm({ orderId }: { orderId: string }) {
  useEffect(() => {
    const key = `signiorina-cleared-${orderId}`;
    if (sessionStorage.getItem(key)) return;
    const run = () => {
      useCart.getState().clear();
      useCheckoutDetails.getState().reset();
      sessionStorage.removeItem("signiorina-payment-session");
      sessionStorage.setItem(key, "1");
    };
    if (useCart.persist.hasHydrated()) run();
    else return useCart.persist.onFinishHydration(run);
  }, [orderId]);
  return null;
}
