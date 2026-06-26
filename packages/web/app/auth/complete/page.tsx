"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { claimPendingLesson, readClaimToken } from "@/lib/claim-lesson";
import { lessonIdFromNext, resolvePostAuthRedirect } from "@/lib/auth-redirect";

function AuthCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const lessonParam =
    searchParams.get("lesson") ?? lessonIdFromNext(nextParam);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const claimToken = lessonParam ? readClaimToken(lessonParam) : undefined;
      const claim = await claimPendingLesson(
        lessonParam && claimToken ? { lessonId: lessonParam, claimToken } : undefined,
      );
      if (!cancelled) {
        router.replace(resolvePostAuthRedirect(nextParam, lessonParam, claim));
        router.refresh();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lessonParam, nextParam, router]);

  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Finishing sign in…</p>
      </div>
    </div>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <AuthCompleteInner />
    </Suspense>
  );
}
