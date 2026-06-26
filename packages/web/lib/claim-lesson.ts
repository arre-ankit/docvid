"use client";

/** Client-side pending-lesson helpers (mirrors the httpOnly claim cookie). */
const CLAIM_PREFIX = "docvid-claim:";

export function storeClaimToken(lessonId: string, claimToken: string) {
  try {
    sessionStorage.setItem(`${CLAIM_PREFIX}${lessonId}`, claimToken);
  } catch {
    /* ignore */
  }
}

export function readClaimToken(lessonId: string): string | null {
  try {
    return sessionStorage.getItem(`${CLAIM_PREFIX}${lessonId}`);
  } catch {
    return null;
  }
}

export async function claimPendingLesson(opts?: { lessonId?: string; claimToken?: string }) {
  const res = await fetch("/api/lessons/claim", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lessonId: opts?.lessonId,
      claimToken: opts?.claimToken,
    }),
  });

  if (!res.ok) {
    return { claimed: false as const };
  }

  const data = (await res.json()) as { claimed?: boolean; lessonId?: string };
  if (data.claimed && data.lessonId) {
    try {
      sessionStorage.removeItem(`${CLAIM_PREFIX}${data.lessonId}`);
    } catch {
      /* ignore */
    }
  }
  return { claimed: !!data.claimed, lessonId: data.lessonId };
}
