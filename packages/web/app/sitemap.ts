import type { MetadataRoute } from "next";

const SITE_URL = "https://docvid.in";

// Only the public marketing/product pages belong in the sitemap; the auth-gated
// library, the lesson player, and login are intentionally left out (noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/teach`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
