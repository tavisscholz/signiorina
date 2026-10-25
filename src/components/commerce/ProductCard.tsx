import clsx from "clsx";
import Link from "next/link";

import { Photo } from "@/components/brand/Photo";
import { PriceOval } from "@/components/brand/SectionHeading";
import { QuickAddButton } from "@/components/commerce/QuickAddButton";
import { Badge } from "@/components/ui/Notice";
import { getDietaryOption } from "@/config/catalog";
import { leadTimeLabel, priceLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

export function DietaryIndicator({ product, className }: { product: Product; className?: string }) {
  if (product.dietaryOptions.length === 0) return null;
  return (
    <p className={clsx("flex flex-wrap items-center gap-1.5 text-[0.75rem] text-muted", className)}>
      <span className="sr-only">Dietary versions available: </span>
      {product.dietaryOptions.map((id) => {
        const option = getDietaryOption(id)!;
        return (
          <abbr
            key={id}
            title={option.label}
            className="rounded-full bg-pistachio-soft px-2 py-0.5 font-medium tracking-wide text-olive-deep no-underline"
          >
            <span aria-hidden="true">{option.short}</span>
            <span className="sr-only">{option.label}</span>
          </abbr>
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
}: {
  product: Product;
  priority?: boolean;
  className?: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
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
          <p aria-hidden="true" className="absolute left-0 top-2 text-[0.75rem] uppercase tracking-[0.2em] text-olive-soft">
            {product.kicker}
          </p>
        ) : null}
        <Heading className="display-sm text-olive">
          <Link href={`/order/${product.slug}`} className="hover:underline hover:decoration-1 hover:underline-offset-4">
            {product.kicker ? <span className="sr-only">{product.kicker} </span> : null}
            {product.shortName ?? product.name}
          </Link>
        </Heading>
        <p className="text-[0.8rem] uppercase tracking-[0.14em] text-olive-soft">
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
        <p className="text-[0.98rem] text-muted">{product.tagline}</p>
        <DietaryIndicator product={product} />
        <div className="mt-auto flex flex-wrap items-center gap-4 pt-3">
          <QuickAddButton productId={product.id} />
          <Link href={`/order/${product.slug}`} className="label-caps text-[0.68rem] text-olive underline decoration-olive/40 underline-offset-[6px] hover:decoration-olive">
            View details<span className="sr-only"> for {product.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
