"use client";

import { useEffect, useRef } from "react";

/**
 * Muted background loop. Plays only while on screen, never for visitors who prefer
 * reduced motion or have Data Saver on, and fades in once frames are actually playing —
 * until then the still underneath shows through.
 */
export function AmbientVideo({ mp4, webm }: { mp4: string; webm: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    let onScreen = false;

    const sync = () => {
      if (onScreen && !reducedMotion.matches && !saveData) {
        video.preload = "auto";
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    reducedMotion.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000 data-[playing=true]:opacity-100"
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      onPlaying={(e) => {
        e.currentTarget.dataset.playing = "true";
      }}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
