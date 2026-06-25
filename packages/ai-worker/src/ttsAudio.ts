// Generic audio extraction for Workers AI TTS model responses.
//
// Different models return audio in different shapes — raw bytes, a base64
// string, a data: URL, or a presigned http URL — under different fields
// (the response itself, `audio`, `result.audio`, `output`, `data`, …). This
// resolves any of them to bytes, preferring inline bytes/base64 over a URL so
// we only do a network fetch when there's no inline audio. Reuse this when
// adding new TTS models.

export function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Pull candidate audio values out of the known locations in a response. */
function collectCandidates(res: unknown): unknown[] {
  const out: unknown[] = [res];
  if (res && typeof res === "object") {
    const o = res as Record<string, unknown>;
    const nests = [o, o.result, o.output, o.response, o.data].filter(
      (n): n is Record<string, unknown> => !!n && typeof n === "object",
    );
    for (const n of nests) {
      out.push(n.audio, n.audioContent, n.audio_base64, n.audioBase64, n.url, n.data);
    }
  }
  return out.filter((v) => v != null);
}

/**
 * Resolve a single candidate to bytes. `allowFetch` gates http(s) URL fetches so
 * the caller can do a no-network pass first (inline bytes/base64) before fetching.
 */
async function candidateToBytes(c: unknown, allowFetch: boolean): Promise<Uint8Array | null> {
  if (c == null) return null;
  if (c instanceof Uint8Array) return c.length ? c : null;
  if (c instanceof ArrayBuffer) return c.byteLength ? new Uint8Array(c) : null;
  if (c instanceof ReadableStream) return new Uint8Array(await new Response(c).arrayBuffer());
  if (typeof Response !== "undefined" && c instanceof Response) {
    return new Uint8Array(await c.arrayBuffer());
  }
  if (typeof c === "string") {
    if (/^https?:\/\//i.test(c)) {
      if (!allowFetch) return null;
      const r = await fetch(c);
      return r.ok ? new Uint8Array(await r.arrayBuffer()) : null;
    }
    // data: URL or bare base64
    const b64 = c.startsWith("data:") ? c.slice(c.indexOf(",") + 1) : c;
    if (b64.length < 16) return null;
    try {
      const bytes = base64ToBytes(b64);
      return bytes.length ? bytes : null;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Extract audio bytes from a TTS model response, preferring inline bytes/base64
 * over a URL (only fetches a URL if no inline audio is present).
 */
export async function extractAudioBytes(res: unknown): Promise<Uint8Array | null> {
  const candidates = collectCandidates(res);
  // Pass 1: inline bytes / base64 (no network).
  for (const c of candidates) {
    const bytes = await candidateToBytes(c, false);
    if (bytes && bytes.length) return bytes;
  }
  // Pass 2: fetch a URL.
  for (const c of candidates) {
    const bytes = await candidateToBytes(c, true);
    if (bytes && bytes.length) return bytes;
  }
  return null;
}
