import { describe, expect, test } from "bun:test";
import { mergeWavFiles, wavDurationMs } from "./wav";

// Build a minimal 16-bit mono WAV with `dataBytes` bytes of data.
function makeWav(dataBytes: number, sampleRate = 22050): Uint8Array {
  const out = new Uint8Array(44 + dataBytes);
  const dv = new DataView(out.buffer);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF");
  dv.setUint32(4, 36 + dataBytes, true);
  w(8, "WAVE");
  w(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, 1, true); // mono
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate * 2, true);
  dv.setUint16(32, 2, true);
  dv.setUint16(34, 16, true);
  w(36, "data");
  dv.setUint32(40, dataBytes, true);
  for (let i = 0; i < dataBytes; i++) out[44 + i] = i % 256;
  return out;
}

describe("mergeWavFiles", () => {
  test("returns the single file unchanged", () => {
    const a = makeWav(100);
    expect(mergeWavFiles([a])).toBe(a);
  });

  test("concatenates PCM data and rewrites the header", () => {
    const a = makeWav(100);
    const b = makeWav(60);
    const merged = mergeWavFiles([a, b]);
    const dv = new DataView(merged.buffer);

    // 44-byte header + 160 bytes of combined data
    expect(merged.byteLength).toBe(44 + 160);
    expect(dv.getUint32(40, true)).toBe(160); // data chunk size
    expect(dv.getUint32(4, true)).toBe(36 + 160); // RIFF size
    expect(String.fromCharCode(merged[0]!, merged[1]!, merged[2]!, merged[3]!)).toBe("RIFF");
  });

  test("skips empty/garbage buffers", () => {
    const a = makeWav(40);
    const merged = mergeWavFiles([new Uint8Array(10), a]);
    expect(merged.byteLength).toBe(a.byteLength);
  });
});

describe("wavDurationMs", () => {
  test("computes ms from data size and byte rate", () => {
    // 22050 Hz, mono, 16-bit -> 44100 bytes/sec. 44100 data bytes = 1000ms.
    expect(wavDurationMs(makeWav(44100, 22050))).toBe(1000);
    expect(wavDurationMs(makeWav(22050, 22050))).toBe(500);
  });

  test("returns 0 for a header-only / tiny buffer", () => {
    expect(wavDurationMs(new Uint8Array(20))).toBe(0);
  });
});
