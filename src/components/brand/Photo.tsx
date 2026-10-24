import Image from "next/image";
import clsx from "clsx";

import { getMedia } from "@/config/media";

type Shape = "rect" | "rounded" | "oval" | "arch";

const shapes: Record<Shape, string> = {
  rect: "",
  rounded: "rounded-[1.25rem]",
  oval: "oval",
  arch: "arch",
};

/**
 * Editorial photograph from the media registry. Always fills its frame (object-cover);
 * size the frame with aspect classes on `className`.
 */
export function Photo({
  media,
  className,
  shape = "rect",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  position,
  zoom = false,
  alt,
}: {
  media: string;
  className?: string;
  shape?: Shape;
  sizes?: string;
  priority?: boolean;
  /** CSS object-position, e.g. "50% 30%". */
  position?: string;
  zoom?: boolean;
  /** Override the registry alt text (pass "" for decorative duplicates). */
  alt?: string;
}) {
  const item = getMedia(media);
  return (
    <div className={clsx("relative overflow-hidden bg-linen", shapes[shape], zoom && "img-zoom", className)}>
      <Image
        src={item.src}
        alt={alt ?? item.alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        className="object-cover"
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  );
}
