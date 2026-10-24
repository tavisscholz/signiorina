"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox, TextAreaField, TextField } from "@/components/ui/Field";
import { IconCheck, IconClock, IconInfo } from "@/components/ui/Icons";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { getAddOn, getDietaryOption, getProduct } from "@/config/catalog";
import { deliveryWindows, scheduling } from "@/config/delivery";
import { track } from "@/lib/analytics";
import { setAddOnMessage, setAddOnQuantity, toggleDietary, useCart } from "@/lib/cart-store";
import { leadTimeSentence, quickAddQuantity } from "@/lib/format";
import { formatCents, formatDollars, toCents } from "@/lib/money";
import { priceLines } from "@/lib/pricing";
import type { CartAddOn, DietaryId } from "@/lib/types";

/**
 * Product options → cart. Price updates live with quantity, dietary versions and add-ons.
 * On mobile, a sticky bar keeps Add to Cart in reach.
 */
export function ProductPurchasePanel({ productId }: { productId: string }) {
  const product = getProduct(productId)!;
  const id = useId();
  const addLine = useCart((s) => s.addLine);
  const openDrawer = useCart((s) => s.openDrawer);
  const [quantity, setQuantity] = useState(quickAddQuantity(product));
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const [dietary, setDietary] = useState<DietaryId[]>([]);
  const [lineAddOns, setLineAddOns] = useState<CartAddOn[]>([]);
  const [personalization, setPersonalization] = useState("");
  const [error, setError] = useState<string>();
  const [messageError, setMessageError] = useState<{ addOnId: string; text: string }>();
  const [added, setAdded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    track("view_product", { product_id: product.id, price: product.price });
  }, [product.id, product.price]);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setShowSticky(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const priced = useMemo(
    () =>
      priceLines([
        { lineId: "preview", productId: product.id, variantId, quantity, dietary, addOns: lineAddOns, personalization },
      ]).priced[0],
    [product.id, variantId, quantity, dietary, lineAddOns, personalization],
  );

  const minimum = product.minimumQuantity ?? 1;
  const volume = product.volumePricing?.[0];
  const allowedWindowLabels = product.allowedWindows?.map((w) => deliveryWindows.find((d) => d.id === w)!);

  const add = () => {
    const unwritten = lineAddOns.find((a) => getAddOn(a.addOnId)?.message && !a.message?.trim());
    if (unwritten) {
      setMessageError({ addOnId: unwritten.addOnId, text: "Write your note, or remove it." });
      document.getElementById(`${id}-${unwritten.addOnId}-message`)?.focus();
      return;
    }
    setMessageError(undefined);
    if (product.personalization?.required && !personalization.trim()) {
      setError(`Add the ${product.personalization.label.toLowerCase()} so we can print it.`);
      document.getElementById(`${id}-personalization`)?.focus();
      return;
    }
    setError(undefined);
    addLine({
      productId: product.id,
      variantId,
      quantity,
      dietary,
      addOns: lineAddOns.map((a) => (a.message === undefined ? a : { ...a, message: a.message.trim() })),
      personalization: personalization.trim() || undefined,
    });
    track("add_to_cart", { product_id: product.id, quantity, value: priced.lineTotal / 100, source: "pdp" });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    openDrawer();
  };

  const addLabel = added ? "Added to your table" : `Add to cart · ${formatCents(priced.lineTotal)}`;

  return (
    <div className="flex flex-col gap-8">
      {product.variants ? (
        <fieldset>
          <legend className="label-caps mb-3 text-olive">Choose the panino</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.variants.map((v) => {
              const selected = v.id === variantId;
              return (
                <label
                  key={v.id}
                  className={clsx(
                    "flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-fig",
                    selected ? "border-olive bg-olive/[0.06]" : "border-line-strong hover:border-olive/60",
                  )}
                >
                  <input type="radio" name={`${id}-variant`} value={v.id} checked={selected} onChange={() => setVariantId(v.id)} className="sr-only" />
                  <span className="flex items-center justify-between font-medium">
                    {v.name}
                    {selected ? <IconCheck size={18} className="text-olive" /> : null}
                  </span>
                  {v.description ? <span className="text-[0.86rem] text-muted">{v.description}</span> : null}
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-[0.85rem] text-muted">Mixing? Add each panino as its own line — the minimum counts them together.</p>
        </fieldset>
      ) : null}

      {product.dietaryOptions.length > 0 ? (
        <fieldset>
          <legend className="label-caps mb-3 text-olive">Dietary versions</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.dietaryOptions.map((d) => {
              const option = getDietaryOption(d)!;
              const fee = option.hasFee
                ? ` · +${formatDollars(product.glutenConsciousFee)}${product.priceUnit === "person" ? "/guest" : " each"}`
                : " · no charge";
              return (
                <Checkbox
                  key={d}
                  id={`${id}-${d}`}
                  label={`${option.label}${fee}`}
                  description={option.description}
                  checked={dietary.includes(d)}
                  onChange={() => setDietary((list) => toggleDietary(list, d))}
                />
              );
            })}
          </div>
          <p className="mt-3 flex gap-2 text-[0.85rem] text-muted">
            <IconInfo size={16} className="mt-0.5 shrink-0 text-fig" />
            <span>
              Severe allergy in your group?{" "}
              <Link href="/inquire?type=allergy" className="text-olive underline underline-offset-4">
                Contact us before you order.
              </Link>
            </span>
          </p>
        </fieldset>
      ) : null}

      {product.addOnIds.length > 0 ? (
        <fieldset>
          <legend className="label-caps mb-3 text-olive">Add to this order</legend>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-paper">
            {product.addOnIds.map((addOnId) => {
              const addOn = getAddOn(addOnId)!;
              const chosen = lineAddOns.find((a) => a.addOnId === addOnId);
              const qty = chosen?.quantity ?? 0;
              const message = chosen?.message ?? "";
              return (
                <li key={addOnId} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {addOn.name} <span className="price ml-1 text-olive">{addOn.price === 0 ? "Free" : formatDollars(addOn.price)}</span>
                      </p>
                      <p className="text-[0.84rem] text-muted">
                        {addOn.serves ? `${addOn.serves} · ` : ""}
                        {addOn.description}
                      </p>
                    </div>
                    <QuantitySelector
                      value={qty}
                      min={0}
                      max={addOn.maxQuantity ?? 10}
                      label="Quantity"
                      itemName={addOn.name}
                      onChange={(q) => setLineAddOns((list) => setAddOnQuantity(list, addOnId, q))}
                    />
                  </div>
                  {addOn.message && qty > 0 ? (
                    <TextAreaField
                      id={`${id}-${addOnId}-message`}
                      label={addOn.message.label}
                      hint={`${addOn.message.helper} ${message.length}/${addOn.message.maxLength}`}
                      maxLength={addOn.message.maxLength}
                      required
                      value={message}
                      error={messageError?.addOnId === addOnId && !message.trim() ? messageError.text : undefined}
                      onChange={(e) => setLineAddOns((list) => setAddOnMessage(list, addOnId, e.target.value))}
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
          id={`${id}-personalization`}
          label={product.personalization.label}
          hint={product.personalization.helper}
          maxLength={product.personalization.maxLength}
          required={product.personalization.required}
          value={personalization}
          error={error}
          onChange={(e) => setPersonalization(e.target.value)}
        />
      ) : null}

      <div ref={buttonRef} className="flex flex-col gap-4 rounded-[1.5rem] border border-olive/20 bg-paper p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <QuantitySelector
            value={quantity}
            min={minimum}
            max={product.maxQuantity}
            label={product.quantityLabel}
            showLabel
            size="lg"
            itemName={product.name}
            onChange={setQuantity}
          />
          <div className="text-right">
            <p className="price text-[2rem] leading-none text-olive tabular">{formatCents(priced.lineTotal)}</p>
            <p className="mt-1 text-[0.82rem] text-muted">
              {quantity} × {formatCents(priced.unitPrice)}
              {product.priceUnit === "person" ? " per guest" : ""}
              {priced.dietaryFee ? ` + ${formatCents(priced.dietaryFee)} dietary` : ""}
              {priced.addOnsTotal ? ` + ${formatCents(priced.addOnsTotal)} add-ons` : ""}
            </p>
          </div>
        </div>
        {volume ? (
          <p className="text-[0.88rem] text-olive">
            {priced.volumeApplied
              ? `Volume price applied: ${formatDollars(volume.unitPrice)} each.`
              : `Order ${volume.minQuantity}+ and they're ${formatDollars(volume.unitPrice)} each.`}
          </p>
        ) : null}
        <Button size="lg" onClick={add} className="w-full" aria-live="polite">
          {added ? <IconCheck size={18} /> : null}
          {addLabel}
        </Button>
        <ul className="flex flex-col gap-2 text-[0.88rem] text-muted">
          <li className="flex gap-2">
            <IconClock size={18} className="mt-0.5 shrink-0 text-olive" />
            <span>
              {leadTimeSentence(product.leadTimeDays)}.
              {product.allowRush && scheduling.rush.enabled
                ? ` Inside that, a ${formatDollars(scheduling.rush.fee)} rush may be possible if there's room.`
                : ""}
            </span>
          </li>
          {allowedWindowLabels ? (
            <li className="flex gap-2">
              <IconClock size={18} className="mt-0.5 shrink-0 text-olive" />
              <span>
                Delivered in the {allowedWindowLabels.map((w) => `${w.label.toLowerCase()} window (${w.display})`).join(" or ")}.
              </span>
            </li>
          ) : null}
          {product.minimumQuantity ? (
            <li className="flex gap-2">
              <IconInfo size={18} className="mt-0.5 shrink-0 text-olive" />
              <span>
                Minimum {product.minimumQuantity} {product.quantityLabel.toLowerCase()} ({formatCents(toCents(product.price) * product.minimumQuantity)}).
              </span>
            </li>
          ) : null}
        </ul>
      </div>

      {/* Mobile sticky add-to-cart */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-300 md:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[1.05rem] text-olive">{product.name}</p>
            <p className="text-[0.8rem] text-muted">
              {quantity} {product.quantityLabel.toLowerCase()}
            </p>
          </div>
          <Button onClick={add} tabIndex={showSticky ? 0 : -1}>
            {added ? "Added" : `Add · ${formatCents(priced.lineTotal)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
