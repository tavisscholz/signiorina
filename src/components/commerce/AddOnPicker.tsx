"use client";

import clsx from "clsx";
import Link from "next/link";
import { useId, useState } from "react";

import { useCartHydrated } from "@/components/providers/StoreHydrator";
import { TextAreaField } from "@/components/ui/Field";
import { IconChevronDown } from "@/components/ui/Icons";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { activeProducts, getProduct } from "@/config/catalog";
import { setAddOnMessage, setAddOnQuantity, useCart } from "@/lib/cart-store";
import { formatDollars } from "@/lib/money";
import type { AddOn } from "@/lib/types";

/**
 * The store's extras, each one opening in place: add it to a box already in the cart (the
 * personalized note opens its text box), or pick a box that offers it.
 */
export function AddOnPicker({ addOns }: { addOns: AddOn[] }) {
  return (
    <ul className="mt-6 divide-y divide-line">
      {addOns.map((a) => (
        <AddOnRow key={a.id} addOn={a} />
      ))}
    </ul>
  );
}

function AddOnRow({ addOn }: { addOn: AddOn }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const updateLine = useCart((s) => s.updateLine);
  const eligible = hydrated ? lines.filter((l) => getProduct(l.productId)?.addOnIds.includes(addOn.id)) : [];
  const offeredWith = activeProducts().filter(
    (p) => p.addOnIds.includes(addOn.id) && !eligible.some((l) => l.productId === p.id),
  );
  const inCart = eligible.reduce((n, l) => n + (l.addOns.find((a) => a.addOnId === addOn.id)?.quantity ?? 0), 0);
  const price = addOn.price === 0 ? "Free" : formatDollars(addOn.price);

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-baseline justify-between gap-4 py-3 text-left"
      >
        <span>
          {addOn.name}
          {addOn.serves ? <span className="ml-2 text-[0.85rem] text-muted">{addOn.serves}</span> : null}
          {inCart > 0 ? <span className="ml-2 text-[0.8rem] text-olive">· In your cart</span> : null}
        </span>
        <span className="flex shrink-0 items-baseline gap-3">
          <span className="price text-[1.15rem] text-olive">{price}</span>
          <IconChevronDown size={18} className={clsx("self-center text-olive transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {open ? (
        <div id={`${id}-panel`} className="flex flex-col gap-4 pb-5">
          <p className="text-[0.9rem] text-muted">{addOn.description}</p>

          {eligible.map((line) => {
            const product = getProduct(line.productId)!;
            const chosen = line.addOns.find((a) => a.addOnId === addOn.id);
            const qty = chosen?.quantity ?? 0;
            return (
              <div key={line.lineId} className="rounded-2xl border border-line bg-cream/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[0.92rem]">
                    With your <span className="font-medium">{product.name}</span>
                  </span>
                  <QuantitySelector
                    value={qty}
                    min={0}
                    max={addOn.maxQuantity ?? 10}
                    label="Quantity"
                    itemName={`${addOn.name} with your ${product.name}`}
                    onChange={(q) =>
                      updateLine(line.lineId, {
                        addOns: setAddOnQuantity(line.addOns, addOn.id, q),
                      })
                    }
                  />
                </div>
                {addOn.message && qty > 0 ? (
                  <TextAreaField
                    id={`${id}-${line.lineId}-message`}
                    label={addOn.message.label}
                    hint={`${addOn.message.helper} ${(chosen?.message ?? "").length}/${addOn.message.maxLength}`}
                    maxLength={addOn.message.maxLength}
                    required
                    value={chosen?.message ?? ""}
                    onChange={(e) =>
                      updateLine(line.lineId, {
                        addOns: setAddOnMessage(line.addOns, addOn.id, e.target.value),
                      })
                    }
                    wrapperClassName="mt-3"
                    className="min-h-24"
                  />
                ) : null}
              </div>
            );
          })}

          {offeredWith.length > 0 ? (
            <div>
              <p className="text-[0.85rem] text-muted">
                {eligible.length > 0 ? "Or choose another box:" : "Choose a box to add it to:"}
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {offeredWith.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/order/${p.slug}?addon=${addOn.id}`}
                      className="inline-block rounded-full border border-olive/30 bg-paper px-3.5 py-1.5 text-[0.85rem] text-olive transition-colors hover:border-olive"
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
