import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { backendFetch } from "./backend";
import { getSession } from "@/src/auth/server";
import { createAnonymousLesson, countLessonsForUser } from "@/src/lib/lessons.server";
import { getSubscriptionForUser } from "@/src/lib/subscription.server";
import {
  ANON_FREE_LIMIT,
  ANON_GEN_COOKIE,
  FREE_USER_LIMIT,
  anonGenCookieOptions,
  parseAnonGenCount,
} from "@/src/lib/generation-limits";
import {
  encodePendingLesson,
  PENDING_LESSON_COOKIE,
  pendingLessonCookieOptions,
} from "@/src/lib/pending-lesson-cookie";

// Start a lesson generation. Proxies to the docvid-ai Worker, which kicks off the
// Cloudflare Workflow. Keeps the Workers AI entirely server-side.
export async function POST(request: Request) {
  const session = await getSession();
  const cookieStore = await cookies();

  // ---- Free-generation quota gate (runs before any backend work) ----
  // Anonymous: 1 free lesson, then sign in. Free users: 5 lifetime, then
  // upgrade. Pro: unlimited. Returning a structured error lets the client show
  // the right CTA (login vs upgrade).
  let anonCount = 0;
  if (!session) {
    anonCount = parseAnonGenCount(cookieStore.get(ANON_GEN_COOKIE)?.value);
    if (anonCount >= ANON_FREE_LIMIT) {
      return NextResponse.json(
        { error: "login_required", message: "Sign in to keep creating lessons." },
        { status: 401 },
      );
    }
  } else {
    const subscription = await getSubscriptionForUser(session.user.id);
    if (!subscription.isPro) {
      const used = await countLessonsForUser(session.user.id);
      if (used >= FREE_USER_LIMIT) {
        return NextResponse.json(
          {
            error: "upgrade_required",
            message: "You've used all your free lessons. Upgrade to Pro for unlimited lessons.",
          },
          { status: 402 },
        );
      }
    }
  }

  const body = await request.text();
  const res = await backendFetch("/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = await res.text();
  if (!res.ok) {
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  let parsed: { id?: string } = {};
  try {
    parsed = JSON.parse(data) as { id?: string };
  } catch {
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!parsed.id) {
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Own the lesson immediately if the creator is already signed in; otherwise
    // it stays anonymous and is claimed via the pending cookie after login.
    const { claimToken } = await createAnonymousLesson(parsed.id, session?.user.id);
    const response = NextResponse.json({ id: parsed.id, claimToken }, { status: res.status });

    response.cookies.set(
      PENDING_LESSON_COOKIE,
      encodePendingLesson({ lessonId: parsed.id, claimToken }),
      pendingLessonCookieOptions(),
    );

    // Count this generation against the anonymous quota now that it started.
    if (!session) {
      response.cookies.set(ANON_GEN_COOKIE, String(anonCount + 1), anonGenCookieOptions());
    }

    return response;
  } catch (err) {
    console.error("Failed to index lesson in D1:", err);
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
