import clsx from "clsx";

import { Badge } from "@/components/ui/Notice";
import type { FaqItem } from "@/config/content";
import { site } from "@/config/site";

/** Native <details> accordion: keyboard and screen-reader friendly with no script. */
export function FaqList({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={clsx("divide-y divide-line border-y border-line", className)}>
      {items.map((item) => (
        <details key={item.id} id={item.id} className="group scroll-mt-32">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
            <span className="font-display text-[1.25rem] leading-snug text-olive md:text-[1.4rem]">{item.question}</span>
            <span
              aria-hidden="true"
              className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-olive/30 text-olive transition-transform duration-300 group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="pb-6 pr-10 text-[1rem] leading-relaxed text-muted">
            {item.clientInput && site.showPlaceholders ? (
              <Badge tone="fig" className="mb-3">
                Awaiting owner confirmation
              </Badge>
            ) : null}
            {item.points ? (
              <ul className="mb-3 list-disc space-y-1.5 pl-5 marker:text-olive/50">
                {item.points.map((p) => (
                  <li key={p.lead}>
                    <span className="font-medium text-espresso">{p.lead}:</span> {p.text}
                  </li>
                ))}
              </ul>
            ) : null}
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
