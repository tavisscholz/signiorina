/**
 * Feature flags. Read at build time (the NEXT_PUBLIC_ prefix keeps the server and the
 * browser in agreement), so changing one means redeploying. No imports: next.config.ts
 * reads this file too.
 */

function enabled(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

export const flags = {
  /**
   * Everyday · Events · Weddings: the three-journey homepage, navigation, /everyday,
   * /events and the Build Your Table planner. Default OFF — the original site is served.
   * Turn on with NEXT_PUBLIC_FLAG_THREE_JOURNEY_ARCHITECTURE_V2=true.
   */
  threeJourneyArchitectureV2: enabled(process.env.NEXT_PUBLIC_FLAG_THREE_JOURNEY_ARCHITECTURE_V2),
} as const;
