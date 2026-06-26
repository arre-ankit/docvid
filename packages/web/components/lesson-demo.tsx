"use client";

import { useEffect, useState } from "react";
import { Play, Pause, MousePointer2 } from "lucide-react";

const GREEN = "#007A55";
const TOTAL = 104; // 1:44 in seconds
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Animated lesson player: a fake cursor glides to the play button and clicks
 * it, then the video "plays" — progress fills and the timer counts up. Loops.
 */
export function LessonDemo() {
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [atPlay, setAtPlay] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      while (!cancelled) {
        // reset — paused at 0:00, cursor waits below the player
        setSeconds(0);
        setPlaying(false);
        setPressed(false);
        setAtPlay(false);
        await sleep(700);
        if (cancelled) return;

        // glide the cursor over to the play button
        setAtPlay(true);
        await sleep(800);
        if (cancelled) return;

        // click play
        setPressed(true);
        await sleep(220);
        if (cancelled) return;
        setPressed(false);
        setPlaying(true);

        // advance the timer / progress
        for (let s = 0; s <= 64 && !cancelled; s += 2) {
          setSeconds(s);
          await sleep(110);
        }
        if (cancelled) return;

        await sleep(900);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const pct = Math.min(100, (seconds / TOTAL) * 100);

  return (
    <div className="relative mx-auto max-w-md">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg">
        {/* titlebar */}
        <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          <span className="ml-2 text-[11px] text-muted-foreground">
            creating-react-app.mp4 · DocVid
          </span>
        </div>

        {/* split: code + preview */}
        <div className="grid grid-cols-2">
          {/* code panel */}
          <div className="bg-[#0c1108] p-3 font-mono text-[10px] leading-[1.6] text-white/80">
            <div className="text-white/35">// App.jsx</div>
            <div
              className="-mx-1 rounded px-1"
              style={{ backgroundColor: "rgba(203,255,46,0.16)" }}
            >
              <span className="text-purple-400">import</span> {"{ useState }"}{" "}
              <span className="text-purple-400">from</span>{" "}
              <span className="text-emerald-400">&quot;react&quot;</span>;
            </div>
            <div>
              <span className="text-purple-400">export default function</span>{" "}
              <span className="text-sky-400">App</span>() {"{"}
            </div>
            <div className="pl-3">
              <span className="text-purple-400">const</span> [count, setCount] ={" "}
              <span className="text-sky-400">useState</span>(0);
            </div>
            <div>{"}"}</div>
          </div>

          {/* video preview */}
          <div
            className="relative grid place-items-center p-3"
            style={{ backgroundColor: "#E8862B" }}
          >
            <div className="rounded-lg bg-white px-3 py-4 text-center shadow-md">
              <p className="text-[11px] font-extrabold leading-tight text-neutral-900">
                Creating a
                <br />
                React App
              </p>
            </div>
            <div className="absolute inset-x-2 bottom-2 rounded-md bg-white/90 px-2 py-1 text-center text-[8px] font-semibold text-neutral-700">
              <span
                className="rounded px-1 text-neutral-900"
                style={{ backgroundColor: "rgba(232,134,43,0.3)" }}
              >
                In
              </span>{" "}
              this tutorial, we&apos;ll be…
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span
            className={`grid h-7 w-7 place-items-center rounded-full text-white transition-transform duration-150 ${
              pressed ? "scale-90 brightness-110" : "scale-100"
            }`}
            style={{ backgroundColor: GREEN }}
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
          </span>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {fmt(seconds)}
          </span>
          <div className="h-1 flex-1 rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-100 ease-linear"
              style={{ width: `${pct}%`, backgroundColor: GREEN }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            1:44
          </span>
        </div>
      </div>

      {/* fake cursor — glides in to the play button, then clicks */}
      <MousePointer2
        aria-hidden="true"
        className={`pointer-events-none absolute z-20 h-5 w-5 fill-white text-neutral-800 drop-shadow-md transition-all duration-[750ms] ease-in-out ${
          pressed ? "scale-90" : ""
        }`}
        style={{
          left: atPlay ? "10%" : "50%",
          top: atPlay ? "90%" : "118%",
        }}
      />
    </div>
  );
}
