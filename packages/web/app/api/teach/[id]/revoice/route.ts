import { NextResponse } from "next/server";
import { backendFetch } from "../../backend";

// Re-synthesize an existing lesson's narration with a different speaker.
// Proxies to the docvid-ai Worker, which runs the re-voice workflow and returns
// a job id to poll via GET /api/teach/:jobId.
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await request.text();
  const res = await backendFetch(`/lessons/${encodeURIComponent(id)}/revoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
