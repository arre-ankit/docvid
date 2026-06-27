import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // PPR (cacheComponents) breaks OpenNext on Cloudflare: RSC prefetches 500, blank pages, worker hangs.
  // See https://github.com/opennextjs/opennextjs-cloudflare/issues/1223
  reactCompiler: true,
};

export default nextConfig;
