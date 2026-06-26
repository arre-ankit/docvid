"use client";

import { useMemo } from "react";
import type { LessonSegment } from "@/app/lib/teach/types";
import { hexBrightness } from "@/app/lib/magicMove/backgroundThemes";
import { cn } from "@/lib/utils";

interface LessonOverlayProps {
  title: string;
  segments: LessonSegment[];
  playheadMs: number;
  themeVariant: "light" | "dark";
  /** Background colour of the code card, so the intro matches the editor. */
  codeBg?: string | null;
  /** Background padding (px) around the card, mirrors the canvas frame. */
  backgroundPadding: number;
  /** Height (px) of the window title bar, so text starts below it. */
  titleBarHeight: number;
}

export function findSegment(segments: LessonSegment[], t: number): LessonSegment | null {
  for (const s of segments) {
    if (t >= s.startMs && t < s.startMs + s.durationMs) return s;
  }
  return segments.length > 0 && t >= segments[segments.length - 1].startMs
    ? segments[segments.length - 1]
    : null;
}

/**
 * Intro "title card" shown while the intro narration plays.  Rather than
 * covering the whole preview with its own panel, it sits *inside* the code
 * window — the canvas keeps drawing the themed background padding, the rounded
 * card and the macOS title bar, and this overlay only replaces the code
 * content area with the lesson hook text.  The result is the same window the
 * rest of the lesson uses, just with text instead of code.
 */
export function LessonOverlay({
  title,
  segments,
  playheadMs,
  themeVariant,
  codeBg,
  backgroundPadding,
  titleBarHeight,
}: LessonOverlayProps) {
  const current = useMemo(() => findSegment(segments, playheadMs), [segments, playheadMs]);
  const intro = segments.find((s) => s.kind === "intro") ?? null;
  const introActive = !!current && current.kind === "intro";

  if (!intro) return null;

  const titleSize =
    title.length > 55 ? "text-lg sm:text-xl" : title.length > 35 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";

  // Match the editor's code panel colour; fall back to the theme variant.
  const fill = codeBg ?? (themeVariant === "dark" ? "#0d1117" : "#ffffff");
  const dark = codeBg ? hexBrightness(codeBg) < 140 : themeVariant === "dark";

  // The code content region sits inside the background padding and below the
  // title bar.  These coordinates map 1:1 to the displayed canvas.
  const pad = Math.max(0, backgroundPadding);
  const radius = pad > 0 ? 16 : 0;

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-30 flex flex-col items-center justify-center overflow-hidden px-8 py-6 text-center transition-opacity duration-500",
        introActive ? "opacity-100" : "opacity-0",
      )}
      style={{
        top: pad + titleBarHeight,
        left: pad,
        right: pad,
        bottom: pad,
        background: fill,
        borderBottomLeftRadius: radius,
        borderBottomRightRadius: radius,
      }}
    >
      {/* Soft glow so the hook feels like an intro, not a blank editor. */}
      <div
        className={cn(
          "absolute inset-0",
          dark
            ? "bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(99,102,241,0.18),transparent_60%)]"
            : "bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(99,102,241,0.10),transparent_60%)]",
        )}
      />

      <div className="relative z-10 flex max-h-full w-full max-w-xl flex-col gap-2 overflow-hidden">
        <h1
          className={cn(
            "shrink-0 font-bold leading-snug tracking-tight text-balance",
            titleSize,
            dark ? "text-white" : "text-zinc-900",
          )}
        >
          {title}
        </h1>
        {intro.text && (
          <p
            className={cn(
              "min-h-0 text-xs sm:text-sm leading-relaxed line-clamp-3 text-balance",
              dark ? "text-white/70" : "text-zinc-600",
            )}
          >
            {intro.text}
          </p>
        )}
      </div>
    </div>
  );
}
