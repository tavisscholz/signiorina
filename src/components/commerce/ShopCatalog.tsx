"use client";

import clsx from "clsx";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ProductCard } from "@/components/commerce/ProductCard";
import type { Category, Product } from "@/lib/types";

/** Category filter. Reads `?category=` so filtered views are shareable. */
export function ShopCatalog({ products, categories }: { products: Product[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const active = params.get("category") ?? "all";
  const visible = active === "all" ? products : products.filter((p) => p.categories.includes(active as Category["id"]));
  const activeCategory = categories.find((c) => c.id === active);

  const select = (id: string) => {
    startTransition(() => {
      router.replace(id === "all" ? pathname : `${pathname}?category=${id}`, { scroll: false });
    });
  };

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <div role="group" aria-label="Filter by occasion" className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
          {[{ id: "all", label: "All" }, ...categories].map((c) => {
            const selected = active === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={selected}
                onClick={() => select(c.id)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-[0.85rem] transition-colors",
                  selected ? "border-olive bg-olive text-cream" : "border-line-strong text-olive hover:border-olive",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-4 min-h-6 text-[0.95rem] text-muted" aria-live="polite">
        {activeCategory ? activeCategory.description : `${products.length} things worth gathering around.`}
      </p>
      <div className="mt-10 grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 3} headingLevel="h2" />
        ))}
      </div>
    </div>
  );
}

export function ShopCatalogFallback({ products }: { products: Product[] }) {
  return (
    <div className="mt-[4.5rem] grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 3} headingLevel="h2" />
      ))}
    </div>
  );
}
