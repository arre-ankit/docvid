import { cn } from "@/lib/utils";

/**
 * DocVid logo: lime `{ }` braces wrapping a play triangle. The triangle
 * uses currentColor (foreground) — black in light mode, white in dark mode —
 * while the braces are the brand lime (#CBFF2E).
 */
export function Logo({
  className,
  /** Optional override for the play triangle fill (defaults to currentColor). */
  colour,
}: {
  className?: string;
  colour?: string;
}) {
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
        <path d="M22 12 L88 50 L22 88 Z" fill={colour ?? "currentColor"} />
      </svg>
      <span className="text-[#CBFF2E]">{"}"}</span>
    </span>
  );
}

/**
 * DocVid wordmark: "Doc" in the current foreground colour, "vid" in brand lime
 * (#CBFF2D). Use anywhere the brand name is shown as text.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className} aria-label="DocVid">
      Doc<span className="text-[#CBFF2D]">Vid</span>
    </span>
  );
}
