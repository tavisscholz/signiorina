import clsx from "clsx";
import { Caveat_Brush } from "next/font/google";

// Felt-marker handwriting, loaded only on pages that show the signature.
const marker = Caveat_Brush({ weight: "400", subsets: ["latin"], display: "swap" });

/** Chef Irina's handwritten sign-off — the same on the homepage hero and the About page. */
export function Signature({ className }: { className?: string }) {
  return (
    <p className={clsx(marker.className, "-rotate-6 whitespace-nowrap leading-[1.05] text-olive", className)}>
      Con Amore
      <span className="block pr-1 text-[0.82em]">– Chef Irina</span>
    </p>
  );
}
