"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wrapper for AmbientLoop's decorative layer. Its CSS animations (pan, candle glows, bokeh) stay
 * paused until the page has finished loading and only run while the section is on screen, so they
 * never compete with first paint or keep the main thread busy off screen. Without JavaScript the
 * `.js` rules never apply and the animations run as plain CSS (see globals.css).
 */
export function AmbientMotion({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let loaded = document.readyState === "complete";
    let onScreen = false;
    const sync = () => {
      el.dataset.motion = loaded && onScreen ? "on" : "off";
    };
    const onLoad = () => {
      loaded = true;
      sync();
    };
    if (!loaded) window.addEventListener("load", onLoad, { once: true });
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" data-motion="off" className={className}>
      {children}
    </div>
  );
}
