"use client";

import { useEffect } from "react";

const INTERVAL_MS = 4000;

/**
 * Development only (`npm run dev`): reloads the page when newer CMS content reaches the
 * local site (scripts/dev.mjs pulls it a few seconds after each publish).
 *
 * Next's hot reload usually refreshes open pages by itself, but its connection does not
 * always survive the computer sleeping, so an old tab would keep showing old content.
 * This asks /cms-build.json instead: every few seconds, and as soon as the tab is shown again.
 */
export function CmsLiveReload({ version }: { version: string | null }) {
  useEffect(() => {
    let active = true;

    const check = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(`/cms-build.json?ts=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) return;
        const latest = ((await response.json()) as { contentVersion?: string | null }).contentVersion ?? null;
        if (!active || !latest || latest === version) return;
        // Reload once per new version, so a page that still differs after reloading cannot loop.
        const key = `cms-live-reload:${latest}`;
        try {
          if (sessionStorage.getItem(key)) return;
          sessionStorage.setItem(key, "1");
        } catch {
          // Storage unavailable: reloading once is still safe.
        }
        window.location.reload();
      } catch {
        // Dev server restarting or offline: try again at the next check.
      }
    };

    const timer = window.setInterval(check, INTERVAL_MS);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [version]);

  return null;
}
