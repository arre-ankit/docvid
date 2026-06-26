import "server-only";

const COOKIE_NAME = "docvid_pending";
const MAX_AGE_SEC = 7 * 24 * 60 * 60;

export type PendingLesson = {
  lessonId: string;
  claimToken: string;
};

export function encodePendingLesson(pending: PendingLesson): string {
  return `${pending.lessonId}:${pending.claimToken}`;
}

export function decodePendingLesson(raw: string | undefined | null): PendingLesson | null {
  if (!raw) return null;
  const sep = raw.indexOf(":");
  if (sep <= 0) return null;
  const lessonId = raw.slice(0, sep);
  const claimToken = raw.slice(sep + 1);
  if (!lessonId || !claimToken) return null;
  return { lessonId, claimToken };
}

export function pendingLessonCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: MAX_AGE_SEC,
    path: "/",
  };
}

export { COOKIE_NAME as PENDING_LESSON_COOKIE };
