"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogOut, Sparkles, User } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { buildLoginUrl } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const GREEN = "#007A55";

const marketingButtonClass =
  "inline-flex h-full items-center gap-1.5 rounded-full bg-black px-5 text-sm font-bold text-white shadow-sm ring-1 ring-white/10 transition-transform hover:scale-[1.03] active:scale-95 sm:px-7 sm:text-[15px]";

type AuthMenuProps = {
  variant?: "marketing" | "app";
  /** Override auto-detected return URL (defaults to current page). */
  loginHref?: string;
  className?: string;
};

export function AuthMenu({ variant = "app", loginHref, className }: AuthMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const resolvedLoginHref = loginHref ?? buildLoginUrl(pathname, search);
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);

  // Resolve the current plan once signed in (server checks Dodo as needed).
  useEffect(() => {
    if (!session) {
      setPlan(null);
      return;
    }
    let cancelled = false;
    fetch("/api/subscription")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setPlan(data.isPro ? "pro" : "free");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (isPending) {
    return (
      <div className={cn("grid h-9 w-9 place-items-center", className)}>
        <Loader2 className="h-4 w-4 animate-spin opacity-60" />
      </div>
    );
  }

  if (!session) {
    if (variant === "marketing") {
      return (
        <Link href={resolvedLoginHref} className={cn(marketingButtonClass, className)}>
          Login
        </Link>
      );
    }

    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href={resolvedLoginHref}>Sign in</Link>
      </Button>
    );
  }

  if (variant === "marketing") {
    return (
      <Link href="/teach" className={cn(marketingButtonClass, className)}>
        Get Started
      </Link>
    );
  }

  const label = session.user.name?.split(" ")[0] ?? "Account";

  const onSignOut = async () => {
    setSigningOut(true);
    try {
      await authClient.signOut();
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
            className,
          )}
        >
          <User className="h-4 w-4 opacity-80" />
          <span className="max-w-[8rem] truncate">{label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {/* Account + current plan */}
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{session.user.name ?? label}</p>
            <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
          </div>
          <PlanBadge plan={plan} />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/library">My lessons</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/teach">New lesson</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={plan === "pro" ? "/pricing" : "/pricing"}>
            {plan === "pro" ? "Manage plan" : "Upgrade to Pro"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} disabled={signingOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Small pill showing the user's current plan in the account menu. */
function PlanBadge({ plan }: { plan: "free" | "pro" | null }) {
  if (plan === null) {
    return <Loader2 className="h-3.5 w-3.5 animate-spin opacity-50" />;
  }
  if (plan === "pro") {
    return (
      <span
        className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
        style={{ backgroundColor: GREEN }}
      >
        <Sparkles className="size-3" />
        Pro
      </span>
    );
  }
  return (
    <span className="inline-flex flex-shrink-0 items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      Free
    </span>
  );
}

/** Compact sign-in CTA used on marketing pages. */
export function SignInLink({ href = "/login", className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110",
        className,
      )}
      style={{ background: `linear-gradient(120deg, ${GREEN}, #0a9e6e)` }}
    >
      Get Started
    </Link>
  );
}
