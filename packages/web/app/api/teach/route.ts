import { NextResponse } from "next/server";

import { backendFetch } from "./backend";
import { createAnonymousLesson } from "@/src/lib/lessons.server";
import {
  encodePendingLesson,
  PENDING_LESSON_COOKIE,
  pendingLessonCookieOptions,
} from "@/src/lib/pending-lesson-cookie";

// Start a lesson generation. Proxies to the docvid-ai Worker, which kicks off the
// Cloudflare Workflow. Keeps the Workers AI entirely server-side.
export async function POST(request: Request) {
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
    const { claimToken } = await createAnonymousLesson(parsed.id);
    const response = NextResponse.json({ id: parsed.id, claimToken }, { status: res.status });

    response.cookies.set(
      PENDING_LESSON_COOKIE,
      encodePendingLesson({ lessonId: parsed.id, claimToken }),
      pendingLessonCookieOptions(),
    );

    return response;
  } catch (err) {
    console.error("Failed to index lesson in D1:", err);
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
