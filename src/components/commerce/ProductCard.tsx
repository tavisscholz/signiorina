import clsx from "clsx";
import Link from "next/link";

import { Photo } from "@/components/brand/Photo";
import { PriceOval } from "@/components/brand/SectionHeading";
import { QuickAddButton } from "@/components/commerce/QuickAddButton";
import { Badge } from "@/components/ui/Notice";
import { getDietaryOption } from "@/config/catalog";
import { leadTimeLabel, priceLabel } from "@/lib/format";
import { formatDollars } from "@/lib/money";
import type { Product } from "@/lib/types";

/** What each chip's hover explainer says after the option's name. */
function dietaryNote(product: Product, id: string): string {
  if (id === "gluten-conscious") {
    return `+${formatDollars(product.glutenConsciousFee)}${product.priceUnit === "person" ? "/guest" : ""}`;
  }
  return "no charge";
}

export function DietaryIndicator({ product, className, dark = false }: { product: Product; className?: string; dark?: boolean }) {
  if (product.dietaryOptions.length === 0) return null;
  return (
    <p className={clsx("flex flex-wrap items-center gap-1.5 text-[0.75rem]", dark ? "text-cream/80" : "text-muted", className)}>
      <span className="sr-only">Dietary versions available: </span>
      {product.dietaryOptions.map((id) => {
        const option = getDietaryOption(id)!;
        return (
          // Hover explainer: screen readers get the full name from the sr-only text instead,
          // and Esc hides it (see TipDismiss).
          <span key={id} className="group/tip relative inline-flex">
            <span className="cursor-help rounded-full bg-pistachio-soft px-2 py-0.5 font-medium tracking-wide text-olive-deep">
              <span aria-hidden="true">{option.short}</span>
              <span className="sr-only">{option.label}</span>
            </span>
            {/* pb-2 bridges the gap so the pointer can move onto the explainer without losing it. */}
            <span
              aria-hidden="true"
              className="tip invisible absolute bottom-full left-0 z-20 translate-y-1 pb-2 opacity-0 transition-[opacity,transform,visibility] duration-200 ease-[var(--ease-soft)] group-hover/tip:visible group-hover/tip:translate-y-0 group-hover/tip:opacity-100"
            >
              <span
                className={clsx(
                  "relative block whitespace-nowrap rounded-full px-3 py-1 text-[0.72rem] font-medium tracking-wide shadow-[var(--shadow-card)]",
                  dark ? "bg-cream text-espresso" : "bg-espresso text-cream",
                )}
              >
                {option.label}
                <span className={dark ? "text-espresso/70" : "text-cream/70"}> · {dietaryNote(product, id)}</span>
                <span className={clsx("absolute left-3 top-full border-4 border-transparent", dark ? "border-t-cream" : "border-t-espresso")} />
              </span>
            </span>
          </span>
        );
      })}
      <span aria-hidden="true" className="ml-0.5">options</span>
    </p>
  );
}

export function ProductCard({
  product,
  priority = false,
  className,
  headingLevel = "h3",
  tone = "light",
}: {
  product: Product;
  priority?: boolean;
  className?: string;
  headingLevel?: "h2" | "h3";
  /** "dark" on olive sections: cream type, prosecco details, light button. */
  tone?: "light" | "dark";
}) {
  const Heading = headingLevel;
  const dark = tone === "dark";
  const minNote = product.minimumQuantity ? `${product.minimumQuantity} ${product.quantityLabel.toLowerCase()} min` : undefined;
  return (
    <article className={clsx("group relative flex flex-col", className)}>
      <div className="relative">
        <Link href={`/order/${product.slug}`} aria-label={`${product.name} — view details`} tabIndex={-1}>
          <Photo
            media={product.images[0]}
            className="aspect-[4/5] rounded-[1.25rem]"
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 100vw"
            priority={priority}
            zoom
          />
        </Link>
        {product.badge ? (
          <Badge tone={product.signature ? "olive" : "cream"} className="absolute left-4 top-4">
            {product.badge}
          </Badge>
        ) : null}
        <PriceOval className="absolute -bottom-5 right-5 shadow-[var(--shadow-card)]">{priceLabel(product)}</PriceOval>
      </div>
      {/* The kicker sits in the space under the photo, so titles line up across a row whether or not a card has one. */}
      <div className="relative flex flex-1 flex-col gap-2 pt-8">
        {product.kicker ? (
          <p aria-hidden="true" className={clsx("absolute left-0 top-2 text-[0.75rem] uppercase tracking-[0.2em]", dark ? "text-prosecco" : "text-olive-soft")}>
            {product.kicker}
          </p>
        ) : null}
        <Heading className={clsx("display-sm", dark ? "text-cream" : "text-olive")}>
          <Link href={`/order/${product.slug}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">
            {product.kicker ? <span className="sr-only">{product.kicker} </span> : null}
            {product.shortName ?? product.name}
          </Link>
        </Heading>
        <p className={clsx("text-[0.8rem] uppercase tracking-[0.14em]", dark ? "text-prosecco" : "text-olive-soft")}>
          {product.serves.split(" · ")[0]}
          <span aria-hidden="true"> · </span>
          {leadTimeLabel(product.leadTimeDays)}
          {minNote ? (
            <>
              <span aria-hidden="true"> · </span>
              {minNote}
            </>
          ) : null}
        </p>
        <p className={clsx("text-[0.98rem]", dark ? "text-cream/80" : "text-muted")}>{product.tagline}</p>
        <DietaryIndicator product={product} dark={dark} />
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
          <QuickAddButton productId={product.id} variant={dark ? "light" : "primary"} />
          <Link
            href={`/order/${product.slug}`}
            className={clsx(
              "label-caps text-[0.68rem] underline underline-offset-[6px]",
              dark ? "text-cream decoration-cream/40 hover:decoration-cream" : "text-olive decoration-olive/40 hover:decoration-olive",
            )}
          >
            View details<span className="sr-only"> for {product.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
