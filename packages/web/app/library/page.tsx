"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GREEN = "#007A55";

type LessonSummary = {
  id: string;
  title: string | null;
  status: string;
  createdAt: string;
  claimedAt: string | null;
};

// Deterministic per-lesson gradient so each card keeps a stable, on-brand cover.
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #007A55 0%, #0a9e6e 55%, #CBFF2E 130%)",
  "linear-gradient(135deg, #0a9e6e 0%, #045d43 100%)",
  "linear-gradient(135deg, #134e4a 0%, #007A55 90%)",
  "linear-gradient(135deg, #065f46 0%, #0a9e6e 60%, #a3e635 130%)",
  "linear-gradient(135deg, #0d9488 0%, #007A55 100%)",
  "linear-gradient(135deg, #1f2c15 0%, #007A55 120%)",
];

function gradientFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CARD_GRADIENTS[hash % CARD_GRADIENTS.length];
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    complete: {
      label: "Ready",
      icon: <CheckCircle2 className="h-3 w-3" />,
      cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-500/25",
    },
    running: {
      label: "Generating",
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/25",
    },
    error: {
      label: "Failed",
      icon: <AlertCircle className="h-3 w-3" />,
      cls: "bg-red-500/15 text-red-700 dark:text-red-300 ring-red-500/25",
    },
  };
  const s = map[status] ?? map.complete;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 backdrop-blur-sm",
        s.cls,
      )}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

function LessonCard({ lesson }: { lesson: LessonSummary }) {
  return (
    <Link
      href={`/learn?lesson=${encodeURIComponent(lesson.id)}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[color:var(--c)]/40 hover:shadow-xl"
      style={{ ["--c" as string]: GREEN }}
    >
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden" style={{ background: gradientFor(lesson.id) }}>
        {/* dotted texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "radial-gradient(circle at center, rgba(255,255,255,0.45) 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />
        {/* play affordance */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition-transform duration-200 group-hover:scale-110">
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          </span>
        </div>
        {/* status */}
        <div className="absolute right-3 top-3">
          <StatusBadge status={lesson.status} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-medium leading-snug text-foreground">
          {lesson.title || "Untitled lesson"}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {relativeTime(lesson.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[color:var(--c)] opacity-0 transition-opacity group-hover:opacity-100">
            Open <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function LibraryInner() {
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/lessons");
        if (res.status === 401) {
          if (!cancelled) setError("sign_in_required");
          return;
        }
        if (!res.ok) throw new Error("Failed to load lessons");
        const data = (await res.json()) as { lessons: LessonSummary[] };
        if (!cancelled) setLessons(data.lessons);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load lessons");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error === "sign_in_required") {
    return (
      <EmptyState
        title="Sign in to see your lessons"
        body="Lessons saved to your account appear here once you sign in."
        cta={{ href: "/login?next=/library", label: "Sign in" }}
      />
    );
  }

  if (!lessons && !error) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-video animate-pulse bg-muted" />
            <div className="space-y-3 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Couldn’t load your lessons"
        body={error}
        cta={{ href: "/library", label: "Try again" }}
        tone="error"
      />
    );
  }

  if (lessons && lessons.length === 0) {
    return (
      <EmptyState
        title="No saved lessons yet"
        body="Generate a lesson from a docs link or a prompt, then sign in to customize and save it."
        cta={{ href: "/teach", label: "Create a lesson" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {lessons!.map((lesson) => (
        <LessonCard key={lesson.id} lesson={lesson} />
      ))}
    </div>
  );
}

function EmptyState({
  title,
  body,
  cta,
  tone = "default",
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
  tone?: "default" | "error";
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-dashed border-border bg-card/40 px-8 py-16 text-center">
      <span
        className={cn(
          "grid h-14 w-14 place-items-center rounded-2xl ring-1",
          tone === "error"
            ? "bg-red-500/10 text-red-500 ring-red-500/20"
            : "bg-[color:var(--c)]/10 text-[color:var(--c)] ring-[color:var(--c)]/20",
        )}
        style={{ ["--c" as string]: GREEN }}
      >
        {tone === "error" ? <AlertCircle className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
      </span>
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      <Button asChild>
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">My lessons</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Lessons you generated after signin appear here.
          </p>
        </div>
        <Button asChild className="w-full gap-1.5 sm:w-auto">
          <Link href="/teach">
            <Plus className="h-4 w-4" />
            New lesson
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <LibraryInner />
      </Suspense>
    </div>
  );
}
