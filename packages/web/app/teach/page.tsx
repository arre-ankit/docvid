"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2, Link2, AudioLines, ArrowUp } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LessonSkeleton } from "@/components/lesson-skeleton";

import type { LessonStatus } from "../lib/teach/types";
import { LESSON_STORAGE_PREFIX } from "../lib/teach/types";
import { LESSON_VOICES as VOICES, DEFAULT_VOICE } from "../lib/teach/voices";

const POLL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

// Brand palette.
const GREEN = "#007A55";

// A single input handles both: free-text prompts and pasted docs URLs.
const looksLikeUrl = (s: string) =>
  /^https?:\/\//i.test(s) || (/^[^\s]+\.[^\s]{2,}/.test(s) && !/\s/.test(s));

const PROMPT_EXAMPLES = [
  "Explain useEffect cleanup",
  "How to debounce in JavaScript",
  "Refactor a callback into async/await",
];
const DOC_EXAMPLES = [
  "https://react.dev/learn/add-react-to-an-existing-project",
  "https://nextjs.org/docs/app/api-reference/cli/create-next-app",
  "https://tailwindcss.com/docs/installation/using-vite",
];

function TeachInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  // Language is auto-detected from the prompt/docs; we just send a sane default.
  const [language] = useState("tsx");
  const [voice, setVoice] = useState(DEFAULT_VOICE);

  const [phase, setPhase] = useState<"idle" | "generating" | "done" | "error">("idle");
  const [statusText, setStatusText] = useState("");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Deep-link arrivals (the tutora.app/<docs-url> URL-hack) skip the generator
  // form entirely: we show a lesson-shaped loading skeleton until /learn opens.
  const [deepLink] = useState(
    () => !!(searchParams.get("url") || searchParams.get("prompt")),
  );

  const stopPolling = useCallback(() => {
    if (pollRef.current) clearTimeout(pollRef.current);
    pollRef.current = null;
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Deep-link / URL-hack: ?url= (and optional ?prompt=) auto-starts generation
  // (e.g. arriving from tutora.app/<docs-url>). Runs once.
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    const urlParam = searchParams.get("url");
    const promptParam = searchParams.get("prompt");
    const voiceParam = searchParams.get("voice");
    if (!urlParam && !promptParam) return;
    autoStartedRef.current = true;
    if (urlParam) setUrl(urlParam);
    if (promptParam) setPrompt(promptParam);
    if (voiceParam) setVoice(voiceParam);
    void onGenerate({
      url: urlParam ?? undefined,
      prompt: promptParam ?? undefined,
      voice: voiceParam ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const poll = useCallback(
    (id: string, startedAt: number) => {
      const tick = async () => {
        try {
          const res = await fetch(`/api/teach/${id}`);
          const data = (await res.json()) as LessonStatus;

          if (data.status === "complete") {
            // Cache the lesson and jump straight into the editor (with narration audio).
            try {
              sessionStorage.setItem(LESSON_STORAGE_PREFIX + id, JSON.stringify(data.lesson));
            } catch {
              /* editor will refetch if sessionStorage is unavailable */
            }
            setPhase("done");
            setStatusText("Opening editor…");
            router.push(`/learn?lesson=${encodeURIComponent(id)}`);
            return;
          }
          if (data.status === "error") {
            setPhase("error");
            setStatusText(data.error || "Generation failed. Please try again.");
            return;
          }
          if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
            setPhase("error");
            setStatusText("Timed out waiting for the lesson.");
            return;
          }
          setStatusText("Generating code steps and narration… this usually takes ~20–40s.");
          pollRef.current = setTimeout(tick, POLL_MS);
        } catch {
          setPhase("error");
          setStatusText("Network error while checking status.");
        }
      };
      tick();
    },
    [router],
  );

  const onGenerate = async (override?: {
    url?: string;
    prompt?: string;
    voice?: string;
  }) => {
    const trimmed = (override?.prompt ?? prompt).trim();
    const trimmedUrl = (override?.url ?? url).trim();
    const useVoice = override?.voice ?? voice;
    if ((!trimmed && !trimmedUrl) || phase === "generating") return;
    stopPolling();
    setPhase("generating");
    setStatusText("Starting…");

    try {
      const res = await fetch("/api/teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, url: trimmedUrl || undefined, language, voice: useVoice }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const { id } = (await res.json()) as { id: string };
      poll(id, Date.now());
    } catch (e) {
      setPhase("error");
      setStatusText(e instanceof Error ? e.message : "Failed to start generation.");
    }
  };

  const busy = phase === "generating" || phase === "done";
  const canGenerate = !busy && !!prompt.trim();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // One box: route the text to a docs URL or a prompt depending on its shape.
  const submit = () => {
    const v = prompt.trim();
    if (!v || busy) return;
    if (looksLikeUrl(v)) onGenerate({ url: v, prompt: "" });
    else onGenerate({ prompt: v, url: "" });
  };

  const fillInput = (text: string) => {
    setPrompt(text);
    inputRef.current?.focus();
  };

  // For deep-link arrivals, render the lesson skeleton (not the form) so it's
  // clear a lesson is on its way. On error, the skeleton shows a recovery CTA.
  if (deepLink) {
    return (
      <LessonSkeleton
        error={phase === "error" ? statusText || "Generation failed." : undefined}
      />
    );
  }

  return (
    <div className="relative h-full overflow-y-auto bg-background text-foreground">
      {/* ambient green backdrop — matches the home page (no grid) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* light mode: green → lime wash */}
        <div
          className="absolute inset-0 block dark:hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,122,85,0.16) 0%, rgba(203,255,46,0.16) 55%, rgba(203,255,46,0.06) 100%)",
          }}
        />
        {/* dark mode: green/lime glow */}
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              "radial-gradient(60% 45% at 50% 6%, rgba(203,255,46,0.14), transparent 72%), radial-gradient(65% 55% at 12% 16%, rgba(0,122,85,0.20), transparent 70%), radial-gradient(80% 55% at 50% 100%, rgba(0,122,85,0.16), transparent 75%)",
          }}
        />
      </div>

      <div className="relative container mx-auto max-w-2xl px-4 py-14 sm:py-20">
        {/* heading */}
        <div className="mb-9 text-center">
          <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
            Teach with AI
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Describe what you want to learn — AI writes a step-by-step code
            lesson, narrates it, and animates it into a video.
          </p>
        </div>

        {/* the box — single dark chat-style input */}
        <div className="relative rounded-3xl border border-white/10 bg-[#1b1b1e] p-2.5 shadow-2xl">
          <Textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Describe what you want to learn, or paste a docs link…"
            className="min-h-28 resize-none border-0 bg-transparent px-3 pt-3 text-base text-white shadow-none placeholder:text-white/40 focus-visible:ring-0"
            disabled={busy}
          />

          {/* toolbar */}
          <div className="mt-1.5 flex items-center gap-1 px-1.5 pb-0.5">
            {/* voice */}
            <Select value={voice} onValueChange={setVoice} disabled={busy}>
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
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {statusText && (
          <p
            className={cn(
              "mt-4 text-center text-sm",
              phase === "error" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {statusText}
          </p>
        )}

        {/* quick-fill chips — prompts and pasteable docs links */}
        <div className="mt-6 space-y-2.5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PROMPT_EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => fillInput(ex)}
                className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-foreground/80 transition-colors hover:border-[color:var(--c)] hover:text-[color:var(--c)]"
                style={{ ["--c" as string]: GREEN }}
              >
                {ex}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" /> Or paste a docs link:
            </span>
            {DOC_EXAMPLES.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => fillInput(u)}
                className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:border-[color:var(--c)] hover:text-[color:var(--c)]"
                style={{ ["--c" as string]: GREEN }}
              >
                {new URL(u).hostname.replace(/^www\./, "")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeachPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center bg-background">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TeachInner />
    </Suspense>
  );
}
