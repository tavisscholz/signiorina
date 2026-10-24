import clsx from "clsx";

import { Photo } from "@/components/brand/Photo";
import { TrackedLink } from "@/components/journeys/Tracking";
import { IconArrow, IconChevron } from "@/components/ui/Icons";
import { journeys } from "@/config/journeys";

/**
 * The three ways in. Phones get compact rows so all three fit under a short hero without
 * swiping; wider screens get three image cards. Weddings — the flagship — is the dark card.
 */
export function JourneyCards({
  location,
  tone = "light",
  priority = false,
  headingLevel = "h2",
  className,
}: {
  /** Where the cards sit, for analytics. */
  location: string;
  tone?: "light" | "dark";
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  return (
    <ul className={clsx("grid gap-3 md:grid-cols-3 md:gap-5", className)}>
      {journeys.map((j) => {
        const flagship = j.id === "weddings";
        // On cream the flagship is the dark card; on the olive band it is the light one.
        const style =
          tone === "light"
            ? flagship
              ? "on-dark border-olive bg-olive text-cream shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-lift)] md:-translate-y-1"
              : "border-line bg-paper text-olive hover:border-olive/40 hover:shadow-[var(--shadow-card)]"
            : flagship
              ? "border-prosecco/60 bg-cream text-olive hover:shadow-[var(--shadow-lift)]"
              : "border-cream/20 bg-olive-deep/60 text-cream hover:border-cream/50";
        const quiet = (tone === "light") === flagship ? "text-cream/85" : "text-muted";
        return (
          <li key={j.id}>
            <TrackedLink
              href={j.href}
              event="journey_selected"
              props={{ journey: j.id, location }}
              className={clsx(
                "group grid h-full grid-cols-[4.75rem_1fr_auto] items-center gap-4 rounded-[1.25rem] border p-2 pr-4 transition-[border-color,box-shadow,transform] duration-300 md:flex md:flex-col md:items-stretch md:gap-0 md:overflow-hidden md:rounded-[1.75rem] md:p-0",
                style,
              )}
            >
              <Photo
                media={j.media}
                className="aspect-square w-full rounded-[0.9rem] md:aspect-[2/1] md:rounded-none"
                sizes="(min-width: 768px) 30vw, 84px"
                priority={priority}
                alt=""
                zoom
              />
              <span className="flex min-w-0 flex-col gap-0.5 md:gap-1.5 md:px-6 md:pb-6 md:pt-5">
                <Heading className="font-display text-[1.45rem] leading-tight md:text-[clamp(1.6rem,2.2vw,2.1rem)]">{j.name}</Heading>
                <span className={clsx("text-[0.88rem] leading-snug md:text-[0.98rem]", quiet)}>
                  {j.description}
                </span>
                <span className="label-caps mt-2 hidden items-center gap-2 text-[0.7rem] md:inline-flex">
                  {j.cta}
                  <IconArrow size={16} className="transition-transform duration-500 group-hover:translate-x-1" />
                </span>
                <span className="sr-only md:hidden"> — {j.cta}</span>
              </span>
              <IconChevron size={20} aria-hidden="true" className="shrink-0 md:hidden" />
            </TrackedLink>
          </li>
        );
      })}
    </ul>
  );
}
