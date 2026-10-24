/**
 * Feature flags. Read at build time (the NEXT_PUBLIC_ prefix keeps the server and the
 * browser in agreement), so changing one means redeploying. No imports: next.config.ts
 * reads this file too.
 */

/** "true"/"1" turns a flag on, "false"/"0" turns it off; unset falls back to the default. */
function flag(value: string | undefined, fallback: boolean): boolean {
  const v = value?.trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return fallback;
}

export const flags = {
  /**
   * Everyday · Events · Weddings: the three-journey homepage, navigation, /everyday,
   * /events and the Build Your Table planner. ON since launch (approved by the owner).
   * Kill switch: NEXT_PUBLIC_FLAG_THREE_JOURNEY_ARCHITECTURE_V2=false, then redeploy —
   * the original site returns. See docs/three-journeys-v2/ROLLBACK.md.
   */
  threeJourneyArchitectureV2: flag(process.env.NEXT_PUBLIC_FLAG_THREE_JOURNEY_ARCHITECTURE_V2, true),
} as const;
