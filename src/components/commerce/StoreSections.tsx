import Link from "next/link";

import { AddOnPicker } from "@/components/commerce/AddOnPicker";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { IconCalendar, IconClock, IconTruck } from "@/components/ui/Icons";
import { addOns } from "@/config/catalog";
import { ALLERGEN_STATEMENT } from "@/config/content";
import { deliveryWindows, scheduling, servedZones } from "@/config/delivery";
import { formatDollars } from "@/lib/money";

/** Delivery fees, windows and lead time — the store's three facts. */
export function StoreFacts({ className = "mt-10" }: { className?: string }) {
  return (
    <ul className={`${className} grid gap-4 border-y border-line py-5 text-[0.9rem] text-muted md:grid-cols-3`}>
      <li className="flex items-start gap-3">
        <IconTruck size={20} className="mt-0.5 shrink-0 text-olive" />
        <span>
          Delivery {servedZones.map((z) => `${formatDollars(z.fee)}`).join(" / ")} by zone · free over{" "}
          {formatDollars(servedZones[0].freeDeliveryAt!)} nearby.{" "}
          <Link href="/delivery" className="text-olive underline underline-offset-4">
            See areas
          </Link>
        </span>
      </li>
      <li className="flex items-start gap-3">
        <IconClock size={20} className="mt-0.5 shrink-0 text-olive" />
        <span>{deliveryWindows.map((w) => `${w.label} ${w.display}`).join(" · ")}</span>
      </li>
      <li className="flex items-start gap-3">
        <IconCalendar size={20} className="mt-0.5 shrink-0 text-olive" />
        <span>
          Order by noon two days ahead for most boxes. {formatDollars(scheduling.minimumOrder)} delivery minimum. No Sunday
          delivery.
        </span>
      </li>
    </ul>
  );
}

/** Add-ons available on boards, and the allergen statement. */
export function StoreExtras() {
  const cartAddOns = addOns.filter((a) => a.scope.includes("cart"));
  return (
    <section className="container-page mt-24 grid gap-12 lg:grid-cols-2">
      <Reveal className="rounded-[1.75rem] border border-line bg-paper p-8">
        <h2 className="display-sm text-olive">Add to any board</h2>
        <p className="mt-2 text-[0.95rem] text-muted">Tap an extra to add it to a box in your cart, or to pick a box for it.</p>
        <AddOnPicker addOns={cartAddOns} />
      </Reveal>
      <Reveal delay={120} className="flex flex-col justify-between gap-8 rounded-[1.75rem] bg-olive p-8 text-cream on-dark">
        <div>
          <h2 className="display-sm">Dietary needs &amp; allergies</h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-cream/80">{ALLERGEN_STATEMENT}</p>
        </div>
        <ButtonLink href="/inquire?type=allergy" variant="outline-light" className="self-start">
          Ask about an allergy
        </ButtonLink>
      </Reveal>
    </section>
  );
}
