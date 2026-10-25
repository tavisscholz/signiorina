"use client";

import Link from "next/link";
import { useState } from "react";

import { Photo } from "@/components/brand/Photo";
import { Button } from "@/components/ui/Button";
import { IconCheck } from "@/components/ui/Icons";
import { getProduct } from "@/config/catalog";
import { track } from "@/lib/analytics";
import { useCart } from "@/lib/cart-store";
import { quickAddQuantity } from "@/lib/format";
import { formatDollars } from "@/lib/money";

/**
 * Near the end of Build Your Table: Vendor Gift Boxes for the wedding team. They're an ordinary
 * cart order (checked out separately from the proposal), so the button adds the smallest
 * deliverable set and opens the cart, where the quantity can change.
 */
export function ThankYourTeam() {
  const gift = getProduct("vendor-gift-box")!;
  const volume = gift.volumePricing?.[0];
  const addLine = useCart((s) => s.addLine);
  const openDrawer = useCart((s) => s.openDrawer);
  const [added, setAdded] = useState(false);

  const add = () => {
    const quantity = quickAddQuantity(gift);
    addLine({ productId: gift.id, quantity, dietary: [], addOns: [] });
    track("add_to_cart", { product_id: gift.id, quantity, source: "wedding-builder" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    openDrawer();
  };

  return (
    <aside
      aria-labelledby="thank-team-title"
      className="mt-12 flex flex-col overflow-hidden rounded-[1.5rem] border border-line bg-paper sm:flex-row"
    >
      <Photo media={gift.images[0]} className="aspect-[16/10] w-full sm:aspect-auto sm:w-48 sm:shrink-0" sizes="(min-width: 640px) 12rem, 92vw" alt="" />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <h3 id="thank-team-title" className="display-sm text-olive">
          It takes a village to make a bride!
        </h3>
        <p className="text-[1rem] text-muted">Thank your wedding team with a {gift.name}.</p>
        <p className="text-[0.85rem] text-muted">
          {formatDollars(gift.price)} each{volume ? `, or ${formatDollars(volume.unitPrice)} each for ${volume.minQuantity}+` : ""} ·
          checked out separately from your proposal.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <Button size="sm" onClick={add} aria-live="polite">
            {added ? (
              <>
                <IconCheck size={16} /> Added to your cart
              </>
            ) : (
              "Add Gift Boxes"
            )}
          </Button>
          <Link
            href={`/order/${gift.slug}`}
            className="label-caps text-[0.68rem] text-olive underline decoration-olive/40 underline-offset-[6px] hover:decoration-olive"
          >
            See what&apos;s inside
          </Link>
        </div>
      </div>
    </aside>
  );
}
