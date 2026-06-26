"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Lock } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { buildLoginUrl } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

type LessonCustomizeContextValue = {
  canCustomize: boolean;
  loginHref: string;
  promptSignIn: () => void;
  gateAction: <T>(action: () => T) => T | undefined;
};

const LessonCustomizeContext = createContext<LessonCustomizeContextValue | null>(null);

export function LessonCustomizeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  const canCustomize = !!session?.user;
  const loginHref = useMemo(() => {
    const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return buildLoginUrl(pathname, search);
  }, [pathname, searchParams]);

  const promptSignIn = useCallback(() => {
    router.push(loginHref);
  }, [loginHref, router]);

  const gateAction = useCallback(
    <T,>(action: () => T): T | undefined => {
      if (!canCustomize) {
        promptSignIn();
        return undefined;
      }
      return action();
    },
    [canCustomize, promptSignIn],
  );

  const value = useMemo(
    () => ({ canCustomize, loginHref, promptSignIn, gateAction }),
    [canCustomize, loginHref, promptSignIn, gateAction],
  );

  return (
    <LessonCustomizeContext.Provider value={value}>{children}</LessonCustomizeContext.Provider>
  );
}

export function useLessonCustomize() {
  const ctx = useContext(LessonCustomizeContext);
  if (!ctx) {
    throw new Error("useLessonCustomize must be used within LessonCustomizeProvider");
  }
  return ctx;
}

/**
 * Lock badge shown on dropdown items that require sign-in.
 */
export function CustomizeLockIcon({ className }: { className?: string }) {
  return (
    <Lock
      className={cn("ml-auto size-3.5 shrink-0 text-muted-foreground", className)}
      aria-hidden
    />
  );
}

/**
 * Keeps child controls visually identical; anonymous users hit an invisible
 * overlay that sends them to sign in instead of changing the value.
 */
export function CustomizeGate({
  children,
  className,
  title = "Sign in to customize",
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  const { canCustomize, promptSignIn } = useLessonCustomize();

  if (canCustomize) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      {children}
      <button
        type="button"
        className="absolute inset-0 z-10 cursor-pointer rounded-[inherit] bg-transparent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          promptSignIn();
        }}
        title={title}
        aria-label={title}
      />
    </div>
  );
}
