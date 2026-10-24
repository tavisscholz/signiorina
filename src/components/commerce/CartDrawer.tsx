"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CartLineItem } from "@/components/commerce/CartLineItem";
import { CartIssues, EmptyCart, MinimumProgress } from "@/components/commerce/CartParts";
import { useCartPricing } from "@/components/commerce/useCartPricing";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck, IconClose } from "@/components/ui/Icons";
import { getProduct } from "@/config/catalog";
import { useCart } from "@/lib/cart-store";
import { formatCents } from "@/lib/money";

/** Slide-in cart. Opens on add-to-cart with a confirmation line, closes on Esc or overlay click. */
export function CartDrawer() {
  const open = useCart((s) => s.drawerOpen);
  const close = useCart((s) => s.closeDrawer);
  const justAdded = useCart((s) => s.justAdded);
  const lines = useCart((s) => s.lines);
  const { pricing, hydrated } = useCartPricing();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(open);
  const lastPath = useRef(pathname);

  if (open && !mounted) setMounted(true);

  // Close when the route changes (e.g. after tapping "Schedule delivery").
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (useCart.getState().drawerOpen) close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setMounted(false), 450);
      return () => clearTimeout(t);
    }
    const opener = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab" && panelRef.current) {
        const els = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, select, textarea"),
        );
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open, close]);

  if (!mounted) return null;

  const addedLine = justAdded ? lines.find((l) => l.lineId === justAdded) : undefined;
  const addedProduct = addedLine ? getProduct(addedLine.productId) : undefined;

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!open}>
      <div
        className={clsx(
          "absolute inset-0 bg-espresso/40 backdrop-blur-[2px] transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={clsx(
          "absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col bg-cream shadow-[var(--shadow-lift)] transition-transform duration-500 ease-[var(--ease-drawer)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="cart-drawer-title" className="font-display text-[1.7rem] text-olive">
            Your table
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="grid size-11 place-items-center rounded-full text-olive hover:bg-olive/8"
            aria-label="Close cart"
          >
            <IconClose size={22} />
          </button>
        </div>

        {addedProduct ? (
          <p role="status" className="animate-rise flex items-center gap-3 bg-pistachio-soft px-6 py-3 text-[0.92rem] text-olive-deep">
            <span className="grid size-6 place-items-center rounded-full bg-olive text-cream">
              <IconCheck size={14} />
            </span>
            {addedProduct.name} added to your table.
          </p>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6">
          {!hydrated ? null : pricing.lines.length === 0 ? (
            <EmptyCart onNavigate={close} />
          ) : (
            <>
              <ul className="divide-y divide-line">
                {pricing.lines.map((p) => (
                  <CartLineItem key={p.line.lineId} priced={p} variant="drawer" />
                ))}
              </ul>
              <CartIssues pricing={pricing} className="mb-4" />
            </>
          )}
        </div>

        {hydrated && pricing.lines.length > 0 ? (
          <div className="border-t border-line bg-paper px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5">
            <MinimumProgress pricing={pricing} />
            <div className="mt-3 flex items-baseline justify-between">
              <span className="label-caps text-olive">Subtotal</span>
              <span className="price text-[1.6rem] text-olive tabular">{formatCents(pricing.merchandiseSubtotal)}</span>
            </div>
            <p className="mt-1 text-[0.84rem] text-muted">
              Delivery is set by your area and shown before payment. Tax calculated at checkout.
            </p>
            <div className="mt-4 grid gap-2">
              <ButtonLink
                href="/checkout/delivery"
                size="lg"
                aria-disabled={!pricing.canCheckout}
                className={clsx(!pricing.canCheckout && "pointer-events-none opacity-45")}
                tabIndex={pricing.canCheckout ? undefined : -1}
              >
                Schedule delivery
              </ButtonLink>
              <ButtonLink href="/cart" variant="secondary" size="md">
                View cart
              </ButtonLink>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
