"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";

import { getMedia } from "@/config/media";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const main = getMedia(images[active]);
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-linen">
        <Image
          key={images[active]}
          src={main.src}
          alt={main.alt}
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="animate-rise object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-3" role="group" aria-label={`${name} photos`}>
          {images.map((key, i) => {
            const item = getMedia(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={i === active}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                className={clsx(
                  "relative aspect-square w-20 overflow-hidden rounded-[50%] border-2 transition-[border-color,opacity] md:w-24",
                  i === active ? "border-olive" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={item.src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
