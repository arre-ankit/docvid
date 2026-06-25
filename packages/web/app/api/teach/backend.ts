import "server-only";

// Reaches the docvid-ai Worker. In production the AI_BACKEND service binding is used
// (no network hop, no public URL needed). In `next dev` the binding is absent, so we
// fall back to fetching AI_BACKEND_URL (a local `wrangler dev` or a deployed URL).
export async function backendFetch(path: string, init?: RequestInit): Promise<Response> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as { AI_BACKEND?: { fetch: typeof fetch } };
    if (env.AI_BACKEND) {
      return env.AI_BACKEND.fetch(`https://docvid-ai${path}`, init);
    }
  } catch {
    // getCloudflareContext throws outside the Workers runtime (e.g. plain `next dev`).
  }
  const base = process.env.AI_BACKEND_URL ?? "http://localhost:8787";
  return fetch(`${base}${path}`, init);
}
