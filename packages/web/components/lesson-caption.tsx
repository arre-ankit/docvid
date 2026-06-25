"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { LessonSegment } from "@/app/lib/teach/types";
import { hexBrightness } from "@/app/lib/magicMove/backgroundThemes";
import { findSegment } from "./lesson-overlay";

/** Parse a #rgb/#rrggbb colour into an `rgba()` string at the given alpha. */
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

// How many words are visible at once, and where the active word sits in that
// window (kept a bit left-of-centre so upcoming words are readable).
const WINDOW = 9;
const ACTIVE_OFFSET = 4;

interface LessonCaptionProps {
  segments: LessonSegment[];
  playheadMs: number;
  /** Variant of the code frame the caption sits on, drives the text colour. */
  themeVariant: "light" | "dark";
  /** Selected background theme colour — tints the caption pill so it changes
   *  along with the background. Null when no theme is selected. */
  accentColor?: string | null;
}

/**
 * A karaoke-style caption that rides along the bottom of the code frame.  A
 * small window of words is always visible (dimmed); the word currently being
 * narrated lights up, and the window scrolls so the active word stays put —
 * so the line reads like spoken subtitles rather than words popping in.
 */
export function LessonCaption({ segments, playheadMs, themeVariant, accentColor }: LessonCaptionProps) {
  const current = useMemo(() => findSegment(segments, playheadMs), [segments, playheadMs]);

  const view = useMemo(() => {
    if (!current || !current.text) return null;
    const words = current.text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return null;

    const progress =
      current.durationMs > 0
        ? Math.min(1, Math.max(0, (playheadMs - current.startMs) / current.durationMs))
        : 1;

    // Index of the word currently being spoken.
    const active = Math.min(words.length - 1, Math.floor(progress * words.length));
    // Scroll the window so the active word holds a steady position.
    const maxStart = Math.max(0, words.length - WINDOW);
    const start = Math.min(maxStart, Math.max(0, active - ACTIVE_OFFSET));

    return {
      items: words.slice(start, start + WINDOW).map((word, i) => ({
        word,
        index: start + i,
        active: start + i === active,
        spoken: start + i < active,
      })),
    };
  }, [current, playheadMs]);

  if (!view) return null;

  // When a background theme is selected, tint the pill with its colour (and
  // pick text contrast from that colour); otherwise fall back to the frame's
  // light/dark variant.
  const tint = accentColor ? hexToRgba(accentColor, 0.82) : null;
  const dark = accentColor ? hexBrightness(accentColor) < 150 : themeVariant === "dark";

  return (
    <div
      className={cn(
        "pointer-events-none flex h-10 w-fit max-w-[calc(100%-2rem)] items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl px-5 ring-1 backdrop-blur-md",
        tint
          ? dark
            ? "ring-white/15"
            : "ring-black/15"
          : dark
            ? "bg-black/35 ring-white/10"
            : "bg-white/55 ring-black/10",
      )}
      style={tint ? { backgroundColor: tint } : undefined}
    >
      {view.items.map(({ word, index, active, spoken }) => (
        <span
          key={index}
          className={cn(
            "text-base font-semibold leading-snug transition-colors duration-200 sm:text-lg",
            active
              ? dark
                ? "text-white"
                : "text-zinc-900"
              : spoken
                ? dark
                  ? "text-white/45"
                  : "text-zinc-900/45"
                : dark
                  ? "text-white/30"
                  : "text-zinc-900/30",
          )}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
