"use client";

import { usePathname } from "next/navigation";

import { ButtonLink } from "@/components/ui/Button";
import { navigation } from "@/config/site";

const HIDDEN_PREFIXES = ["/order", "/cart", "/checkout", "/inquire"];

/** Sticky mobile actions on discovery pages: the two primary journeys, always in reach. */
export function MobileActionBar() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden"
    >
      <div className="grid grid-cols-2 gap-2">
        <ButtonLink href={navigation.actions.order.href} variant="secondary" size="md" className="px-3 text-[0.66rem]">
          {navigation.actions.order.label}
        </ButtonLink>
        <ButtonLink href={navigation.actions.plan.href} variant="primary" size="md" className="px-3 text-[0.66rem]">
          {navigation.actions.plan.label}
        </ButtonLink>
      </div>
    </nav>
  );
}
