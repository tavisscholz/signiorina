import type { Metadata } from "next";

import { Photo } from "@/components/brand/Photo";
import { CTABand } from "@/components/sections/Sections";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Notice";
import { routeLabels, routes } from "@/config/journeys";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Chef Irina",
  description:
    "Meet Chef Irina, the chef behind Signiorina — modern Italian-inspired hospitality for Smoky Mountain weddings, gatherings and everyday tables.",
  path: "/about",
});

/**
 * About is about Chef Irina. The story is Irina's to tell: until it's supplied, the live page
 * introduces Irina and nothing more, and the story block shows only as a labelled placeholder
 * in development. (Signiorina's own story and standards now live in the FAQ.)
 */
export default function AboutPage() {
  return (
    <>
      <section className="container-page grid items-center gap-10 pb-16 pt-12 md:pt-20 lg:grid-cols-12 lg:gap-16">
        <div className="hero-enter lg:col-span-5">
          <Photo
            media="irina"
            shape="oval"
            priority
            className="mx-auto aspect-[4/5] w-full max-w-[26rem]"
            sizes="(min-width: 1024px) 34vw, 80vw"
            position="50% 30%"
          />
        </div>
        <div className="hero-enter lg:col-span-7" style={{ ["--hero-delay" as string]: "120ms" }}>
          <p className="eyebrow flex items-center gap-3 text-olive-soft">
            <span aria-hidden="true" className="h-px w-8 bg-olive/40" />
            About
          </p>
          <h1 className="display-xl mt-5 text-olive">
            Meet <span className="accent">Chef Irina.</span>
          </h1>
          <p className="lede mt-6 max-w-xl text-muted">
            The chef behind Signiorina — modern Italian-inspired hospitality for Smoky Mountain weddings, gatherings and
            everyday tables.
          </p>

          {site.showPlaceholders ? (
            <div className="relative mt-10 rounded-[1.5rem] border border-dashed border-olive/30 bg-paper p-7">
              <Badge tone="fig" className="absolute -top-3 left-6">
                Placeholder — Irina&apos;s story to come
              </Badge>
              <p className="text-muted">
                Reserved for Irina&apos;s story, in Irina&apos;s own words: how the cooking started, the hospitality background,
                why Italian hosting, why the Smokies, any training or credentials worth sharing, and a favorite thing to put on
                the table. Hidden on the live site until supplied.
              </p>
            </div>
          ) : null}

          <p className="mt-10 text-[1.05rem] text-muted">We&apos;d love to feed your next gathering.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={routes.weddingPlanner}>{routeLabels.weddingPlanner}</ButtonLink>
            <ButtonLink href={routes.events} variant="secondary">
              Explore Packages
            </ButtonLink>
            <ButtonLink href={routes.store} variant="secondary">
              {routeLabels.store}
            </ButtonLink>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
