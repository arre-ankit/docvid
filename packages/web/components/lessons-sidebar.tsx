"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Loader2,
  Sparkles,
  Clock,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { buildLoginUrl } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

const GREEN = "#007A55";
const COLLAPSE_KEY = "docvid_sidebar_collapsed";

type LessonSummary = {
  id: string;
  title: string | null;
  status: string;
  createdAt: string;
  claimedAt: string | null;
};

// Group lessons into friendly date buckets (Today / Yesterday / Older), the way
// chat apps bucket history. Keeps a long list scannable.
function groupByDate(lessons: LessonSummary[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const startOfWeek = startOfToday - 6 * 86_400_000;

  const groups: { label: string; items: LessonSummary[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];

  for (const lesson of lessons) {
    const t = new Date(lesson.createdAt).getTime();
    if (t >= startOfToday) groups[0].items.push(lesson);
    else if (t >= startOfYesterday) groups[1].items.push(lesson);
    else if (t >= startOfWeek) groups[2].items.push(lesson);
    else groups[3].items.push(lesson);
  }

  return groups.filter((g) => g.items.length > 0);
}

export function LessonsSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeId = searchParams.get("lesson");
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lessons, setLessons] = useState<LessonSummary[] | null>(null);
  const [error, setError] = useState<"unauthorized" | "failed" | null>(null);

  // Restore the collapsed preference on mount (avoids SSR/hydration mismatch).
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await fetch("/api/lessons");
      if (res.status === 401) {
        setError("unauthorized");
        setLessons([]);
        return;
      }
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { lessons: LessonSummary[] };
      setError(null);
      setLessons(data.lessons);
    } catch {
      setError("failed");
      setLessons([]);
    }
  }, []);

  // Load once we know there's a session; clear when signed out.
  useEffect(() => {
    if (sessionPending) return;
    if (!session) {
      setLessons([]);
      setError("unauthorized");
      return;
    }
    void fetchLessons();
  }, [session, sessionPending, fetchLessons]);

  // Refetch when navigating back to the create page so a freshly generated
  // lesson shows up without a manual reload.
  useEffect(() => {
    if (session && pathname === "/teach") void fetchLessons();
  }, [pathname, session, fetchLessons]);

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, activeId]);

  const grouped = useMemo(() => (lessons ? groupByDate(lessons) : []), [lessons]);
  const loading = sessionPending || (!!session && lessons === null);

  const body = (
    <div className="flex h-full flex-col">
      {/* Header: new lesson + collapse toggle */}
      <div className={cn("flex items-center gap-2 p-3", collapsed && "flex-col")}>
        <Link
          href="/teach"
          className={cn(
            "group flex h-10 flex-1 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110",
            collapsed && "w-10 flex-none justify-center px-0",
          )}
          style={{ background: `linear-gradient(120deg, ${GREEN}, #0a9e6e)` }}
          aria-label="New lesson"
          title="New lesson"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!collapsed && <span>New lesson</span>}
        </Link>

        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:grid"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-[18px] w-[18px]" />
          ) : (
            <PanelLeftClose className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="flex items-center gap-2 px-5 pb-1">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your lessons
          </span>
        </div>
      )}

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error === "unauthorized" ? (
          !collapsed && (
            <div className="mx-1 mt-4 rounded-xl border border-border bg-card/60 p-4 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">
                Sign in to see and revisit your saved lessons.
              </p>
              <Link
                href={buildLoginUrl(pathname, searchParams.toString() ? `?${searchParams.toString()}` : "")}
                className="mt-3 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                style={{ background: `linear-gradient(120deg, ${GREEN}, #0a9e6e)` }}
              >
                Sign in
              </Link>
            </div>
          )
        ) : error === "failed" ? (
          !collapsed && (
            <p className="px-3 py-6 text-center text-xs text-destructive">
              Couldn’t load lessons.
            </p>
          )
        ) : lessons && lessons.length === 0 ? (
          !collapsed && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No lessons yet. Create your first one above.
            </p>
          )
        ) : collapsed ? null : (
          <nav className="space-y-3">
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((lesson) => {
                    const isActive = activeId === lesson.id;
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/learn?lesson=${encodeURIComponent(lesson.id)}`}
                          className={cn(
                            "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-[color:var(--c)]/10 font-medium text-[color:var(--c)]"
                              : "text-foreground/80 hover:bg-muted",
                          )}
                          style={{ ["--c" as string]: GREEN }}
                        >
                          <span className="truncate">
                            {lesson.title || "Untitled lesson"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger — floats top-left of the content area. */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-[4.2rem] z-40 grid h-10 w-10 place-items-center rounded-xl border border-border bg-background/90 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground md:hidden"
        aria-label="Open lessons"
      >
        <PanelLeftOpen className="h-[18px] w-[18px]" />
      </button>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-background shadow-xl">
            {body}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-card/40 transition-[width] duration-200 ease-out md:block",
          collapsed ? "w-16" : "w-72",
          className,
        )}
      >
        {body}
      </aside>
    </>
  );
}
