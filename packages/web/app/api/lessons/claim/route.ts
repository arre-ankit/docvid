import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getSession } from "@/src/auth/server";
import { claimLesson } from "@/src/lib/lessons.server";
import {
  decodePendingLesson,
  encodePendingLesson,
  PENDING_LESSON_COOKIE,
  pendingLessonCookieOptions,
} from "@/src/lib/pending-lesson-cookie";

type ClaimBody = {
  lessonId?: string;
  claimToken?: string;
};

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ClaimBody = {};
  try {
    body = (await request.json()) as ClaimBody;
  } catch {
    /* cookie-only claim is fine */
  }

  const jar = await cookies();
  const fromCookie = decodePendingLesson(jar.get(PENDING_LESSON_COOKIE)?.value);
  const lessonId = body.lessonId ?? fromCookie?.lessonId;
  const claimToken = body.claimToken ?? fromCookie?.claimToken;

  if (!lessonId || !claimToken) {
    return NextResponse.json({ error: "No pending lesson to claim" }, { status: 400 });
  }

  const result = await claimLesson({
    lessonId,
    claimToken,
    userId: session.user.id,
  });

  const response = NextResponse.json(result, { status: result.claimed ? 200 : 404 });

  if (result.claimed) {
    response.cookies.set(PENDING_LESSON_COOKIE, "", { ...pendingLessonCookieOptions(), maxAge: 0 });
  } else {
    // Refresh cookie so a retried claim still works after login.
    response.cookies.set(
      PENDING_LESSON_COOKIE,
      encodePendingLesson({ lessonId, claimToken }),
      pendingLessonCookieOptions(),
    );
  }

  return response;
}
