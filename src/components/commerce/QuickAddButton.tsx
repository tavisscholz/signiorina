"use client";

import { useState } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/Icons";
import { getProduct } from "@/config/catalog";
import { track } from "@/lib/analytics";
import { useCart } from "@/lib/cart-store";
import { needsConfiguration, quickAddQuantity } from "@/lib/format";

export function QuickAddButton({ productId, className }: { productId: string; className?: string }) {
  const product = getProduct(productId)!;
  const addLine = useCart((s) => s.addLine);
  const openDrawer = useCart((s) => s.openDrawer);
  const [added, setAdded] = useState(false);

  if (needsConfiguration(product)) {
    return (
      <ButtonLink href={`/order/${product.slug}`} size="sm" className={className}>
        Choose options
      </ButtonLink>
    );
  }

  const qty = quickAddQuantity(product);
  return (
    <Button
      size="sm"
      className={className}
      onClick={() => {
        addLine({
          productId: product.id,
          variantId: product.variants?.[0]?.id,
          quantity: qty,
          dietary: [],
          addOns: [],
        });
        track("add_to_cart", { product_id: product.id, quantity: qty, source: "card" });
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
        openDrawer();
      }}
    >
      {added ? (
        <>
          <IconCheck size={16} /> Added
        </>
      ) : qty > 1 ? (
        `Add ${qty} to cart`
      ) : (
        "Add to cart"
      )}
      <span className="sr-only"> — {product.name}</span>
    </Button>
  );
}
