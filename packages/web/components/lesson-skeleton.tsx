"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * Phased status as the fake progress creeps up. Generation is opaque (no real
 * progress events), so we ease toward ~95% and cycle through plausible phases.
 */
const PHASES = [
  { until: 22, label: "Reading the docs" },
  { until: 52, label: "Writing code steps" },
  { until: 82, label: "Narrating the lesson" },
  { until: 100, label: "Finishing up" },
];

function GenerationProgress() {
  const [pct, setPct] = useState(6);

  useEffect(() => {
    // Ease toward 95% so the bar always feels alive but never "completes"
    // before the lesson actually opens (which unmounts this skeleton).
    const id = setInterval(() => {
      setPct((p) => (p >= 95 ? 95 : p + Math.max(0.4, (95 - p) * 0.045)));
    }, 240);
    return () => clearInterval(id);
  }, []);

  const label = PHASES.find((ph) => pct < ph.until)?.label ?? "Finishing up";

  const text = `${label}… ${Math.round(pct)}%`;

  return (
    <div className="flex items-center gap-2.5">
      <Sparkles className="h-4 w-4 shrink-0 text-primary" />
      <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-primary/12">
        {/* Filled portion (background + sweep) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden rounded-md bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-[shimmer-sweep_1.4s_ease-in-out_infinite] bg-white/25 blur-[6px]" />
        </div>
        {/* Base text — reads over the unfilled track */}
        <div className="absolute inset-0 flex items-center px-3">
          <span className="truncate font-mono text-xs font-medium text-primary">{text}</span>
        </div>
        {/* Same text in the on-primary color, clipped to the filled width */}
        <div
          className="absolute inset-0 flex items-center px-3 transition-[clip-path] duration-300 ease-out"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        >
          <span className="truncate font-mono text-xs font-medium text-primary-foreground">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton that mirrors the /learn lesson layout (left step list + right
 * canvas player). Shown while a lesson is being generated from a deep link
 * (the tutora.app/<docs-url> URL-hack), so the user sees the shape of what's
 * coming instead of the generator form.
 *
 * Surfaces use border + tinted fills (not bare `bg-muted`) so the panels stay
 * visible in light mode, where muted is near-white.
 */
export function LessonSkeleton({ error }: { error?: string }) {
  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <p className="max-w-md text-base font-medium">{error}</p>
        <a
          href="/teach"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create a lesson
        </a>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      {/* Top: live "generating" progress bar */}
      <div className="border-b border-border/40 px-4 py-2.5 sm:px-6">
        <div className="mx-auto max-w-xl">
          <GenerationProgress />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 w-full">
        {/* Left: step list skeleton */}
        <div className="hidden h-full w-[42%] flex-col border-r border-border/60 bg-muted/20 md:flex">
          {/* Header: language + theme pickers */}
          <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
            <Shimmer className="h-9 w-40 rounded-lg" />
            <Shimmer className="h-9 w-44 rounded-lg" />
          </div>
          <div className="flex-1 space-y-7 overflow-hidden px-4 py-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2.5">
                <Shimmer className="h-4 rounded" style={{ width: `${52 - i * 8}%` }} />
                <Shimmer className="h-3 w-[78%] rounded opacity-70" />
                <SkeletonCodeCard lines={4 + (i % 3)} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: canvas + player skeleton */}
        <div className="flex h-full flex-1 flex-col p-4 sm:p-6">
          <div className="flex flex-1 items-center justify-center">
            {/* Canvas background card */}
            <div className="relative flex aspect-[16/10] w-full max-w-3xl items-center justify-center rounded-2xl border border-border/60 bg-muted/30 p-[9%]">
              {/* Code window inside the canvas */}
              <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                <div className="flex items-center gap-1.5 border-b border-border/40 px-3.5 py-3">
                  <Dot />
                  <Dot />
                  <Dot />
                </div>
                <div className="flex-1 space-y-3 p-5">
                  {[68, 84, 55, 76, 40].map((w, i) => (
                    <Shimmer key={i} className="h-3 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Player bar skeleton */}
          <div className="mt-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <Shimmer className="h-10 w-10 shrink-0 rounded-full" />
              <Shimmer className="h-1.5 flex-1 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              {[0, 1, 2].map((i) => (
                <Shimmer key={i} className="h-6 w-6 rounded" />
              ))}
              <Shimmer className="ml-auto h-9 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCodeCard({ lines }: { lines: number }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-1.5 pb-1">
        <Dot />
        <Dot />
        <Dot />
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className="h-3 rounded"
          style={{ width: `${32 + ((i * 37) % 58)}%` }}
        />
      ))}
    </div>
  );
}

function Shimmer({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-pulse bg-foreground/10 dark:bg-foreground/15 ${className}`}
      style={style}
    />
  );
}

function Dot() {
  return <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />;
}
