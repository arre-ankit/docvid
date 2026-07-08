import Link from "next/link";
import { Logo, Wordmark } from "@/components/logo";

const LIME = "#CBFF2E";
const GREEN = "#007A55";

const AUTH_HERO_SRC = "/auth-hero.png";

type AuthSplitShellProps = {
  children: React.ReactNode;
  /** Top-right link (e.g. toggle sign in / sign up). */
  topAction?: React.ReactNode;
};

export function AuthSplitShell({ children, topAction }: AuthSplitShellProps) {
  return (
    <div className="relative flex min-h-dvh w-full overflow-hidden">
      {/* Home-style green / lime ambient wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 block dark:hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,122,85,0.18) 0%, rgba(203,255,46,0.18) 55%, rgba(203,255,46,0.06) 100%)",
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            background:
              "radial-gradient(70% 55% at 50% 38%, rgba(203,255,46,0.14), transparent 72%), radial-gradient(60% 50% at 82% 8%, rgba(203,255,46,0.10), transparent 70%), radial-gradient(65% 55% at 12% 22%, rgba(0,122,85,0.24), transparent 70%), radial-gradient(90% 60% at 50% 100%, rgba(0,122,85,0.20), transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full flex-col lg:flex-row">
        {/* Form column */}
        <div className="flex min-h-dvh w-full flex-col bg-background lg:w-1/2 lg:max-w-[720px] lg:shrink-0 lg:border-r lg:border-border/40">
          <header className="flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6">
            <Link href="/" className="flex items-center gap-2.5" aria-label="DocVid home">
              <Logo className="text-2xl" />
              <Wordmark className="text-lg font-bold tracking-tight text-foreground" />
            </Link>
            {topAction}
          </header>

          <div className="flex flex-1 flex-col justify-center px-6 pb-8 sm:px-10 sm:pb-10">
            {children}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-6 py-4 text-xs text-muted-foreground sm:px-10">
            <span>© 2026 DocVid. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link href="/#contact" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="/#contact" className="transition-colors hover:text-foreground">
                Terms
              </Link>
            </div>
          </footer>
        </div>

        {/* Hero image column */}
        <div className="relative hidden min-h-dvh flex-1 p-6 pl-0 lg:flex lg:items-stretch">
          <div className="relative flex-1 overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AUTH_HERO_SRC}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, rgba(0,122,85,0.2) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { GREEN, LIME };
