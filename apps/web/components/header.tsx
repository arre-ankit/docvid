import Link from "next/link";
import { GitHubIcon, TwitterIcon } from "./ui/icons";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Separator } from "./ui/separator";

export async function Header() {
  return (
    <nav className="w-full bg-background border-b border-border px-4 sm:px-6 py-1.5 sm:py-2 z-[9999] sticky top-0">
      <div className=" mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Logo className="text-xl sm:text-2xl" />
          <h1 className="text-base sm:text-xl font-sans font-bold tracking-tight text-foreground">
            Tutora
          </h1>
        </Link>

        {/* Right side - Nav + Social Links + Theme Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/teach"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Create a lesson
          </Link>
          <Separator orientation="vertical" className="h-6 w-px" />
          {/* Social Links */}
          <Link
            href="https://github.com/kostyniuk/docvid"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <GitHubIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <Link
            href="https://x.com/costiniuc00"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Twitter"
          >
            <TwitterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          
          {/* Separator */}
          <Separator orientation="vertical" className="h-6 w-px" />
          
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

// <header className="flex-none h-14 border-b flex items-center justify-between px-4 bg-background z-20">

//   <div className="flex items-center gap-4">

//
//
//   </div>
// </header>
