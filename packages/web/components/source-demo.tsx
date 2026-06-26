"use client";

import { useEffect, useState } from "react";
import { Link2, MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";

const GREEN = "#007A55";
const FULL = "https://react.dev/learn";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Animated "paste a docs link" demo: the URL types itself in fast, then a fake
 * cursor glides over to the Generate button and clicks it — on a loop.
 */
export function SourceDemo() {
  const [text, setText] = useState("");
  const [atButton, setAtButton] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      while (!cancelled) {
        // reset — cursor waits at the bottom
        setText("");
        setAtButton(false);
        setPressed(false);
        await sleep(700);
        if (cancelled) return;

        // type the link fast — and start gliding the cursor up right away
        for (let i = 1; i <= FULL.length; i++) {
          if (cancelled) return;
          setText(FULL.slice(0, i));
          if (i === 2) setAtButton(true); // begin moving up as soon as writing starts
          await sleep(55);
        }
        await sleep(250);
        if (cancelled) return;

        // click
        setPressed(true);
        await sleep(220);
        if (cancelled) return;
        setPressed(false);

        await sleep(1500);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative mx-auto max-w-md pb-10">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-border/70 bg-card px-4 py-3.5 shadow-lg">
        <Link2 className="h-5 w-5 shrink-0" style={{ color: GREEN }} />
        <span className="flex min-w-0 flex-1 justify-end overflow-hidden">
          <span className="whitespace-nowrap font-mono text-sm text-foreground">
            {text}
            <span
              className="animate-caret ml-0.5 inline-block h-4 w-0.5 -mb-0.5 align-middle"
              style={{ backgroundColor: GREEN }}
            />
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-transform duration-150",
            pressed ? "scale-95 brightness-110" : "scale-100",
          )}
          style={{ backgroundColor: GREEN }}
        >
          Generate
        </span>
      </div>

      {/* fake cursor */}
      <MousePointer2
        aria-hidden="true"
        className="pointer-events-none absolute z-20 h-5 w-5 fill-white text-neutral-800 drop-shadow-md transition-all duration-[750ms] ease-in-out"
        style={{
          left: atButton ? "84%" : "30%",
          top: atButton ? "52%" : "118%",
        }}
      />
    </div>
  );
}
