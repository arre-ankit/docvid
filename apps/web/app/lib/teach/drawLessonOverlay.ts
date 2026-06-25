/**
 * Canvas drawing for the lesson intro card + karaoke caption.
 *
 * The editor renders these as DOM overlays for the live preview, but the video
 * export rasterises everything onto a canvas — so the same visuals have to be
 * drawn here too, otherwise the downloaded MP4 would have no intro and no
 * caption.  Keep the look in sync with `components/lesson-overlay.tsx` and
 * `components/lesson-caption.tsx`.
 */
import { hexBrightness } from "@/app/lib/magicMove/backgroundThemes";
import type { LessonSegment } from "@/app/lib/teach/types";

// Karaoke window — must match lesson-caption.tsx.
const WINDOW = 9;
const ACTIVE_OFFSET = 4;

function currentSegment(segments: LessonSegment[], t: number): LessonSegment | null {
  for (const s of segments) {
    if (t >= s.startMs && t < s.startMs + s.durationMs) return s;
  }
  return segments.length > 0 && t >= segments[segments.length - 1].startMs
    ? segments[segments.length - 1]
    : null;
}

function hexToRgba(hex: string, alpha: number): string | null {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((v) => Number.isNaN(v))) return null;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface LessonOverlayDrawOptions {
  segments: LessonSegment[];
  ms: number;
  title: string;
  /** Code card background colour (intro fill). */
  codeBg: string;
  /** Layout geometry in export-canvas pixels. */
  backgroundPadding: number;
  titleBarHeight: number;
  cardWidth: number;
  cardHeight: number;
  /** Base code font size, used to scale the overlay typography. */
  fontSize: number;
  /** Caption pill tint colour (selected caption theme), or null. */
  captionAccent?: string | null;
}

/**
 * Draws the intro card (while the intro narration plays) and the karaoke
 * caption (for every narrated segment) onto the export canvas, on top of the
 * already-rendered code frame.
 */
export function drawLessonExportOverlay(ctx: CanvasRenderingContext2D, opts: LessonOverlayDrawOptions) {
  const {
    segments,
    ms,
    title,
    codeBg,
    backgroundPadding: pad,
    titleBarHeight,
    cardWidth,
    cardHeight,
    fontSize,
    captionAccent,
  } = opts;

  const current = currentSegment(segments, ms);
  if (!current) return;

  const totalW = cardWidth + pad * 2;
  const totalH = cardHeight + pad * 2;
  const codeDark = hexBrightness(codeBg) < 140;

  ctx.save();

  // ---- Intro card (text instead of code) -------------------------------
  if (current.kind === "intro" && current.text) {
    const x = pad;
    const y = pad + titleBarHeight;
    const w = cardWidth;
    const h = cardHeight - titleBarHeight;

    // Cover the code content area with the card background colour.
    ctx.fillStyle = codeBg;
    ctx.fillRect(x, y, w, h);

    const cx = x + w / 2;
    const titleColor = codeDark ? "#ffffff" : "#18181b";
    const subColor = codeDark ? "rgba(255,255,255,0.72)" : "rgba(39,39,42,0.8)";
    const maxTextWidth = w * 0.78;

    // Measure the block so we can vertically centre it.
    const titleFont = Math.round(fontSize * 2.0);
    const hookFont = Math.round(fontSize * 1.05);
    const titleLineH = Math.round(titleFont * 1.15);
    const hookLineH = Math.round(hookFont * 1.5);

    ctx.font = `700 ${titleFont}px ${SANS}`;
    const titleLines = wrapText(ctx, title, maxTextWidth);
    ctx.font = `400 ${hookFont}px ${SANS}`;
    const hookLines = wrapText(ctx, current.text, maxTextWidth).slice(0, 5);

    const titleGap = Math.round(fontSize * 1.4);
    const blockH = titleLines.length * titleLineH + titleGap + hookLines.length * hookLineH;
    let cursorY = y + (h - blockH) / 2;

    // Title
    ctx.font = `700 ${titleFont}px ${SANS}`;
    ctx.fillStyle = titleColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (const line of titleLines) {
      ctx.fillText(line, cx, cursorY);
      cursorY += titleLineH;
    }
    cursorY += titleGap;

    // Hook
    ctx.font = `400 ${hookFont}px ${SANS}`;
    ctx.fillStyle = subColor;
    for (const line of hookLines) {
      ctx.fillText(line, cx, cursorY);
      cursorY += hookLineH;
    }
  }

  // ---- Karaoke caption -------------------------------------------------
  if (current.text) {
    const words = current.text.split(/\s+/).filter(Boolean);
    if (words.length > 0) {
      const progress =
        current.durationMs > 0
          ? Math.min(1, Math.max(0, (ms - current.startMs) / current.durationMs))
          : 1;
      const active = Math.min(words.length - 1, Math.floor(progress * words.length));
      const maxStart = Math.max(0, words.length - WINDOW);
      const start = Math.min(maxStart, Math.max(0, active - ACTIVE_OFFSET));
      const items = words.slice(start, start + WINDOW).map((word, i) => ({
        word,
        index: start + i,
        active: start + i === active,
        spoken: start + i < active,
      }));

      const capFont = Math.round(fontSize * 1.05);
      const gap = Math.round(capFont * 0.4);
      const pillH = Math.round(capFont * 2.1);
      const pillPadX = Math.round(capFont * 1.1);

      ctx.font = `600 ${capFont}px ${SANS}`;
      const wordWidths = items.map((it) => ctx.measureText(it.word).width);
      const contentW = wordWidths.reduce((a, b) => a + b, 0) + gap * (items.length - 1);
      const pillW = Math.min(cardWidth * 0.92, contentW + pillPadX * 2);

      const pillX = (totalW - pillW) / 2;
      const pillY = totalH - pad / 2 - pillH / 2;

      const accent = captionAccent ? hexToRgba(captionAccent, 0.82) : null;
      const capDark = captionAccent ? hexBrightness(captionAccent) < 150 : codeDark;
      roundedRect(ctx, pillX, pillY, pillW, pillH, pillH * 0.32);
      ctx.fillStyle = accent ?? (codeDark ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.7)");
      ctx.fill();

      // Draw words centred within the pill.
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      let tx = (totalW - contentW) / 2;
      const ty = pillY + pillH / 2;
      items.forEach((it, i) => {
        if (it.active) ctx.fillStyle = capDark ? "#ffffff" : "#18181b";
        else if (it.spoken) ctx.fillStyle = capDark ? "rgba(255,255,255,0.5)" : "rgba(24,24,27,0.5)";
        else ctx.fillStyle = capDark ? "rgba(255,255,255,0.32)" : "rgba(24,24,27,0.32)";
        ctx.fillText(it.word, tx, ty);
        tx += wordWidths[i] + gap;
      });
    }
  }

  ctx.restore();
}
