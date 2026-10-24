"use client";

import clsx from "clsx";
import Link from "next/link";
import { useId, useState } from "react";

import { Photo } from "@/components/brand/Photo";
import { Checkbox, TextAreaField, TextField } from "@/components/ui/Field";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { getAddOn, getDietaryOption } from "@/config/catalog";
import { track } from "@/lib/analytics";
import { setAddOnMessage, setAddOnQuantity, toggleDietary, useCart } from "@/lib/cart-store";
import { formatCents, formatDollars } from "@/lib/money";
import type { PricedLine } from "@/lib/pricing";

export function CartLineItem({ priced, variant = "page" }: { priced: PricedLine; variant?: "page" | "drawer" }) {
  const { line, product } = priced;
  const updateLine = useCart((s) => s.updateLine);
  const removeLine = useCart((s) => s.removeLine);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const [editing, setEditing] = useState(false);
  const editId = useId();
  const compact = variant === "drawer";
  const dietaryLabels = line.dietary.map((d) => getDietaryOption(d)?.label).filter(Boolean);

  const remove = () => {
    removeLine(line.lineId);
    track("remove_from_cart", { product_id: product.id, quantity: line.quantity });
  };

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/order/${product.slug}`}
        onClick={closeDrawer}
        className={clsx("shrink-0", compact ? "w-20" : "w-24 sm:w-28")}
        tabIndex={-1}
        aria-hidden="true"
      >
        <Photo media={product.images[0]} alt="" className="aspect-[4/5] rounded-xl" sizes="112px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className={clsx("font-display leading-tight text-olive", compact ? "text-[1.15rem]" : "text-[1.3rem]")}>
              <Link href={`/order/${product.slug}`} onClick={closeDrawer} className="hover:underline">
                {product.name}
              </Link>
            </h3>
            <p className="text-[0.84rem] text-muted">
              {priced.variant ? `${priced.variant.name} · ` : ""}
              {product.serves}
            </p>
          </div>
          <p className="price shrink-0 text-[1.15rem] text-olive tabular">{formatCents(priced.lineTotal)}</p>
        </div>

        <ul className="flex flex-col gap-0.5 text-[0.85rem] text-muted">
          <li>
            {priced.quantity} × {formatCents(priced.unitPrice)}
            {product.priceUnit === "person" ? " per guest" : ""}
            {priced.volumeApplied ? ` (volume price, ${Math.min(...(product.volumePricing ?? []).map((v) => v.minQuantity))}+)` : ""}
          </li>
          {dietaryLabels.length > 0 ? (
            <li>
              {dietaryLabels.join(", ")}
              {priced.dietaryFee > 0 ? ` · +${formatCents(priced.dietaryFee)}` : ""}
            </li>
          ) : null}
          {priced.addOns.map((a) => (
            <li key={a.addOn.id}>
              + {a.addOn.name}
              {a.quantity > 1 ? ` × ${a.quantity}` : ""} · {a.total === 0 ? "Free" : formatCents(a.total)}
              {a.addOn.message ? (
                <span className={clsx("block", a.message ? "italic" : "text-fig")}>
                  {a.message ? `“${a.message}”` : "Note not written yet"}
                </span>
              ) : null}
            </li>
          ))}
          {line.personalization ? <li>Tag: “{line.personalization}”</li> : null}
        </ul>

        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
          <QuantitySelector
            value={line.quantity}
            min={1}
            max={product.maxQuantity}
            label={product.quantityLabel}
            itemName={product.name}
            onChange={(q) => updateLine(line.lineId, { quantity: q })}
          />
          {compact ? (
            <Link href="/cart" onClick={closeDrawer} className="text-[0.85rem] text-olive underline underline-offset-4">
              Edit
            </Link>
          ) : (
            <button
              type="button"
              className="text-[0.85rem] text-olive underline underline-offset-4"
              aria-expanded={editing}
              aria-controls={editId}
              onClick={() => setEditing((e) => !e)}
            >
              {editing ? "Done editing" : "Edit"}
            </button>
          )}
          <button type="button" onClick={remove} className="text-[0.85rem] text-muted underline underline-offset-4 hover:text-fig">
            Remove<span className="sr-only"> {product.name}</span>
          </button>
        </div>

        {!compact && editing ? (
          <div id={editId} className="mt-3 grid gap-5 rounded-2xl border border-line bg-paper p-4 sm:grid-cols-2">
            {product.variants ? (
              <fieldset>
                <legend className="mb-2 text-[0.9rem] font-medium">Panino</legend>
                <div className="flex flex-col gap-2">
                  {product.variants.map((v) => (
                    <label key={v.id} className="flex items-center gap-2 text-[0.92rem]">
                      <input
                        type="radio"
                        name={`${editId}-variant`}
                        checked={line.variantId === v.id}
                        onChange={() => updateLine(line.lineId, { variantId: v.id })}
                        className="accent-[var(--color-olive)]"
                      />
                      {v.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}
            <fieldset>
              <legend className="mb-2 text-[0.9rem] font-medium">Dietary</legend>
              <div className="flex flex-col gap-2">
                {product.dietaryOptions.map((d) => {
                  const option = getDietaryOption(d)!;
                  return (
                    <Checkbox
                      key={d}
                      id={`${editId}-${d}`}
                      label={`${option.label}${option.hasFee ? ` (+${formatDollars(product.glutenConsciousFee)}${product.priceUnit === "person" ? "/guest" : " each"})` : ""}`}
                      checked={line.dietary.includes(d)}
                      onChange={() => updateLine(line.lineId, { dietary: toggleDietary(line.dietary, d) })}
                    />
                  );
                })}
              </div>
            </fieldset>
            {product.addOnIds.length > 0 ? (
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-[0.9rem] font-medium">Add-ons</legend>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {product.addOnIds.map((id) => {
                    const addOn = getAddOn(id)!;
                    const chosen = line.addOns.find((a) => a.addOnId === id);
                    const qty = chosen?.quantity ?? 0;
                    const writing = addOn.message && qty > 0;
                    return (
                      <li key={id} className={clsx(writing && "sm:col-span-2")}>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[0.9rem]">
                            {addOn.name} <span className="text-muted">· {addOn.price === 0 ? "Free" : formatDollars(addOn.price)}</span>
                          </span>
                          <QuantitySelector
                            value={qty}
                            min={0}
                            max={addOn.maxQuantity ?? 10}
                            label="Quantity"
                            itemName={addOn.name}
                            onChange={(q) => updateLine(line.lineId, { addOns: setAddOnQuantity(line.addOns, id, q) })}
                          />
                        </div>
                        {writing && addOn.message ? (
                          <TextAreaField
                            id={`${editId}-${id}-message`}
                            label={addOn.message.label}
                            hint={`${addOn.message.helper} ${(chosen?.message ?? "").length}/${addOn.message.maxLength}`}
                            maxLength={addOn.message.maxLength}
                            required
                            value={chosen?.message ?? ""}
                            onChange={(e) => updateLine(line.lineId, { addOns: setAddOnMessage(line.addOns, id, e.target.value) })}
                            wrapperClassName="mt-3"
                            className="min-h-24"
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ) : null}
            {product.personalization ? (
              <TextField
                id={`${editId}-tag`}
                label={product.personalization.label}
                hint={product.personalization.helper}
                maxLength={product.personalization.maxLength}
                value={line.personalization ?? ""}
                onChange={(e) => updateLine(line.lineId, { personalization: e.target.value })}
                wrapperClassName="sm:col-span-2"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </li>
  );
}
