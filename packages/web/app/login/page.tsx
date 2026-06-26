"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { AuthSplitShell } from "@/components/auth/auth-split-shell";
import { authClient } from "@/lib/auth-client";
import { claimPendingLesson, readClaimToken } from "@/lib/claim-lesson";
import { lessonIdFromNext, resolvePostAuthRedirect } from "@/lib/auth-redirect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitHubIcon, GoogleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type OAuthProviders = {
  google: boolean;
  github: boolean;
};

function SocialButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const lessonParam =
    searchParams.get("lesson") ?? lessonIdFromNext(nextParam);

  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "github" | null>(null);
  const [providers, setProviders] = useState<OAuthProviders>({ google: false, github: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/providers");
        if (!res.ok) return;
        const data = (await res.json()) as OAuthProviders;
        if (!cancelled) setProviders(data);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const oauthCallbackUrl = () => {
    const params = new URLSearchParams();
    if (nextParam) params.set("next", nextParam);
    if (lessonParam) params.set("lesson", lessonParam);
    return `/auth/complete?${params.toString()}`;
  };

  const finishAuth = async () => {
    const claimToken = lessonParam ? readClaimToken(lessonParam) : undefined;
    const claim = await claimPendingLesson(
      lessonParam && claimToken ? { lessonId: lessonParam, claimToken } : undefined,
    );
    router.push(resolvePostAuthRedirect(nextParam, lessonParam, claim));
    router.refresh();
  };

  const onSocialSignIn = async (provider: "google" | "github") => {
    setError(null);
    setOauthBusy(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: oauthCallbackUrl(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Social sign in failed");
      setOauthBusy(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          name: name.trim() || email.split("@")[0] || "User",
          email: email.trim(),
          password,
        });
        if (result.error) {
          setError(result.error.message ?? "Sign up failed");
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
          rememberMe,
        });
        if (result.error) {
          setError(result.error.message ?? "Sign in failed");
          return;
        }
      }

      await finishAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const showOAuth = providers.google || providers.github;
  const isSignIn = mode === "sign-in";

  const heading = lessonParam
    ? "Save your lesson"
    : isSignIn
      ? "Welcome back"
      : "Create your account";

  const subheading = lessonParam
    ? "Sign in to customize and keep this lesson in your account."
    : isSignIn
      ? "Sign in to customize lessons and access your library."
      : "Start turning docs into narrated video lessons.";

  return (
    <AuthSplitShell
      topAction={
        <button
          type="button"
          onClick={() => {
            setMode(isSignIn ? "sign-up" : "sign-in");
            setError(null);
          }}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </button>
      }
    >
      <div className="mx-auto w-full max-w-md sm:max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {heading}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{subheading}</p>
        </div>

        {showOAuth && (
          <div className="mb-6 space-y-3">
            {providers.google && (
              <SocialButton
                disabled={!!oauthBusy || busy}
                onClick={() => onSocialSignIn("google")}
              >
                {oauthBusy === "google" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="h-4 w-4" />
                )}
                Sign in with Google
              </SocialButton>
            )}
            {providers.github && (
              <SocialButton
                disabled={!!oauthBusy || busy}
                onClick={() => onSocialSignIn("github")}
              >
                {oauthBusy === "github" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GitHubIcon className="h-4 w-4" />
                )}
                Sign in with GitHub
              </SocialButton>
            )}

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-3 text-muted-foreground">or</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {!isSignIn && (
            <div className="space-y-2">
              <Label htmlFor="name" className="sr-only">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                autoComplete="name"
                className="h-11 rounded-xl bg-background"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="sr-only">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              autoComplete="email"
              className="h-11 rounded-xl bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="sr-only">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={8}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                className="h-11 rounded-xl bg-background pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {isSignIn && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-[#007A55]"
                />
                Remember me
              </label>
              <span className="text-muted-foreground/70">Forgot password?</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !!oauthBusy}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
              "bg-neutral-950 shadow-sm hover:bg-neutral-800",
              "dark:bg-gradient-to-br dark:from-[#007A55] dark:to-[#0a9e6e] dark:shadow-md dark:hover:brightness-110",
            )}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait…
              </>
            ) : (
              <>
                {isSignIn ? "Sign in" : "Create account"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {!showOAuth && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Google and GitHub sign-in appear once OAuth credentials are configured.
          </p>
        )}
      </div>
    </AuthSplitShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
