"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Wordmark } from "@/components/brand/Wordmark";
import { useCartHydrated } from "@/components/providers/StoreHydrator";
import { ButtonLink } from "@/components/ui/Button";
import { IconBag, IconClose, IconMenu } from "@/components/ui/Icons";
import { navigation } from "@/config/site";
import { useCart } from "@/lib/cart-store";

function CartButton({ className }: { className?: string }) {
  const hydrated = useCartHydrated();
  const lines = useCart((s) => s.lines);
  const lastAdded = useCart((s) => s.lastAdded);
  const openCart = useCart((s) => s.openCart);
  const count = hydrated ? lines.length : 0;
  return (
    <button
      type="button"
      onClick={openCart}
      className={clsx(
        "relative grid size-11 place-items-center rounded-full text-olive transition-colors hover:bg-olive/8",
        className,
      )}
      aria-label={count > 0 ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"}
    >
      <IconBag size={22} />
      {count > 0 ? (
        <span
          key={lastAdded?.at}
          className="animate-pop absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-fig px-1 text-[0.68rem] font-medium leading-5 text-cream"
          aria-hidden="true"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

/** Reads the current path; render inside <Suspense> (see layout) with SiteHeaderView as the fallback. */
export function SiteHeader() {
  const pathname = usePathname();
  return <SiteHeaderView pathname={pathname} />;
}

/** The header itself. `pathname` is null in the prerendered fallback for routes with unknown params. */
export function SiteHeaderView({ pathname: currentPath }: { pathname: string | null }) {
  const pathname = currentPath ?? "";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === "Tab") {
        const els = focusables();
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
    };
  }, [menuOpen]);

  const isCheckout = pathname.startsWith("/checkout");

  return (
    <header className="sticky top-0 z-40">
      {!isCheckout ? (
        <div className="bg-olive text-cream">
          <p className="container-page flex h-9 items-center justify-center gap-3 text-center text-[0.7rem] font-medium uppercase tracking-[0.2em]">
            <span className="hidden sm:inline">Published prices</span>
            <span aria-hidden="true" className="hidden text-prosecco sm:inline">·</span>
            <span>Delivering across the Smokies + Knoxville</span>
            <span aria-hidden="true" className="hidden text-prosecco md:inline">·</span>
            <span className="hidden md:inline">Order by noon, two days ahead</span>
          </p>
        </div>
      ) : null}
      <div
        className={clsx(
          "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || menuOpen ? "border-line bg-cream/92 backdrop-blur-md" : "border-transparent bg-cream",
        )}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
          <Link href="/" className="shrink-0 rounded-sm" aria-label="Signiorina — home">
            <Wordmark />
          </Link>

          {!isCheckout ? (
            <nav aria-label="Primary" className="hidden xl:block">
              <ul className="flex items-center gap-7">
                {navigation.primary.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={clsx(
                          "label-caps relative py-2 text-[0.72rem] text-espresso transition-colors hover:text-olive",
                          "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-olive after:transition-transform after:duration-500",
                          active ? "text-olive after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            {!isCheckout ? (
              <>
                <ButtonLink href={navigation.actions.order.href} variant="secondary" size="sm" className="hidden md:inline-flex">
                  {navigation.actions.order.label}
                </ButtonLink>
                <ButtonLink href={navigation.actions.plan.href} variant="primary" size="sm" className="hidden lg:inline-flex">
                  {navigation.actions.plan.label}
                </ButtonLink>
              </>
            ) : (
              <p className="hidden items-center gap-2 text-[0.85rem] text-muted sm:flex">Secure guest checkout</p>
            )}
            <CartButton />
            {!isCheckout ? (
              <button
                ref={toggleRef}
                type="button"
                className="grid size-11 place-items-center rounded-full text-olive hover:bg-olive/8 xl:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <IconClose size={24} /> : <IconMenu size={24} />}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="animate-rise fixed inset-x-0 bottom-0 top-[6.75rem] z-40 overflow-y-auto bg-cream xl:hidden"
        >
          <nav aria-label="Mobile" className="container-page flex min-h-full flex-col justify-between gap-10 pb-10 pt-6">
            <ul className="flex flex-col divide-y divide-line border-y border-line">
              {navigation.primary.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex items-center justify-between py-4 font-display text-[1.9rem] text-olive"
                  >
                    {item.label}
                    <span aria-hidden="true" className="text-[1rem] text-olive/50">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3">
              <ButtonLink href={navigation.actions.order.href} variant="secondary" size="lg">
                {navigation.actions.order.label}
              </ButtonLink>
              <ButtonLink href={navigation.actions.plan.href} variant="primary" size="lg">
                {navigation.actions.plan.label}
              </ButtonLink>
              <p className="mt-2 text-center text-[0.85rem] text-muted">
                Weddings and events are planned together. Boxes and boards order online.
              </p>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
