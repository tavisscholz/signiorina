"use client";

import Link from "next/link";
import { useEffect, type ComponentProps } from "react";

import { track, type AnalyticsEvent } from "@/lib/analytics";

type Props = Record<string, string | number | boolean | undefined>;

/** A link that records an analytics event when followed. */
export function TrackedLink({ event, props, onClick, ...rest }: ComponentProps<typeof Link> & { event: AnalyticsEvent; props?: Props }) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        track(event, props);
        onClick?.(e);
      }}
    />
  );
}

/** Records one analytics event when a page opens. Renders nothing. */
export function TrackView({ event, props }: { event: AnalyticsEvent; props?: Props }) {
  const key = JSON.stringify(props ?? {});
  useEffect(() => {
    track(event, JSON.parse(key) as Props);
  }, [event, key]);
  return null;
}
