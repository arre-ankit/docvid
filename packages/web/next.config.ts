import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
  // PPR (cacheComponents) breaks OpenNext on Cloudflare: RSC prefetches 500, blank pages, worker hangs.
  // See https://github.com/opennextjs/opennextjs-cloudflare/issues/1223
  reactCompiler: true,
};

// Makes Cloudflare bindings + `.dev.vars` available to `getCloudflareContext()` during `next dev`.
initOpenNextCloudflareForDev();

export default nextConfig;
