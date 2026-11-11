/**
 * Search-indexing policy, shared by page metadata, response headers (next.config.ts) and the
 * sitemap. Relative imports only: next.config.ts loads this file.
 */

/** Vercel names the deployment type; off Vercel (local builds, other hosts) it's unset. */
const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;

/**
 * Explicit opt-out for staging copies on hosts that don't mark previews — e.g. the temporary
 * *.hostingersite.com address before the custom domain moves. Read at build time.
 */
const noindexRequested = process.env.SITE_NOINDEX === "true";

/**
 * False on deployments Vercel marks as preview or development, and on builds with
 * SITE_NOINDEX=true — never by hostname, since production may be served from a platform
 * address. Production and local builds index.
 */
export const indexable = !noindexRequested && vercelEnv !== "preview" && vercelEnv !== "development";

/**
 * Reachable from normal links and crawlable (robots.txt allows them, so crawlers can read the
 * directive), never indexed. Covers every query-string variant: the directive is per path.
 */
export const noindexFollowRoutes = ["/weddings/build", "/events/plan"];

/** The same policy as an HTTP header, for next.config.ts `headers()`. */
export function robotsHeaders() {
  if (!indexable) return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }] }];
  return noindexFollowRoutes.map((source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }] }));
}
