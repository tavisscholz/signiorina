import type { NextConfig } from "next";

import { flags } from "./src/config/flags";
import { robotsHeaders } from "./src/config/indexing";
import { journeyRedirects } from "./src/config/journeys";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // threeJourneyArchitectureV2: which routes redirect depends on the flag (see src/config/journeys.ts).
  async redirects() {
    return journeyRedirects(flags.threeJourneyArchitectureV2);
  },
  // X-Robots-Tag for the planners, or for the whole site on preview deployments (src/config/indexing.ts).
  async headers() {
    return robotsHeaders();
  },
};

export default nextConfig;
