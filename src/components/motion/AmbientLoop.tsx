import clsx from "clsx";
import Image from "next/image";
import type { CSSProperties } from "react";

import { AmbientVideo } from "@/components/motion/AmbientVideo";
import { getMedia, type AmbientLoop as AmbientLoopConfig } from "@/config/media";

/** Candle glows and rising motes for the placeholder: [left %, top %, size rem, flicker s, delay s]. */
const GLOWS: Array<[number, number, number, number, number]> = [
  [14, 58, 11, 3.4, 0],
  [31, 44, 7, 2.7, 0.6],
  [52, 62, 13, 4.1, 1.1],
  [68, 40, 8, 3.0, 0.3],
  [84, 55, 12, 3.7, 1.6],
  [93, 30, 6, 2.5, 0.9],
];
const MOTES: Array<[number, number, number, number]> = [
  // [left %, top %, size px, delay s]
  [8, 78, 10, 0],
  [22, 70, 6, 2.5],
  [37, 82, 12, 5],
  [49, 66, 7, 1.2],
  [61, 80, 9, 7.4],
  [73, 72, 6, 3.6],
  [88, 84, 11, 9],
  [95, 64, 7, 6.1],
];

/**
 * Full-bleed, decorative section background: the configured video loop, or — until the
 * footage exists — a 12-second placeholder (a slow pan over a still, flickering candle
 * glows and drifting bokeh). Place it first inside a `relative isolate overflow-hidden` section.
 */
export function AmbientLoop({ loop, className }: { loop: AmbientLoopConfig; className?: string }) {
  const still = getMedia(loop.placeholder);
  const placeholder = !loop.mp4;
  return (
    <div aria-hidden="true" className={clsx("absolute inset-0 overflow-hidden bg-espresso", className)}>
      <div className={clsx("absolute", placeholder ? "ambient-pan inset-[-6%]" : "inset-0")}>
        {loop.poster ? (
          <Image src={loop.poster} alt="" fill sizes="100vw" className="object-cover" />
        ) : (
          <Image
            src={still.src}
            alt=""
            fill
            sizes="100vw"
            placeholder="blur"
            // The stand-in still is soft by design: the table glows, the room stays out of focus.
            className={clsx("object-cover", placeholder && "blur-[2px] saturate-[1.1]")}
            style={{ objectPosition: loop.placeholderPosition }}
          />
        )}
      </div>

      {loop.mp4 ? <AmbientVideo mp4={loop.mp4} webm={loop.webm} /> : null}

      {placeholder ? (
        <>
          {GLOWS.map(([left, top, size, speed, delay]) => (
            <span
              key={`g${left}`}
              className="ambient-glow"
              style={
                {
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${size}rem`,
                  height: `${size}rem`,
                  "--glow-speed": `${speed}s`,
                  "--glow-delay": `${delay}s`,
                } as CSSProperties
              }
            />
          ))}
          {MOTES.map(([left, top, size, delay]) => (
            <span
              key={`m${left}`}
              className="ambient-mote"
              style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${delay}s` }}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
