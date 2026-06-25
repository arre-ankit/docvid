import { useEffect, useState } from "react";

/**
 * Radix/Base-UI popovers portal to document.body by default, which is outside
 * the element shown by the Fullscreen API — so they're invisible in fullscreen.
 * This hook returns the current fullscreen element (or undefined) and updates on
 * fullscreenchange, so portals re-target into the fullscreened preview when it
 * opens/closes. Pass the result to a Portal's `container` prop.
 */
function currentFullscreenEl(): HTMLElement | undefined {
  if (typeof document === "undefined") return undefined;
  return (document.fullscreenElement as HTMLElement | null) ?? undefined;
}

export function usePortalContainer(): HTMLElement | undefined {
  const [el, setEl] = useState<HTMLElement | undefined>(undefined);

  useEffect(() => {
    const sync = () => setEl(currentFullscreenEl());
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  return el;
}
