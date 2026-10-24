import type { Metadata } from "next";

import { DeliveryScheduler } from "@/components/checkout/DeliveryScheduler";

export const metadata: Metadata = { title: "Delivery", robots: { index: false } };

export default function CheckoutDeliveryPage() {
  return <DeliveryScheduler />;
}
