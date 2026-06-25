// Cloudflare Workers AI text-to-speech via MeloTTS (@cf/myshell-ai/melotts).
// Built into the AI binding — no API key, ~$0.0002/audio-min. Returns base64 MP3.
//
// We synthesize each narration segment, measure its duration (by parsing MP3
// frame headers), and concatenate the segments into one MP3 track. The merged
// MP3 plays in the browser and is muxed into the exported video by ffmpeg.

import { extractAudioBytes } from "./ttsAudio";
import { mergeWavFiles, wavDurationMs } from "./wav";

const MELO_MODEL = "@cf/myshell-ai/melotts";
// MeloTTS truncates long prompts (it renders ~one sentence per call), so we feed
// it short, sentence-level chunks and concatenate the results.
const MAX_CHARS = 180;

/**
 * Split text into short, sentence-level chunks (<= maxChars). Sentences are kept
 * intact where possible; a very long sentence is split on commas/spaces.
 */
export function chunkText(text: string, maxChars: number = MAX_CHARS): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
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
    if (s.length <= maxChars) {
      // Group short sentences up to the limit.
      if ((cur ? cur.length + 1 + s.length : s.length) > maxChars) flush();
      cur += (cur ? " " : "") + s;
    } else {
      flush();
      // Split an overlong sentence on commas first, then spaces.
      const parts = s.split(/(?<=,)\s+/);
      for (const part of parts) {
        if (part.length <= maxChars) {
          if ((cur ? cur.length + 1 + part.length : part.length) > maxChars) flush();
          cur += (cur ? " " : "") + part;
        } else {
          for (const w of part.split(" ")) {
            if ((cur ? cur.length + 1 + w.length : w.length) > maxChars) flush();
            cur += (cur ? " " : "") + w;
          }
        }
      }
      flush();
    }
  }
  flush();
  return chunks;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

// MP3 frame tables (Layer III).
const BR_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BR_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SR_V1 = [44100, 48000, 32000];
const SR_V2 = [22050, 24000, 16000];
const SR_V25 = [11025, 12000, 8000];

/** Duration (ms) of an MP3 buffer by summing Layer III frame durations. */
export function mp3DurationMs(buf: Uint8Array): number {
  let i = 0;
  // Skip an ID3v2 tag if present.
  if (buf.length > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) {
    const size =
      ((buf[6]! & 0x7f) << 21) | ((buf[7]! & 0x7f) << 14) | ((buf[8]! & 0x7f) << 7) | (buf[9]! & 0x7f);
    i = 10 + size;
  }

  let durationSec = 0;
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i + 1]! & 0xe0) !== 0xe0) {
      i++;
      continue;
    }
    const verBits = (buf[i + 1]! >> 3) & 0x03; // 11=MPEG1, 10=MPEG2, 00=MPEG2.5, 01=reserved
    const layerBits = (buf[i + 1]! >> 1) & 0x03; // 01=Layer III
    if (verBits === 1 || layerBits !== 1) {
      i++;
      continue;
    }
    const brIndex = (buf[i + 2]! >> 4) & 0x0f;
    const srIndex = (buf[i + 2]! >> 2) & 0x03;
    const padding = (buf[i + 2]! >> 1) & 0x01;
    if (brIndex === 0 || brIndex === 15 || srIndex === 3) {
      i++;
      continue;
    }
    const mpeg1 = verBits === 3;
    const bitrate = (mpeg1 ? BR_V1 : BR_V2)[brIndex]! * 1000;
    const sampleRate = (verBits === 3 ? SR_V1 : verBits === 2 ? SR_V2 : SR_V25)[srIndex]!;
    const samples = mpeg1 ? 1152 : 576;
    const frameLen = Math.floor(((mpeg1 ? 144 : 72) * bitrate) / sampleRate) + padding;
    if (frameLen <= 1) {
      i++;
      continue;
    }
    durationSec += samples / sampleRate;
    i += frameLen;
  }
  return Math.round(durationSec * 1000);
}

/** True if the buffer is a RIFF/WAVE file. */
function isWav(b: Uint8Array): boolean {
  return (
    b.length > 12 &&
    b[0] === 0x52 && // R
    b[1] === 0x49 && // I
    b[2] === 0x46 && // F
    b[3] === 0x46 // F
  );
}

/**
 * Synthesize each segment's text with MeloTTS and return one merged audio track
 * plus per-segment durations (so the code animation can be timed to the voice).
 *
 * MeloTTS on Workers AI returns WAV (PCM) per call, so we merge WAV files
 * properly (single header, concatenated samples) rather than byte-appending —
 * naive concatenation makes the browser play only the first clip. Falls back to
 * MP3 frame handling if the model ever returns MP3.
 */
export async function synthesizeSegmentsMelo(
  ai: Ai,
  texts: string[],
  lang = "en",
): Promise<{ audio: Uint8Array; durations: number[]; contentType: string }> {
  const segmentFiles: Uint8Array[] = [];
  const durations: number[] = [];
  let wavFormat = true;

  for (const [si, text] of texts.entries()) {
    const chunks = chunkText(text);
    const chunkFiles: Uint8Array[] = [];
    for (const chunk of chunks) {
      const res = (await ai.run(MELO_MODEL as keyof AiModels, {
        prompt: chunk,
        lang,
      } as never)) as unknown;
      const bytes = await extractAudioBytes(res);
      if (!bytes || bytes.length === 0) {
        console.log(`[melotts] seg ${si}: no audio for chunk (${chunk.length} chars)`);
        continue;
      }
      if (segmentFiles.length === 0 && chunkFiles.length === 0) wavFormat = isWav(bytes);
      chunkFiles.push(bytes);
    }

    if (chunkFiles.length === 0) {
      durations.push(0);
      console.log(`[melotts] seg ${si}: empty (text=${text.length} chars)`);
      continue;
    }

    const segFile = wavFormat ? mergeWavFiles(chunkFiles) : concat(chunkFiles);
    const segDur = wavFormat ? wavDurationMs(segFile) : mp3DurationMs(segFile);
    segmentFiles.push(segFile);
    durations.push(segDur);
    console.log(
      `[melotts] seg ${si}: ${chunkFiles.length} chunks, ${segFile.length} bytes, ${segDur}ms, ` +
        `fmt=${wavFormat ? "wav" : "mp3"}, text=${text.length} chars`,
    );
  }

  const audio = wavFormat ? mergeWavFiles(segmentFiles) : concat(segmentFiles);
  const totalMs = durations.reduce((a, b) => a + b, 0);
  console.log(
    `[melotts] total: ${audio.length} bytes, ${totalMs}ms across ${texts.length} segments (${wavFormat ? "wav" : "mp3"})`,
  );
  return { audio, durations, contentType: wavFormat ? "audio/wav" : "audio/mpeg" };
}
