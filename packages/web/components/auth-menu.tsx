"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2, LogOut, User } from "lucide-react";

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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/library">My lessons</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/teach">New lesson</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="truncate text-xs text-muted-foreground">
          {session.user.email}
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
