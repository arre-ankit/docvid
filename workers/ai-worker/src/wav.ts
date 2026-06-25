// WAV utilities: merge multiple PCM WAV files into one playable track and
// measure WAV duration. Extracted from the old Sarvam client — these are used by
// both TTS backends (Inworld TTS 2 and MeloTTS) to stitch per-segment audio.

/** Locate a named subchunk ("fmt ", "data") in a WAV buffer; returns {offset,size} of its body. */
function findSubchunk(view: DataView, id: string): { offset: number; size: number } | null {
  // Skip RIFF header (12 bytes), then walk subchunks.
  let pos = 12;
  while (pos + 8 <= view.byteLength) {
    const chunkId = String.fromCharCode(
      view.getUint8(pos),
      view.getUint8(pos + 1),
      view.getUint8(pos + 2),
      view.getUint8(pos + 3),
    );
    const size = view.getUint32(pos + 4, true);
    if (chunkId === id) return { offset: pos + 8, size };
    pos += 8 + size + (size % 2); // chunks are word-aligned
  }
  return null;
}

/**
 * Merge multiple WAV files into a single playable WAV by concatenating PCM data
 * and rebuilding one canonical 44-byte header from the first file's format.
 */
export function mergeWavFiles(files: Uint8Array[]): Uint8Array {
  const usable = files.filter((f) => f.byteLength > 44);
  if (usable.length === 0) return new Uint8Array(0);
  if (usable.length === 1) return usable[0]!;

  const first = new DataView(usable[0]!.buffer, usable[0]!.byteOffset, usable[0]!.byteLength);
  const fmt = findSubchunk(first, "fmt ");
  if (!fmt) return usable[0]!; // not parseable; return first as-is

  const audioFormat = first.getUint16(fmt.offset, true);
  const numChannels = first.getUint16(fmt.offset + 2, true);
  const sampleRate = first.getUint32(fmt.offset + 4, true);
  const bitsPerSample = first.getUint16(fmt.offset + 14, true);

  // Collect every file's data chunk.
  const dataParts: Uint8Array[] = [];
  for (const f of usable) {
    const view = new DataView(f.buffer, f.byteOffset, f.byteLength);
    const data = findSubchunk(view, "data");
    if (data) dataParts.push(f.subarray(data.offset, data.offset + data.size));
  }
  const totalData = dataParts.reduce((sum, p) => sum + p.byteLength, 0);

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const out = new Uint8Array(44 + totalData);
  const dv = new DataView(out.buffer);

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(offset + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  dv.setUint32(4, 36 + totalData, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, audioFormat, true);
  dv.setUint16(22, numChannels, true);
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, byteRate, true);
  dv.setUint16(32, blockAlign, true);
  dv.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  dv.setUint32(40, totalData, true);

  let offset = 44;
  for (const part of dataParts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

/** Duration of a PCM WAV in milliseconds, derived from its fmt + data chunks. */
export function wavDurationMs(wav: Uint8Array): number {
  if (wav.byteLength <= 44) return 0;
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
  const fmt = findSubchunk(view, "fmt ");
  const data = findSubchunk(view, "data");
  if (!fmt || !data) return 0;
  const numChannels = view.getUint16(fmt.offset + 2, true);
  const sampleRate = view.getUint32(fmt.offset + 4, true);
  const bitsPerSample = view.getUint16(fmt.offset + 14, true);
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  if (byteRate <= 0) return 0;
  return Math.round((data.size / byteRate) * 1000);
}
