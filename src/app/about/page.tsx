import type { Metadata } from "next";

import { Photo } from "@/components/brand/Photo";
import { Signature } from "@/components/brand/Signature";
import { CTABand } from "@/components/sections/Sections";
import { ButtonLink } from "@/components/ui/Button";
import { routeLabels, routes } from "@/config/journeys";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Chef Irina",
  description:
    "Chef Irina spent fifteen years in the kitchens of Baltimore's Little Italy. Meet the chef behind Signiorina's Italian-inspired tables in the Smokies.",
  path: "/about",
});

const smallButton = "min-h-9 px-[1.125rem] text-[0.6rem]";

/** About is about Chef Irina, in the owner's words. (Signiorina's own story and standards live in the FAQ.) */
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
          <div className="mt-8 flex max-w-xl flex-col gap-5 text-[1.05rem] leading-relaxed text-espresso/85">
            <p>
              Chef Irina spent fifteen years in the kitchens of Baltimore&rsquo;s Little Italy, where she learned that good
              cooking starts with paying attention. She notices what people need, what a dish is missing, and what makes a
              table feel like home.
            </p>
            <p>
              Her palate is patient and precise, built on years of tasting, adjusting, and tasting again. She trusts simple
              ingredients treated with respect, and she cooks with the person on the other side of the plate in mind. Every
              bite is meant to feel intentional and cared for, so guests leave feeling looked after.
            </p>
          </div>
          <Signature className="ml-2 mt-6 inline-block text-right text-[2rem] md:text-[2.3rem]" />

          <p className="mt-10 text-[1.05rem] text-muted">We&apos;d love to feed your next gathering.</p>
          {/* A quarter smaller than the standard buttons. */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <ButtonLink href={routes.weddingPlanner} className={smallButton}>
              {routeLabels.weddingPlanner}
            </ButtonLink>
            <ButtonLink href={routes.events} variant="secondary" className={smallButton}>
              Explore Packages
            </ButtonLink>
            <ButtonLink href={routes.store} variant="secondary" className={smallButton}>
              {routeLabels.store}
            </ButtonLink>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
