"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, FileText, Play, ArrowRight } from "lucide-react";
import {
  siReact,
  siNextdotjs,
  siTypescript,
  siJavascript,
  siPython,
  siGo,
  siRust,
  siNodedotjs,
  siTailwindcss,
  siGraphql,
  siVuedotjs,
  siSvelte,
  siDocker,
  siPostgresql,
  type SimpleIcon,
} from "simple-icons";

// Brand palette — lime is the accent, deep green is the secondary.
const LIME = "#CBFF2E";
const GREEN = "#007A55";

// Docs links the input typewriter cycles through.
const SAMPLE_DOCS = [
  "https://react.dev/learn/add-react-to-an-existing-project",
  "https://nextjs.org/docs/app/api-reference/cli/create-next-app",
  "https://docs.python.org/3/tutorial/classes.html",
  "https://tailwindcss.com/docs/installation/using-vite",
];

/**
 * Hero: one big centered statement with inline icon "pills", above an
 * uploadThing-style card — assorted doc file-types bursting out of the top,
 * and a "paste your docs link" input where the video button would be.
 */
export function Hero() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 max-w-6xl">
      {/* ---------- Centered headline with icon pills ---------- */}
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
          <span className="text-foreground">Stop</span>
          <span className="text-muted-foreground/40">reading</span>
          <Pill
            icon={<FileText className="h-[0.85em] w-[0.85em]" strokeWidth={2.5} />}
            label="docs"
            tone="blue"
          />
          <span className="text-foreground">start</span>
          <span className="text-muted-foreground/40">watching</span>
          <Pill
            icon={<Play className="h-[0.8em] w-[0.8em] fill-current" />}
            label="video"
            tone="lime"
          />
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-muted-foreground">
          Paste any documentation link and let AI turn it into a guided coding
          lesson in minutes, not hours.
        </p>
      </div>

      {/* ---------- Doc-burst card with the link input ---------- */}
      <div className="mt-20 sm:mt-24 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-backwards">
        <DocsCard />
      </div>
    </section>
  );
}

/* Rounded icon-pill used inline within the headline. */
function Pill({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  tone: "blue" | "lime";
}) {
  // Brand lime is only legible on dark backgrounds, so light mode falls back to
  // a deeper lime/green; dark mode keeps the bright brand accent.
  const cls =
    tone === "blue"
      ? "bg-blue-500/10 ring-blue-500/30 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
      : "bg-lime-400/25 ring-lime-600/30 text-lime-700 dark:bg-[#CBFF2E]/14 dark:ring-[#CBFF2E]/40 dark:text-[#CBFF2E]";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-1 align-middle shadow-sm ring-1 ${cls}`}
    >
      {icon}
      <span className="font-extrabold">{label}</span>
    </span>
  );
}

/* Tech-stack logos that burst out of the top of the card (image #6 style). */
const LOGOS: SimpleIcon[] = [
  siReact,
  siTypescript,
  siJavascript,
  siTailwindcss,
  siGraphql,
  siNodedotjs,
  siPython,
  siGo,
  siRust,
  siVuedotjs,
  siSvelte,
  siNextdotjs,
  siDocker,
  siPostgresql,
];

/* White rounded tile holding a single brand glyph in its own colour. */
function LogoTile({ icon, i, n }: { icon: SimpleIcon; i: number; n: number }) {
  // Distance from the centre, normalised to 0 (middle) … 1 (outermost).
  const center = (n - 1) / 2;
  const dir = Math.sign(i - center); // -1 left, +1 right
  const norm = Math.abs(i - center) / center;

  // Gentle arc through the middle, then a steep staircase drop at the ends so
  // the outer tiles look like they're spilling off toward the pile below.
  const rotate = dir * norm ** 1.4 * 26; // up to ±26° at the edges
  const dip = norm ** 2.6 * 110; // ~flat in the middle, big drop at the ends
  const opacity = 1 - norm ** 2 * 0.45; // edges fade as they fall away
  const scale = 1 - norm * 0.08;

  // The two outermost tiles on each side teeter, about to drop.
  const isEdge = norm > 0.66;

  return (
    <span
      className="block shrink-0"
      style={{
        transform: `translateY(${dip}px) rotate(${rotate}deg) scale(${scale})`,
        opacity,
      }}
    >
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-xl ring-1 ring-black/5 sm:h-16 sm:w-16 ${
          isEdge ? "animate-hero-tile-drop" : ""
        }`}
        style={isEdge ? { animationDelay: `${norm * 0.6}s` } : undefined}
      >
        <svg
          role="img"
          viewBox="0 0 24 24"
          aria-label={icon.title}
          className="h-6 w-6 sm:h-8 sm:w-8"
          fill={`#${icon.hex}`}
        >
          <path d={icon.path} />
        </svg>
      </span>
    </span>
  );
}

