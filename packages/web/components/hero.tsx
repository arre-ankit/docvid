"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, FileText, Play, ArrowUp, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LESSON_VOICES as VOICES, DEFAULT_VOICE } from "@/app/lib/teach/voices";
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

// The single box handles both free-text prompts and pasted docs URLs.
const looksLikeUrl = (s: string) =>
  /^https?:\/\//i.test(s) || (/^[^\s]+\.[^\s]{2,}/.test(s) && !/\s/.test(s));

const PROMPT_EXAMPLES = [
  "Explain useEffect cleanup",
  "How to debounce in JavaScript",
  "Refactor a callback into async/await",
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

/* Doc-burst hero: logos spill over a dark chat box that kicks off generation. */
function DocsCard() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canGenerate = !!value.trim();

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    const q = looksLikeUrl(v)
      ? `url=${encodeURIComponent(v)}`
      : `prompt=${encodeURIComponent(v)}`;
    router.push(`/teach?${q}&voice=${encodeURIComponent(voice)}`);
  };

  const fillInput = (text: string) => {
    setValue(text);
    inputRef.current?.focus();
  };

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

      {/* dark chat-style box */}
      <div className="relative z-10 rounded-3xl border border-white/10 bg-[#1b1b1e] p-2.5 shadow-2xl">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={3}
          placeholder="Describe what you want to learn, or paste a docs link…"
          aria-label="Describe a lesson or paste a docs link"
          className="min-h-24 w-full resize-none bg-transparent px-3 pt-3 text-base text-white placeholder:text-white/40 focus:outline-none"
        />

        <div className="mt-1.5 flex items-center gap-1 px-1.5 pb-0.5">
          {/* voice */}
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger className="h-9 w-auto gap-1.5 rounded-lg border-0 bg-transparent px-2.5 text-xs text-white/70 hover:bg-white/10 hover:text-white focus:ring-0 focus:ring-offset-0">
              <AudioLines className="h-4 w-4 opacity-80" />
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* generate */}
          <button
            type="button"
            onClick={submit}
            disabled={!canGenerate}
            aria-label="Generate lesson"
            className={cn(
              "ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full transition",
              canGenerate
                ? "text-white shadow-md hover:brightness-110"
                : "cursor-not-allowed bg-white/10 text-white/40",
            )}
            style={
              canGenerate
                ? { background: `linear-gradient(120deg, ${GREEN}, #0a9e6e)` }
                : undefined
            }
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* quick-fill chips */}
      <div className="relative z-10 mt-5 space-y-2.5 text-center">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link2 className="h-3.5 w-3.5" /> Or paste a docs link:
          </span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => fillInput(ex.url)}
              className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur-sm transition-colors hover:border-[color:var(--c)] hover:text-[color:var(--c)]"
              style={{ ["--c" as string]: GREEN }}
            >
              {ex.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PROMPT_EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => fillInput(ex)}
              className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-xs text-foreground/80 backdrop-blur-sm transition-colors hover:border-[color:var(--c)] hover:text-[color:var(--c)]"
              style={{ ["--c" as string]: GREEN }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
