"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(callback: () => void) {
  const id = setInterval(callback, MINUTE / 2);
  return () => clearInterval(id);
}

/** Current time in ms, rounded to the minute. Undefined during server render and hydration. */
export function useNow(): number | undefined {
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / MINUTE) * MINUTE,
    () => undefined,
  );
}