/* Documentation links the quick-pick chips drop into the input. */
const EXAMPLES = [
  { label: "react.dev", url: "https://react.dev/learn/add-react-to-an-existing-project" },
  {
    label: "nextjs.org",
    url: "https://nextjs.org/docs/app/api-reference/cli/create-next-app",
  },
  {
    label: "tailwindcss",
    url: "https://tailwindcss.com/docs/installation/using-vite",
  },
];

/* uploadThing-style card: docs spilling out the top, link input in the body. */
function DocsCard() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const placeholder = useTypewriter(SAMPLE_DOCS, focused || value.length > 0);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const target = value.trim() || placeholder;
    if (!target) return;
    router.push(`/teach?url=${encodeURIComponent(target)}`);
  }

  return (
    <div className="relative isolate mx-auto max-w-3xl">
      {/* ambient glow behind the card */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-8 -bottom-10 -top-16 -z-10 opacity-70 blur-3xl"
        style={{
          background: `radial-gradient(50% 60% at 50% 0%, ${LIME}33, transparent 70%), radial-gradient(60% 60% at 50% 100%, ${GREEN}33, transparent 70%)`,
        }}
      />

      {/* tech-stack logos bursting out the top edge */}
      <div className="pointer-events-none absolute inset-x-1 -top-9 z-0 flex items-end justify-center gap-1.5 sm:-top-12 sm:gap-2.5">
        {LOGOS.map((icon, i) => (
          <LogoTile key={icon.title} icon={icon} i={i} n={LOGOS.length} />
        ))}
      </div>

      {/* the card — green → lime gradient across the whole surface */}
      <div
        className="relative z-10 overflow-hidden rounded-[2rem] border border-white/20 shadow-2xl"
        style={{ background: `linear-gradient(120deg, ${GREEN}, ${LIME})` }}
      >
        {/* diagonal sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.30) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.18) 100%)",
          }}
        />
        {/* dotted texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {/* oversized doc watermark */}
        <FileText
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -right-8 h-56 w-56 text-white/15"
        />

        {/* body */}
        <div className="relative px-6 pt-10 pb-10 text-center sm:px-10 sm:pt-12 sm:pb-12">
          {/* white doc icon tile */}
          <div className="relative mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5 sm:h-[68px] sm:w-[68px]">
            <FileText className="h-8 w-8" style={{ color: GREEN }} />
          </div>

          <h3 className="font-serif text-2xl font-medium leading-tight tracking-tight text-[#06281c] sm:text-4xl">
            Paste your documentation link
          </h3>
          <p className="mt-4 text-base text-[#06281c]/75 sm:text-lg">
            We&apos;ll read the whole thing and build a video lesson around it.
          </p>

          {/* input */}
          <form
            onSubmit={submit}
            className="group mt-6 flex items-stretch gap-2 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/5 transition-all focus-within:ring-2 focus-within:ring-[#06281c]/30"
          >
            <span className="flex items-center pl-2.5 text-neutral-400">
              <Link2 className="h-5 w-5" />
            </span>
            <input
              type="text"
              inputMode="url"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              aria-label="Paste a documentation URL"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none sm:text-base"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03] active:scale-95"
              style={{ background: `linear-gradient(120deg, ${GREEN}, #0a9e6e)` }}
            >
              Generate
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* quick-pick chips */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                onClick={() => setValue(ex.url)}
                className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-[#06281c] ring-1 ring-black/5 transition-colors hover:bg-white"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Types a string out char-by-char, pauses, deletes, advances to the next.
 * Pauses entirely while `paused` is true (input focused or has content).
 */
function useTypewriter(items: string[], paused: boolean) {
  const [text, setText] = useState(items[0] ?? "");
  const idx = useRef(0);
  const phase = useRef<"typing" | "holding" | "deleting">("holding");

  useEffect(() => {
    if (paused) return;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const full = items[idx.current] ?? "";
      const cur = text;

      if (phase.current === "typing") {
        if (cur.length < full.length) {
          setText(full.slice(0, cur.length + 1));
          timer = setTimeout(step, 45);
        } else {
          phase.current = "holding";
          timer = setTimeout(step, 1600);
        }
      } else if (phase.current === "deleting") {
        if (cur.length > 0) {
          setText(cur.slice(0, -1));
          timer = setTimeout(step, 22);
        } else {
          idx.current = (idx.current + 1) % items.length;
          phase.current = "typing";
          timer = setTimeout(step, 120);
        }
      } else {
        phase.current = cur.length >= full.length ? "deleting" : "typing";
        timer = setTimeout(step, 200);
      }
    };

    timer = setTimeout(step, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, paused]);

  return text;
}
