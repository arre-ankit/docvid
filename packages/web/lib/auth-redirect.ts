/** Build `/login?next=...&lesson=...` preserving the page the user came from. */
export function buildLoginUrl(currentPath: string, search: string): string {
  const params = new URLSearchParams();
  const returnTo = currentPath + search;
  params.set("next", returnTo);

  if (search) {
    const lesson = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get(
      "lesson",
    );
    if (lesson) params.set("lesson", lesson);
  }

  return `/login?${params.toString()}`;
}

export type ClaimResult = {
  claimed: boolean;
  lessonId?: string;
};

/**
 * Where to send the user after sign-in / OAuth.
 * Honors explicit `next`, otherwise returns to a claimed lesson on /learn.
 */
export function resolvePostAuthRedirect(
  nextParam: string | null,
  lessonParam: string | null,
  claim: ClaimResult,
): string {
  if (nextParam) {
    return nextParam;
  }

  const lessonId = lessonParam ?? claim.lessonId;
  if (lessonId) {
    return `/learn?lesson=${encodeURIComponent(lessonId)}`;
  }

  return "/library";
}

/** Extract `lesson` id from a `/learn?lesson=...` next URL, if present. */
export function lessonIdFromNext(next: string | null): string | null {
  if (!next) return null;
  try {
    const url = next.startsWith("/") ? new URL(next, "http://local") : new URL(next);
    return url.searchParams.get("lesson");
  } catch {
    return null;
  }
}
