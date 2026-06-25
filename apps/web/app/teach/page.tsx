"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2, Wand2, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const LANGUAGES = [
  { value: "tsx", label: "TypeScript (React)" },
  { value: "ts", label: "TypeScript" },
  { value: "jsx", label: "JavaScript (React)" },
  { value: "js", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const POLL_MS = 3000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

function TeachInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState("tsx");
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
    if (!urlParam && !promptParam) return;
    autoStartedRef.current = true;
    if (urlParam) setUrl(urlParam);
    if (promptParam) setPrompt(promptParam);
    void onGenerate({ url: urlParam ?? undefined, prompt: promptParam ?? undefined });
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

  const onGenerate = async (override?: { url?: string; prompt?: string }) => {
    const trimmed = (override?.prompt ?? prompt).trim();
    const trimmedUrl = (override?.url ?? url).trim();
    if ((!trimmed && !trimmedUrl) || phase === "generating") return;
    stopPolling();
    setPhase("generating");
    setStatusText("Starting…");

    try {
      const res = await fetch("/api/teach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, url: trimmedUrl || undefined, language, voice }),
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
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-20">
        <div className="text-center space-y-3 mb-8">
          <Badge variant="secondary" className="rounded-full">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> AI powered
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Teach with AI</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Describe what you want to learn. AI writes a step-by-step code lesson and narrates it,
            then opens it in the editor — press play to watch it animate with audio.
          </p>
        </div>

        <Card className="border-border/60">
          <CardContent className="pt-6 space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Explain the use of useState in React"
              className="min-h-24 resize-none text-base"
              disabled={busy}
            />

            {/* Optional: turn a docs/article URL into a tutorial. */}
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="…or paste a docs URL to turn it into a tutorial"
                className="pl-9 text-base"
                disabled={busy}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Paste a documentation or article link and AI will read the page and build a narrated
              tutorial from it. Add a prompt to focus on a specific part.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={language} onValueChange={setLanguage} disabled={busy}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={voice} onValueChange={setVoice} disabled={busy}>
                <SelectTrigger className="sm:w-48">
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
              <Button
                onClick={() => onGenerate()}
                disabled={busy || (!prompt.trim() && !url.trim())}
                className="sm:ml-auto"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-1" /> Generate lesson
                  </>
                )}
              </Button>
            </div>
            {statusText && (
              <p
                className={`text-sm ${phase === "error" ? "text-destructive" : "text-muted-foreground"}`}
              >
                {statusText}
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Example prompts: “Explain useEffect cleanup”, “Show how to debounce in JavaScript”,
          “Refactor a callback into async/await”.
        </p>
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
