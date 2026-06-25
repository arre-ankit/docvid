import { type NextRequest, NextResponse } from "next/server";

/**
 * URL-hack shortcut: prefix any docs URL with the app domain to turn it into a
 * lesson, e.g.
 *   tutora.app/developers.openai.com/api/docs/guides/audio
 *   tutora.app/https://react.dev/reference/react/useEffect
 * We reconstruct the URL from the path (+ any query string) and redirect to the
 * Teach page, which auto-starts generation and lands on the lesson.
 *
 * A route handler (not a page) so it redirects server-side without rendering a
 * layout. Explicit routes (/, /teach, /learn, /api/*) take precedence.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ url?: string[] }> }) {
  const { url } = await ctx.params;

  let raw = (url ?? []).join("/").trim();
  if (!raw) return NextResponse.redirect(new URL("/teach", req.url));

  // Normalize a protocol (handles a slash-collapsed "https:/...") else assume https.
  raw = raw.replace(/^(https?):\/+/i, "$1://");
  const hasProtocol = /^https?:\/\//i.test(raw);
  // Looks like a URL only if it has a protocol or a host-like first segment (a dot).
  const looksLikeHost = /^[^/]+\.[^/]+/.test(raw);
  if (!hasProtocol && !looksLikeHost) {
    return new NextResponse("Not found", { status: 404 });
  }

  let target = hasProtocol ? raw : `https://${raw}`;

  // Re-attach the original query string (e.g. ?sdk=typescript on the docs URL).
  const qs = req.nextUrl.searchParams.toString();
  if (qs) target += (target.includes("?") ? "&" : "?") + qs;

  return NextResponse.redirect(new URL(`/teach?url=${encodeURIComponent(target)}`, req.url));
}
