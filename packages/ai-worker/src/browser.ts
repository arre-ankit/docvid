// Turn a source URL (docs/article) into Markdown so it can drive a lesson.
//
// Uses Workers AI's built-in env.AI.toMarkdown() conversion: we fetch the URL
// bytes and hand them to toMarkdown, which extracts clean Markdown. This needs
// no extra binding/secret (it rides the existing AI binding) and is free for
// most formats (HTML, PDF, docx, …). See:
//   https://developers.cloudflare.com/workers-ai/features/markdown-conversion/
//
// Note: toMarkdown converts the fetched document as-is — it does not execute
// JavaScript. That's fine for server-rendered docs (the common case); fully
// client-rendered SPAs may yield little content.

export type MarkdownEnv = {
  AI: Ai;
};

// We keep the full page (capped for KV/sessionStorage sanity) so the Docs view
// and code-block extraction see the whole document. The slice we feed the model
// is trimmed separately in ai.ts.
const MAX_MARKDOWN_CHARS = 80_000;

/** Pick a filename + extension so toMarkdown can detect the document format. */
function fileNameForSource(url: string, contentType: string): string {
  const ct = contentType.toLowerCase();
  const byType: Record<string, string> = {
    "text/html": "html",
    "application/xhtml+xml": "html",
    "application/pdf": "pdf",
    "text/markdown": "md",
    "text/plain": "txt",
    "application/xml": "xml",
    "text/xml": "xml",
    "text/csv": "csv",
  };
  let ext = Object.entries(byType).find(([type]) => ct.startsWith(type))?.[1];
  if (!ext) {
    const path = (() => {
      try {
        return new URL(url).pathname;
      } catch {
        return "";
      }
    })();
    const m = path.match(/\.([a-z0-9]{1,5})$/i);
    ext = m ? m[1]!.toLowerCase() : "html";
  }
  return `source.${ext}`;
}

/**
 * Fetch a URL and convert it to Markdown via Workers AI toMarkdown().
 * Throws on fetch/conversion failure so the workflow step can retry.
 */
export async function fetchPageMarkdown(env: MarkdownEnv, url: string): Promise<string | null> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      // A real UA so docs sites return their normal HTML.
      "User-Agent":
        "Mozilla/5.0 (compatible; DocVid/1.0; +https://github.com/) AppleWebKit/537.36",
      Accept: "text/html,application/xhtml+xml,application/pdf,*/*",
    },
  });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status}`);

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const blob = await res.blob();
  const name = fileNameForSource(url, contentType);

  const results = (await env.AI.toMarkdown([{ name, blob }])) as
    | { data?: string }
    | Array<{ data?: string }>;

  const markdown = Array.isArray(results)
    ? results.map((r) => r?.data ?? "").join("\n\n")
    : (results?.data ?? "");

  if (!markdown || markdown.trim().length === 0) {
    throw new Error("toMarkdown returned empty content");
  }

  // Debug: inspect what toMarkdown extracted (visible in `wrangler dev` logs).
  console.log(
    `[toMarkdown] ${url}\n  content-type: ${contentType}\n  length: ${markdown.length} chars\n` +
      `--- markdown preview (first 2000 chars) ---\n${markdown.slice(0, 2000)}\n--- end preview ---`,
  );

  return markdown.slice(0, MAX_MARKDOWN_CHARS);
}
