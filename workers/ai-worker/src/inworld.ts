// Cloudflare Workers AI text-to-speech via Inworld TTS 2 (inworld/tts-2).
// Built into the AI binding — no API key. Expressive, multilingual, selectable
// voices, up to 2000 chars/call. We request WAV so segments merge cleanly.

import { extractAudioBytes } from "./ttsAudio";
import { mergeWavFiles, wavDurationMs } from "./wav";

const INWORLD_MODEL = "inworld/tts-2";
// Model allows 2000 chars; stay a little under and split on sentences.
const MAX_CHARS = 1800;
const DEFAULT_VOICE = "Dennis";
// Synthesize segments concurrently (each call is ~15-25s). Higher parallelism
// means total wall-time ≈ the slowest single segment instead of their sum.
const MAX_CONCURRENCY = 8;
// Transient gateway hiccups (502/429) are common under load; retry the single
// chunk a few times before giving up so one blip never aborts the whole batch.
const CHUNK_RETRIES = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Run `task` over `items` with at most `limit` in flight; results keep input order. */
async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await task(items[i]!, i);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Split text into <= maxChars chunks at sentence/space boundaries. */
export function chunkText(text: string, maxChars: number = MAX_CHARS): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];
  const sentences = clean.match(/[^.!?]+[.!?]*\s*/g) ?? [clean];
  const chunks: string[] = [];
  let cur = "";
  const flush = () => {
    if (cur.trim()) chunks.push(cur.trim());
    cur = "";
  };
  for (const sentence of sentences) {
    const s = sentence.trim();
    if (!s) continue;
    if (s.length > maxChars) {
      flush();
      for (const w of s.split(" ")) {
        if ((cur ? cur.length + 1 + w.length : w.length) > maxChars) flush();
        cur += (cur ? " " : "") + w;
      }
      continue;
    }
    if ((cur ? cur.length + 1 + s.length : s.length) > maxChars) flush();
    cur += (cur ? " " : "") + s;
  }
  flush();
  return chunks;
}

/**
 * Synthesize each segment's text with Inworld TTS 2 and return one merged WAV
 * track plus per-segment durations (so the code animation can be timed to the
 * voice). `voiceId` is an Inworld voice id (e.g. "Dennis", "Olivia").
 */
export async function synthesizeSegmentsInworld(
  ai: Ai,
  texts: string[],
  voiceId: string = DEFAULT_VOICE,
): Promise<{ audio: Uint8Array; durations: number[]; contentType: string }> {
  const voice_id = voiceId || DEFAULT_VOICE;

  const synthChunk = async (chunk: string): Promise<Uint8Array | null> => {
    for (let attempt = 0; attempt <= CHUNK_RETRIES; attempt++) {
      try {
        const res = (await ai.run(INWORLD_MODEL as keyof AiModels, {
          text: chunk,
          voice_id,
          output_format: "wav",
          sample_rate: 24000,
        } as never)) as unknown;
        const bytes = await extractAudioBytes(res);
        if (bytes && bytes.length > 0) return bytes;
        const shape =
          res && typeof res === "object" ? `object keys=[${Object.keys(res).join(",")}]` : typeof res;
        console.log(`[inworld] no audio for chunk (${chunk.length} chars), res=${shape}`);
      } catch (e) {
        // Transient 502/429/timeout — back off and retry this one chunk only.
        if (attempt < CHUNK_RETRIES) {
          await sleep(800 * (attempt + 1));
          continue;
        }
        console.log(`[inworld] chunk failed after ${CHUNK_RETRIES} retries: ${(e as Error)?.message?.slice(0, 80)}`);
      }
      // Non-throwing empty response: retry too (with backoff) up to the limit.
      if (attempt < CHUNK_RETRIES) await sleep(800 * (attempt + 1));
    }
    return null;
  };

  // Synthesize all segments concurrently (bounded), preserving segment order.
  const perSegment = await mapWithConcurrency(texts, MAX_CONCURRENCY, async (text, si) => {
    const chunks = chunkText(text);
    // A segment is almost always a single chunk; if not, keep its chunks ordered.
    const chunkResults = await Promise.all(chunks.map(synthChunk));
    const chunkFiles = chunkResults.filter((b): b is Uint8Array => !!b && b.length > 0);

    if (chunkFiles.length === 0) {
      console.log(`[inworld] seg ${si}: empty (text=${text.length} chars)`);
      return { file: null as Uint8Array | null, duration: 0 };
    }
    const segFile = mergeWavFiles(chunkFiles);
    const segDur = wavDurationMs(segFile);
    console.log(
      `[inworld] seg ${si}: ${chunkFiles.length} chunks, ${segFile.length} bytes, ${segDur}ms, ` +
        `text=${text.length} chars`,
    );
    return { file: segFile, duration: segDur };
  });

  const segmentFiles = perSegment.filter((s) => s.file).map((s) => s.file!);
  const durations = perSegment.map((s) => s.duration);

  const audio = mergeWavFiles(segmentFiles);
  const totalMs = durations.reduce((a, b) => a + b, 0);
  console.log(
    `[inworld] total: ${audio.length} bytes, ${totalMs}ms across ${texts.length} segments (voice=${voice_id})`,
  );
  return { audio, durations, contentType: "audio/wav" };
}
