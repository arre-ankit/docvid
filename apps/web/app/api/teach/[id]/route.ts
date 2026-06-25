import { NextResponse } from "next/server";
import { backendFetch } from "../backend";

// Poll lesson status. Rewrites the backend audio URL to a same-origin proxy
// (/api/teach/:id/audio) so the browser can play it without touching the Worker directly.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const res = await backendFetch(`/lessons/${encodeURIComponent(id)}`);
  const data = (await res.json()) as { audioUrl?: string | null; [k: string]: unknown };

  if (data && typeof data.audioUrl === "string" && data.audioUrl) {
    data.audioUrl = `/api/teach/${encodeURIComponent(id)}/audio`;
  }
  return NextResponse.json(data, { status: res.status });
}
