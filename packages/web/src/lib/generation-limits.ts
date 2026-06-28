import "server-only";

/**
 * Free generation quotas.
 *
 * - Anonymous (signed-out) visitors get {@link ANON_FREE_LIMIT} generations,
 *   tracked via an httpOnly cookie. This is a *soft* gate (clearable in
 *   incognito) — its job is to nudge people to sign in, not to stop abuse.
 * - Signed-in free users get {@link FREE_USER_LIMIT} lifetime generations,
 *   counted directly from their rows in the `lessons` table.
 * - Pro subscribers are unlimited.
 */
export const ANON_FREE_LIMIT = 1;
export const FREE_USER_LIMIT = 5;

/** Cookie that records how many lessons a signed-out visitor has started. */
export const ANON_GEN_COOKIE = "docvid_anon_gens";

const ANON_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1 year

export function anonGenCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: ANON_COOKIE_MAX_AGE_SEC,
    path: "/",
  };
}

/** Parse the anon-generation counter cookie into a non-negative integer. */
export function parseAnonGenCount(raw: string | undefined | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
