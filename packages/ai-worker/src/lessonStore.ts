import type { StoredLesson } from "@docvid/shared";

import type { Env } from "./env";

// KV is a fast read cache in front of the durable R2 copy. Keep a bounded TTL so
// stale cache entries can't outlive an update; R2 is the source of truth.
const KV_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

function r2Key(lessonId: string): string {
  return `lessons/${lessonId}.json`;
}

/**
 * Durably persist a lesson. Writes the canonical copy to R2 (no expiry) and
 * primes the KV cache. Lessons must survive indefinitely — they're the product —
 * so R2 is the store of record and KV is only an accelerator.
 */
export async function putLesson(env: Env, lessonId: string, lesson: StoredLesson): Promise<void> {
  const body = JSON.stringify(lesson);
  await Promise.all([
    env.LESSON_AUDIO.put(r2Key(lessonId), body, {
      httpMetadata: { contentType: "application/json" },
    }),
    env.LESSONS.put(lessonId, body, { expirationTtl: KV_CACHE_TTL_SECONDS }),
  ]);
}

/**
 * Read a lesson, preferring the KV cache and falling back to the durable R2 copy.
 * On a cache miss that R2 satisfies, the KV cache is repopulated so subsequent
 * reads are fast again.
 */
export async function getLesson(env: Env, lessonId: string): Promise<StoredLesson | null> {
  const cached = await env.LESSONS.get(lessonId);
  if (cached) return JSON.parse(cached) as StoredLesson;

  const obj = await env.LESSON_AUDIO.get(r2Key(lessonId));
  if (!obj) return null;

  const body = await obj.text();
  // Repopulate the cache (best-effort; a failure here just costs a future R2 read).
  await env.LESSONS.put(lessonId, body, { expirationTtl: KV_CACHE_TTL_SECONDS }).catch(() => {});
  return JSON.parse(body) as StoredLesson;
}
