import { backendFetch } from "../../backend";

// Streams the generated narration audio (MP3 from Workers AI MeloTTS) from the
// docvid-ai Worker's R2 bucket, passing through its content type.
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const res = await backendFetch(`/audio/${encodeURIComponent(id)}`);
  if (!res.ok || !res.body) {
    return new Response("Audio not found", { status: 404 });
  }
  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "audio/mpeg",
      "Cache-Control": "public, max-age=604800",
    },
  });
}
