/**
 * Search-indexing policy, shared by page metadata, response headers (next.config.ts) and the
 * sitemap. Relative imports only: next.config.ts loads this file.
 */

/** Vercel names the deployment type; off Vercel (local builds) it's unset. */
const vercelEnv = process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;

/**
 * False only on deployments Vercel marks as preview or development, never by hostname — the
 * production site may be served from a vercel.app address. Production and local builds index.
 */
export const indexable = vercelEnv !== "preview" && vercelEnv !== "development";

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
