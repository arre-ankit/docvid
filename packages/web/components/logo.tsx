import { cn } from "@/lib/utils";

/**
 * DocVid logo: lime `{ }` braces wrapping a play triangle. The triangle
 * uses currentColor (foreground) — black in light mode, white in dark mode —
 * while the braces are the brand lime (#CBFF2E).
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="DocVid"
      className={cn(
        "inline-flex items-center font-mono font-extrabold leading-none text-foreground",
        className,
      )}
    >
      <span className="text-[#CBFF2E]">{"{"}</span>
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="-mx-[0.08em] h-[0.82em] w-[0.6em] shrink-0"
      >
        <path d="M22 12 L88 50 L22 88 Z" fill="currentColor" />
      </svg>
      <span className="text-[#CBFF2E]">{"}"}</span>
    </span>
  );
}
