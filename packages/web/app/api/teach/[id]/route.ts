import { NextResponse } from "next/server";

import { backendFetch } from "../backend";
import { markLessonComplete, markLessonError } from "@/src/lib/lessons.server";

type LessonStatusPayload = {
  status?: string;
  lesson?: { title?: string };
  [k: string]: unknown;
};

// Poll lesson status. Rewrites the backend audio URL to a same-origin proxy
// (/api/teach/:id/audio) so the browser can play it without touching the Worker directly.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const res = await backendFetch(`/lessons/${encodeURIComponent(id)}`);
  const data = (await res.json()) as LessonStatusPayload & { audioUrl?: string | null };

  if (data && typeof data.audioUrl === "string" && data.audioUrl) {
    data.audioUrl = `/api/teach/${encodeURIComponent(id)}/audio`;
  }

  try {
    if (data.status === "complete") {
      await markLessonComplete(id, data.lesson?.title);
    } else if (data.status === "error") {
      await markLessonError(id);
    }
  } catch (err) {
    console.error("Failed to sync lesson status to D1:", err);
  }

  return NextResponse.json(data, { status: res.status });
}
