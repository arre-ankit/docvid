"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Logo } from "./logo";
import { HeaderShortcuts } from "./keyboard-shortcuts";
import { ThemeToggle } from "./theme-toggle";
import { AuthMenu } from "./auth-menu";
import { cn } from "@/lib/utils";

/** Marketing nav links shown in the centre of the bar (home only). */
const NAV_LINKS = [
  { label: "How it Works", href: "/#how" },
  { label: "Examples", href: "/#examples" },
  { label: "Roadmap", href: "/#roadmap" },
  { label: "Blog", href: "/#blog" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

// At the top of the page the bar is a light frosted glass that lets the page
// gradient through. Once scrolled it collapses into a compact island floating
// over content, so it goes (near-)opaque to read as the only thing on top
// instead of a translucent smudge over whatever it overlaps.
const GLASS_TOP =
  "bg-[#2c3b1f]/35 backdrop-blur-xl border border-white/15 " +
  "shadow-[0_10px_40px_-12px_rgba(0,0,0,0.45)] " +
  "supports-[backdrop-filter]:bg-[#2c3b1f]/30";
const GLASS_SCROLLED =
  "bg-[#1f2c15] border border-white/10 " +
  "shadow-[0_16px_50px_-12px_rgba(0,0,0,0.6)]";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isPlayer = pathname?.startsWith("/learn");
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;

    // The app shell (`h-screen` + flex) scrolls inside an inner container, not
    // the window — so a plain window scroll listener never fires. A capture-phase
    // document listener catches scroll from *any* scrolling element.
    const onScroll = (e?: Event) => {
      const target = e?.target;
      const top =
        window.scrollY ||
        document.documentElement.scrollTop ||
        (target instanceof HTMLElement ? target.scrollTop : 0) ||
        0;
      setScrolled(top > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [isHome]);

  if (isLogin) return null;

  // Everywhere outside the marketing home page uses the plain app header.
  if (!isHome) return <SimpleHeader isPlayer={!!isPlayer} />;

  return (
    <nav
      className={cn(
        "sticky top-0 z-[9999] w-full px-3 pt-3 transition-all duration-300 ease-out sm:px-5 sm:pt-4",
        scrolled
          ? "pointer-events-none -translate-y-full opacity-0"
          : "translate-y-0 opacity-100",
      )}
    >
      {/* Full-width bar — stays large at every scroll position. */}
      <div className="relative mx-auto max-w-7xl text-white">
        {/* single pill — translucent at the top, solid once scrolled */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full transition-colors duration-500 ease-out",
            scrolled ? GLASS_SCROLLED : GLASS_TOP,
          )}
        />

        <div className="relative flex h-14 items-center justify-between sm:h-16">
          {/* ---------- Left: logo ---------- */}
          <Link
            href="/"
            className="flex h-full items-center gap-2.5 rounded-full px-5 sm:px-6"
            aria-label="DocVid — home"
          >
            <Logo className="text-xl sm:text-2xl text-white" />
            <span className="hidden text-base font-bold tracking-tight sm:inline sm:text-xl">
              DocVid
            </span>
          </Link>

          {/* ---------- Centre: nav links ---------- */}
          <div
            className={cn(
              "absolute left-1/2 hidden -translate-x-1/2 items-center transition-all duration-500 ease-out lg:flex",
              scrolled
                ? "pointer-events-none -translate-y-1 opacity-0"
                : "translate-y-0 opacity-100",
            )}
          >
            <div className="flex items-center gap-7 xl:gap-9">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="whitespace-nowrap text-sm font-semibold text-white/80 transition-colors hover:text-white xl:text-[15px]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ---------- Right: theme toggle + auth ---------- */}
          <div className="flex h-full items-center gap-1.5 p-1.5 sm:gap-2 sm:p-2">
            <GlassThemeToggle />
            <Suspense fallback={<div className="h-9 w-16" />}>
              <AuthMenu variant="marketing" />
            </Suspense>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** White-on-glass theme toggle for the marketing header. */
function GlassThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}

/** Plain app header used inside the player and other non-marketing routes. */
function SimpleHeader({ isPlayer }: { isPlayer: boolean }) {
  return (
    <nav className="sticky top-0 z-[9999] w-full border-b border-border bg-background px-4 py-1.5 sm:px-6 sm:py-2">
      <div className="mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <Logo className="text-xl sm:text-2xl" />
          <h1 className="font-sans text-base font-bold tracking-tight text-foreground sm:text-xl">
            DocVid
          </h1>
        </Link>

        {/* Player keyboard-shortcut hints (only on the /learn player route) */}
        {isPlayer && <HeaderShortcuts />}

        {/* Right: theme toggle + auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <Suspense fallback={<div className="h-9 w-16" />}>
            <AuthMenu variant="app" />
          </Suspense>
        </div>
      </div>
    </nav>
  );
}
