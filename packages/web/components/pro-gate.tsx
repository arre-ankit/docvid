"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import { DEFAULT_VOICE } from "@/app/lib/teach/voices";
import { cn } from "@/lib/utils";

async function fetchIsPro(): Promise<boolean> {
  try {
    const res = await fetch("/api/subscription");
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.isPro;
  } catch {
    return false;
  }
}

/**
 * Gates Pro-only features (video export, premium voices) on the client. Reads
 * plan from /api/subscription; non-Pro users are sent to /pricing. The default
 * voice stays free — only switching to another voice requires Pro.
 */
export function useProGate() {
  const router = useRouter();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const isProRef = useRef<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchIsPro().then((v) => {
      if (cancelled) return;
      isProRef.current = v;
      setIsPro(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const promptUpgrade = useCallback(() => router.push("/pricing"), [router]);

  // Resolve Pro status, fetching on the fly if a click lands before the
  // initial load settles (so Pro users are never wrongly blocked).
  const resolvePro = useCallback(async () => {
    if (isProRef.current !== null) return isProRef.current;
    const v = await fetchIsPro();
    isProRef.current = v;
    setIsPro(v);
    return v;
  }, []);

  /** Run a Pro-only action (e.g. export), else send to /pricing. */
  const gateProExport = useCallback(
    async (action: () => void) => {
      if (await resolvePro()) action();
      else promptUpgrade();
    },
    [resolvePro, promptUpgrade],
  );

  /** Apply a voice change — free for the default voice, Pro for any other. */
  const gateProVoiceChange = useCallback(
    async (currentVoice: string, nextVoice: string, apply: (v: string) => void) => {
      if (nextVoice === currentVoice) return;
      if (nextVoice === DEFAULT_VOICE || (await resolvePro())) {
        apply(nextVoice);
        return;
      }
      promptUpgrade();
    },
    [resolvePro, promptUpgrade],
  );

  /** Whether a voice option should render as locked for this user. */
  const isVoiceLocked = useCallback(
    (voice: string) => isPro === false && voice !== DEFAULT_VOICE,
    [isPro],
  );

  return { isPro, promptUpgrade, gateProExport, gateProVoiceChange, isVoiceLocked };
}

/** Lock badge shown on Pro-gated dropdown items / buttons. */
export function ProLockIcon({ className }: { className?: string }) {
  return (
    <Lock className={cn("ml-auto size-3.5 shrink-0 text-muted-foreground", className)} aria-hidden />
  );
}
