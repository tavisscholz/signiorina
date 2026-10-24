import type { Metadata } from "next";

import { CartView } from "@/components/commerce/CartView";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <section className="container-page pb-16 pt-12 md:pt-16">
      <p className="eyebrow flex items-center gap-3 text-olive-soft">
        <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
        Step 1 of 6 · Cart
      </p>
      <h1 className="display-lg mt-4 text-olive">Your table</h1>
      <div className="mt-10">
        <CartView />
      </div>
    </section>
  );
}
