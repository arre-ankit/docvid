"use client";

import { useEffect, useState } from "react";
import { Play, Download, Check, Sparkles, Link2, MousePointer2 } from "lucide-react";
import { GitHubIcon, TwitterIcon } from "./ui/icons";

const GREEN = "#007A55";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Export card with a cursor parked on the Export button: it clicks on a loop,
 * the button briefly flips to "Exported ✓", then resets.
 */
export function ExportDemo() {
  const [pressed, setPressed] = useState(false);
  const [done, setDone] = useState(false);
  const [atBtn, setAtBtn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      while (!cancelled) {
        setPressed(false);
        setDone(false);
        setAtBtn(false);
        await sleep(800);
        if (cancelled) return;

        // glide the cursor over to the Export button
        setAtBtn(true);
        await sleep(800);
        if (cancelled) return;

        // click
        setPressed(true);
        await sleep(220);
        if (cancelled) return;
        setPressed(false);
        setDone(true);

        await sleep(1800);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-sm rounded-2xl border border-border/60 bg-card p-4 shadow-lg">
      {/* video thumbnail */}
      <div className="relative overflow-hidden rounded-xl border border-border/60">
        <div
          className="grid h-28 place-items-center"
          style={{ backgroundColor: "#E8862B" }}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/90 shadow-md">
            <Play className="h-5 w-5 fill-neutral-900 text-neutral-900" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          1:44
        </span>
      </div>

      {/* file row + export */}
      <div className="mt-4 flex items-center gap-3">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: "rgba(0,122,85,0.12)" }}
        >
          <Sparkles className="h-5 w-5" style={{ color: GREEN }} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            react-hooks-lesson.mp4
          </p>
        </div>
        <button
          className={`ml-auto flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-transform duration-150 ${
            pressed ? "scale-95 brightness-110" : "scale-100"
          }`}
          style={{ backgroundColor: GREEN }}
        >
          {done ? (
            <>
              <Check className="h-4 w-4" /> Exported
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Export
            </>
          )}
        </button>
      </div>

      {/* share row */}
      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4">
        <span className="text-xs text-muted-foreground">Share:</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-foreground/70">
          <TwitterIcon className="h-4 w-4" />
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-foreground/70">
          <GitHubIcon className="h-4 w-4" />
        </span>
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-foreground/70">
          <Link2 className="h-4 w-4" />
        </span>
      </div>

      {/* fake cursor — glides in to the Export button, then clicks */}
      <MousePointer2
        aria-hidden="true"
        className={`pointer-events-none absolute z-20 h-5 w-5 fill-white text-neutral-800 drop-shadow-md transition-all duration-[750ms] ease-in-out ${
          pressed ? "scale-90" : ""
        }`}
        style={{
          left: atBtn ? "82%" : "45%",
          top: atBtn ? "60%" : "118%",
        }}
      />
    </div>
  );
}
