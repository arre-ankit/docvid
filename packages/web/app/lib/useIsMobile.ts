"use client";

import { useEffect, useState } from "react";

/**
 * True when the viewport is below Tailwind's `md` breakpoint (768px).
 * Starts `false` so SSR/first paint matches the desktop layout, then
 * corrects on mount.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
