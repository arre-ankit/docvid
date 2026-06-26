"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Share2, Copy, Check, Linkedin, X as CloseIcon } from "lucide-react";
import { TwitterIcon } from "./ui/icons";
import { usePortalContainer } from "@/lib/portal-container";
import { cn } from "@/lib/utils";

const SHARE_TEXT = "Check out this video lesson I made on DocVid 🎬";

/**
 * Share control for the player: opens a small dialog to copy the lesson link
 * or share it straight to X / LinkedIn. The shared link is the current page.
 */
interface ShareButtonProps {
  className?: string;
}

export function ShareButton({ className }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const portalContainer = usePortalContainer();

  // Resolve the URL on the client (avoids SSR `window` access).
  useEffect(() => {
    if (open) setShareUrl(window.location.href);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the field is selectable as a fallback */
    }
  };

  const openShare = (href: string) =>
    window.open(href, "_blank", "noopener,noreferrer,width=600,height=520");

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    SHARE_TEXT,
  )}&url=${encodeURIComponent(shareUrl)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`;

  const dialog = open ? (
    <div
      className="fixed inset-0 z-[10000] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share this lesson"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold text-foreground">Share this lesson</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anyone with the link can watch it.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1.5">
          <input
            readOnly
            value={shareUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 truncate bg-transparent px-2 text-sm text-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={copy}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs font-bold text-background transition-opacity hover:opacity-90"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy
              </>
            )}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => openShare(xHref)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            <TwitterIcon className="h-4 w-4" /> Post on X
          </button>
          <button
            type="button"
            onClick={() => openShare(liHref)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50"
          >
            <Linkedin className="h-4 w-4" /> LinkedIn
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Share lesson"
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          className,
        )}
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Share</span>
      </button>

      {dialog && createPortal(dialog, portalContainer ?? document.body)}
    </>
  );
}
