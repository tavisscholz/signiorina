import clsx from "clsx";

/** Typographic wordmark. The spelling "Signiorina" is intentional. */
export function Wordmark({
  className,
  tone = "olive",
  descriptor = true,
  size = "md",
}: {
  className?: string;
  tone?: "olive" | "cream";
  descriptor?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const text = { sm: "text-[1.25rem]", md: "text-[1.55rem] md:text-[1.7rem]", lg: "text-[2.6rem] md:text-[3.4rem]" }[size];
  return (
    <span className={clsx("inline-flex flex-col items-center leading-none", tone === "olive" ? "text-olive" : "text-cream", className)}>
      <span className={clsx("font-display uppercase tracking-[0.08em]", text)} style={{ fontVariationSettings: "'opsz' 72" }}>
        Signiorina
      </span>
      {descriptor ? (
        <span className={clsx("mt-1.5 text-[0.52rem] font-medium uppercase tracking-[0.42em]", size === "lg" && "text-[0.7rem]")}>
          Modern Aperitivo
        </span>
      ) : null}
    </span>
  );
}
