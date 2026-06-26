"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Check, AudioLines, MousePointer2 } from "lucide-react";

const GREEN = "#007A55";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Voice = {
  name: string;
  tag: string;
  badge: "f" | "m";
  grad: string;
};

const VOICES: Voice[] = [
  { name: "Olivia", tag: "Calm & clear", badge: "f", grad: "linear-gradient(135deg,#CBFF2E,#007A55)" },
  { name: "Sarah", tag: "Warm narrator", badge: "f", grad: "linear-gradient(135deg,#34d399,#0ea5e9)" },
  { name: "Ethan", tag: "Confident", badge: "m", grad: "linear-gradient(135deg,#f59e0b,#ef4444)" },
  { name: "Priya", tag: "Friendly", badge: "f", grad: "linear-gradient(135deg,#a78bfa,#ec4899)" },
  { name: "Mark", tag: "Deep & steady", badge: "m", grad: "linear-gradient(135deg,#22d3ee,#3b82f6)" },
];

// y-offsets (px) the cursor targets, tuned to the layout below.
const TRIGGER_Y = 56;
const LIST_TOP = 92;
const ITEM_H = 46;
const PICKS = [2, 4, 1, 3, 0];

/**
 * Animated voice picker: the cursor opens the dropdown, glides down to a voice
 * and selects it — cycling through choices on a loop.
 */
export function VoiceDemo() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [pressed, setPressed] = useState(false);
  const [cursor, setCursor] = useState<{ left: string; top: string }>({
    left: "50%",
    top: "300px",
  });

  useEffect(() => {
    let cancelled = false;
    let k = 0;

    const itemY = (i: number) => `${LIST_TOP + i * ITEM_H + ITEM_H / 2}px`;

    async function run() {
      while (!cancelled) {
        // reset — cursor waits below the control
        setOpen(false);
        setHover(null);
        setPressed(false);
        setCursor({ left: "50%", top: "300px" });
        await sleep(700);
        if (cancelled) return;

        // glide to the trigger and click to open
        setCursor({ left: "88%", top: `${TRIGGER_Y}px` });
        await sleep(750);
        if (cancelled) return;
        setPressed(true);
        await sleep(200);
        setPressed(false);
        setOpen(true);
        await sleep(350);
        if (cancelled) return;

        // glide down to the target voice
        const target = PICKS[k % PICKS.length];
        setHover(target);
        setCursor({ left: "50%", top: itemY(target) });
        await sleep(750);
        if (cancelled) return;

        // click to select, then close
        setPressed(true);
        await sleep(200);
        setPressed(false);
        setSelected(target);
        setHover(null);
        setOpen(false);
        k++;
        await sleep(1400);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const current = VOICES[selected];

  return (
    <div className="relative mx-auto h-[330px] max-w-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Narration voice
      </p>

      {/* trigger */}
      <div
        className={`flex items-center gap-3 rounded-2xl border-2 bg-card px-3 py-2.5 shadow-md transition-colors ${
          open ? "border-[color:var(--g)]" : "border-border/70"
        }`}
        style={{ ["--g" as string]: GREEN }}
      >
        <Avatar voice={current} />
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-foreground">
            {current.name}{" "}
            <span className="font-normal text-muted-foreground">
              ({current.badge})
            </span>
          </p>
          <p className="truncate text-xs text-muted-foreground">{current.tag}</p>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* dropdown */}
      <div
        className={`mt-2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl transition-all duration-300 ease-out ${
          open ? "max-h-72 opacity-100" : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <ul className="p-1.5">
          {VOICES.map((v, i) => {
            const isSel = i === selected;
            const isHover = i === hover;
            return (
              <li key={v.name}>
                <div
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors"
                  style={
                    isHover || isSel
                      ? { backgroundColor: "rgba(0,122,85,0.10)" }
                      : undefined
                  }
                >
                  <Avatar voice={v} small />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {v.name}{" "}
                      <span className="text-muted-foreground">({v.badge})</span>
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {v.tag}
                    </p>
                  </div>
                  {isSel ? (
                    <Check className="h-4 w-4" style={{ color: GREEN }} />
                  ) : (
                    <AudioLines className="h-4 w-4 text-muted-foreground/60" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* fake cursor */}
      <MousePointer2
        aria-hidden="true"
        className={`pointer-events-none absolute z-20 h-5 w-5 fill-white text-neutral-800 drop-shadow-md transition-all duration-[750ms] ease-in-out ${
          pressed ? "scale-90" : ""
        }`}
        style={cursor}
      />
    </div>
  );
}

function Avatar({ voice, small }: { voice: Voice; small?: boolean }) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${
        small ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
      }`}
      style={{ background: voice.grad }}
    >
      {voice.name[0]}
    </span>
  );
}
