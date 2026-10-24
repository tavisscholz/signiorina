import { eventPackages, grazingTables, type EventPackage, type GrazingTier, type GrazingTierId } from "@/config/events";
import { site } from "@/config/site";

export interface EventPackageView extends EventPackage {
  tier: GrazingTier;
  /** What customers see: the proposed name once approved (or where placeholders show), else the tier name. */
  name: string;
  subline: string;
  /** True when a not-yet-approved proposed name is on screen — label it "Proposed name". */
  proposed: boolean;
}

export function eventPackageView(pkg: EventPackage, showProposed = site.showPlaceholders): EventPackageView {
  const tier = grazingTables.tiers.find((t) => t.id === pkg.tierId)!;
  const useProposed = eventPackages.namesApproved || showProposed;
  return {
    ...pkg,
    tier,
    name: useProposed ? pkg.proposedName : `${tier.name} grazing table`,
    subline: useProposed ? pkg.proposedSubline : tier.line,
    proposed: useProposed && !eventPackages.namesApproved,
  };
}

export function eventPackageViews(showProposed = site.showPlaceholders): EventPackageView[] {
  return eventPackages.packages.map((p) => eventPackageView(p, showProposed));
}

export function getEventPackageView(tierId: string, showProposed = site.showPlaceholders): EventPackageView | undefined {
  const pkg = eventPackages.packages.find((p) => p.tierId === (tierId as GrazingTierId));
  return pkg ? eventPackageView(pkg, showProposed) : undefined;
}
