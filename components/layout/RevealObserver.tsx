"use client";

import { useEffect } from "react";

/**
 * Enables scroll-reveal for `[data-reveal]` elements.
 *
 * Content is visible until this runs. Elements already on screen are marked
 * revealed immediately, then `html.reveal-ready` hides only what is still
 * below the fold — so nothing flashes and nothing depends on JavaScript.
 */
export function RevealObserver() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const fold = window.innerHeight * 0.92;
    const pending = elements.filter((el) => {
      if (el.getBoundingClientRect().top < fold) {
        el.classList.add("is-revealed");
        return false;
      }
      return true;
    });

    document.documentElement.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    pending.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
