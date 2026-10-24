import clsx from "clsx";

/** A single hand-drawn olive sprig. Decorative only — use sparingly. */
export function OliveSprig({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 48"
      className={clsx("h-auto", flip && "-scale-x-100", className)}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 40C30 34 58 24 116 8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      {[
        { x: 22, y: 36, r: -28, s: 1 },
        { x: 34, y: 32, r: 18, s: -1 },
        { x: 48, y: 28, r: -32, s: 1 },
        { x: 60, y: 23, r: 14, s: -1 },
        { x: 74, y: 19, r: -34, s: 1 },
        { x: 86, y: 15, r: 10, s: -1 },
        { x: 100, y: 11, r: -30, s: 1 },
      ].map((leaf, i) => (
        <path
          key={i}
          d="M0 0C5 -6 14 -7 20 -4C14 0 6 2 0 0Z"
          fill="currentColor"
          opacity={0.85}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(1 ${leaf.s})`}
        />
      ))}
    </svg>
  );
}
