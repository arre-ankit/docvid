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
 * Many docs platforms (Mintlify, Docusaurus, …) are client-rendered SPAs: the
 * code blocks are hydrated by JS and aren't in the raw HTML, so toMarkdown —
 * which does not execute JS — only captures the language label, not the code.
 * These same platforms expose a server-rendered Markdown sibling at `<url>.md`.
 * We try that first; toMarkdown passes text/markdown through untouched, so the
 * code blocks survive intact.
 */
function markdownSiblingUrl(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  // Only synthesize a sibling for extension-less or .html paths; anything with
  // a real extension (.pdf/.md/.txt/…) is already in a format toMarkdown reads.
  if (/\.md$/i.test(u.pathname)) return null;
  if (/\.html?$/i.test(u.pathname)) {
    u.pathname = u.pathname.replace(/\.html?$/i, ".md");
  } else if (/\.[a-z0-9]{1,5}$/i.test(u.pathname)) {
    return null;
  } else {
    u.pathname = `${u.pathname.replace(/\/$/, "")}.md`;
  }
  return u.toString();
}

/**
 * Fetch a URL and convert it to Markdown via Workers AI toMarkdown().
 * Throws on fetch/conversion failure so the workflow step can retry.
 */
export async function fetchPageMarkdown(env: MarkdownEnv, url: string): Promise<string | null> {
  // Prefer a server-rendered Markdown sibling when one exists (SPA docs sites).
  const mdUrl = markdownSiblingUrl(url);
  if (mdUrl) {
    try {
      const mdRes = await fetch(mdUrl, {
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DocVid/1.0)", Accept: "text/markdown,text/plain,*/*" },
      });
      const ct = mdRes.headers.get("content-type")?.toLowerCase() ?? "";
      if (mdRes.ok && (ct.includes("markdown") || ct.includes("text/plain"))) {
        const text = await mdRes.text();
        if (text.trim().length > 0) {
          console.log(`[toMarkdown] using markdown sibling ${mdUrl} (${text.length} chars)`);
          return text.slice(0, MAX_MARKDOWN_CHARS);
        }
      }
    } catch {
      // Fall through to the normal HTML → toMarkdown path.
    }
  }

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
