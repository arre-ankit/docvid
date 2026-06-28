"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const GREEN = "#0a9e6e";

type Quota = {
  isPro: boolean;
  authenticated: boolean;
  limit: number | null;
  remaining: number | null;
};

/**
 * Subtle "N free lessons left" pill for the teach page. Reads the live quota
 * from /api/subscription (the same gate the server enforces) so the count never
 * drifts from reality. Renders nothing for Pro users or while loading.
 */
export function GenerationQuota({ className }: { className?: string }) {
  const [quota, setQuota] = useState<Quota | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setQuota(data as Quota);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Unknown yet, Pro, or no cap — nothing to show.
  if (!quota || quota.isPro || quota.limit === null || quota.remaining === null) {
    return null;
  }

  const { remaining, authenticated } = quota;
  const out = remaining <= 0;
  const upgradeHref = authenticated ? "/pricing" : "/login?next=%2Fteach";

  // Out of free lessons: a brand-tinted pill that nudges to the next step.
  if (out) {
    return (
      <Link
        href={upgradeHref}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
          className,
        )}
        style={{
          borderColor: "rgba(10,158,110,0.35)",
          backgroundColor: "rgba(10,158,110,0.12)",
          color: GREEN,
        }}
      >
        <Zap className="h-3.5 w-3.5" />
        {authenticated
          ? "You're out of free lessons"
          : "Sign in to keep creating lessons"}
        <span className="underline decoration-1 underline-offset-2 group-hover:no-underline">
          {authenticated ? "Upgrade" : "Sign in"}
        </span>
      </Link>
    );
  }

  // Still have free lessons: quiet pill with the count + a soft upsell.
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3.5 py-1.5 text-xs backdrop-blur-sm",
        className,
      )}
    >
      <Sparkles className="h-3.5 w-3.5" style={{ color: GREEN }} />
      <span className="text-muted-foreground">
        <span className="font-semibold text-foreground">{remaining}</span> free{" "}
        {remaining === 1 ? "lesson" : "lessons"} left
      </span>
      <span aria-hidden className="text-border">
        |
      </span>
      <Link
        href={upgradeHref}
        className="font-medium transition-opacity hover:opacity-80"
        style={{ color: GREEN }}
      >
        {authenticated ? "Upgrade for unlimited" : "Sign in for more"}
      </Link>
    </div>
  );
}
