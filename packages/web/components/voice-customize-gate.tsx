"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { authClient } from "@/lib/auth-client";
import { buildLoginUrl } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

type VoiceGateProps = {
  className?: string;
  title?: string;
};

/** Voice picker gating for pages outside LessonCustomizeProvider (teach, hero). */
export function useVoiceCustomize() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const canCustomize = !!session?.user;
  const promptSignIn = useCallback(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    router.push(buildLoginUrl(pathname, search));
  }, [pathname, router]);

  const gateVoiceChange = useCallback(
    (currentVoice: string, nextVoice: string, apply: (v: string) => void) => {
      if (!canCustomize && nextVoice !== currentVoice) {
        promptSignIn();
        return;
      }
      apply(nextVoice);
    },
    [canCustomize, promptSignIn],
  );

  return { canCustomize, promptSignIn, gateVoiceChange };
}

/** Same voice picker UI — overlay sends anonymous users to sign in. */
export function VoiceCustomizeGate({
  className,
  title = "Sign in to change the narration voice",
  children,
}: VoiceGateProps & { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  if (session?.user) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  const loginHref = buildLoginUrl(
    pathname,
    typeof window !== "undefined" ? window.location.search : "",
  );

  return (
    <div className={cn("relative", className)}>
      {children}
      <button
        type="button"
        className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] bg-transparent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(loginHref);
        }}
        title={title}
        aria-label={title}
      />
    </div>
  );
}
