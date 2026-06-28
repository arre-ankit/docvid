"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const GREEN = "#007A55";

/**
 * Compact "Upgrade to Pro" CTA for the app header. Renders only for users on the
 * free plan (resolved via /api/subscription, which checks Dodo as needed), so Pro
 * users never see it. Hidden until the plan is known to avoid a flash.
 */
export function UpgradeProPill({ className }: { className?: string }) {
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setIsPro(!!data.isPro);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Unknown yet, or already Pro — render nothing.
  if (isPro !== false) return null;

  return (
    <Link
      href="/pricing"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110",
        className,
      )}
      style={{ background: `linear-gradient(120deg, ${GREEN}, #0a9e6e)` }}
    >
      <Zap className="size-3.5" />
      <span className="hidden sm:inline">Upgrade to Pro</span>
      <span className="sm:hidden">Pro</span>
    </Link>
  );
}
