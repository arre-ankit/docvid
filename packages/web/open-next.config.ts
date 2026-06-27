import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Must stay false while not using PPR; cache interception breaks RSC on Workers.
  enableCacheInterception: false,
});
