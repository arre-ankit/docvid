"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type LessonSummary = {
  id: string;
  title: string | null;
  status: string;
  createdAt: string;
  claimedAt: string | null;
};

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
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
        <p className="text-muted-foreground">Sign in to see lessons saved to your account.</p>
        <Button asChild>
          <Link href="/login?next=/library">Sign in</Link>
        </Button>
      </div>
    );
  }

  if (!lessons) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <p className="py-20 text-center text-sm text-destructive">{error}</p>;
  }

  if (lessons.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">No saved lessons yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate a lesson, then sign in when you want to customize and save it.
          </p>
        </div>
        <Button asChild>
          <Link href="/teach">Create a lesson</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <Link
            href={`/learn?lesson=${encodeURIComponent(lesson.id)}`}
            className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{lesson.title || "Untitled lesson"}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(lesson.createdAt).toLocaleString()} · {lesson.status}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">Open</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function LibraryPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium tracking-tight">My lessons</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lessons you claimed after signing in appear here.
        </p>
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
