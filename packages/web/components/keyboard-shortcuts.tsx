"use client";

import { usePathname } from "next/navigation";

/**
 * Single source of truth for the player keyboard shortcuts. The header hint chips
 * (below) and the keydown handler in preview-panel.tsx both read from this list,
 * so the displayed keys can never drift from the actual bindings. `id` links a
 * shortcut to its action; `keys` are the (lowercased) KeyboardEvent.key values.
 */
export const PLAYER_SHORTCUTS = [
  { id: "playPause", keys: ["k", " "], hint: "Space", label: "Play/Pause" },
  { id: "mute", keys: ["m"], hint: "M", label: "Mute" },
  { id: "fullscreen", keys: ["f"], hint: "F", label: "Fullscreen" },
  { id: "restart", keys: ["r"], hint: "R", label: "Restart" },
  { id: "back", keys: ["arrowleft"], hint: "←", label: "Back 2s" },
  { id: "forward", keys: ["arrowright"], hint: "→", label: "Forward 2s" },
] as const;

export type PlayerShortcutId = (typeof PLAYER_SHORTCUTS)[number]["id"];

/** The shortcut chips, rendered inline so the header can place them. */
export function ShortcutChips() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
      {PLAYER_SHORTCUTS.map((s, i) => (
        <span key={s.id} className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 whitespace-nowrap text-[11px] text-muted-foreground">
            <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium leading-none text-foreground/80">
              {s.hint}
            </kbd>
            <span className="hidden xl:inline">{s.label}</span>
          </span>
          {i < PLAYER_SHORTCUTS.length - 1 && (
            <span aria-hidden="true" className="text-border">
              |
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Shortcut hints for the global header — only shown on the player route (/learn),
 * where the keyboard shortcuts are active. Hidden on small screens to keep the
 * mobile header uncluttered.
 */
export function HeaderShortcuts() {
  const pathname = usePathname();
  if (!pathname?.startsWith("/learn")) return null;
  return (
    <div className="hidden lg:flex items-center">
      <ShortcutChips />
    </div>
  );
}
