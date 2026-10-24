import { OliveSprig } from "@/components/brand/OliveSprig";
import { ButtonLink } from "@/components/ui/Button";
import { routeLabels, routes } from "@/config/journeys";

export default function NotFound() {
  return (
    <section className="container-narrow flex min-h-[65vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <OliveSprig className="w-24 text-olive/60" />
      <p className="eyebrow text-olive-soft">Page not found</p>
      <h1 className="display-lg text-olive">This one wandered off the table.</h1>
      <p className="lede max-w-md text-muted">The page you&apos;re after has moved or never existed. Here are better places to be.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={routes.store}>{routeLabels.store}</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Back home
        </ButtonLink>
      </div>
    </section>
  );
}
