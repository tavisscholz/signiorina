import type { Metadata } from "next";

import { DetailsStep } from "@/components/checkout/DetailsStep";

export const metadata: Metadata = { title: "Your details", robots: { index: false } };

export default function CheckoutDetailsPage() {
  return <DetailsStep />;
}
