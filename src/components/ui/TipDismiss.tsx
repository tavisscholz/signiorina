"use client";

import { useEffect } from "react";

/**
 * Esc hides any open hover explainer (`.tip`) until the pointer moves again, so content shown
 * on hover can always be dismissed without moving the mouse.
 */
export function TipDismiss() {
  useEffect(() => {
    const root = document.documentElement;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") root.dataset.tipsHidden = "";
    };
    const onMove = () => {
      if ("tipsHidden" in root.dataset) delete root.dataset.tipsHidden;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return null;
}
