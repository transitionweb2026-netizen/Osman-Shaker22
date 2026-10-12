"use client";

import { useEffect, useRef } from "react";
import { formatNumber, type Locale } from "@/lib/i18n";

type StatCounterProps = {
  value: number;
  locale: Locale;
  className?: string;
  /** Milliseconds. */
  duration?: number;
};

/**
 * Counts up once when scrolled into view. The final value is rendered on the
 * server, so it is correct without JavaScript and for screen readers (pair it
 * with a visually hidden final value — this element is `aria-hidden`). The DOM
 * text is written directly to avoid re-rendering on every frame.
 */
export function StatCounter({ value, locale, className, duration = 1800 }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = el.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (reduceMotion || alreadyVisible || !("IntersectionObserver" in window)) return;

    el.textContent = formatNumber(0, locale);
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 4);
          el.textContent = formatNumber(Math.round(value * eased), locale);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      el.textContent = formatNumber(value, locale);
    };
  }, [value, locale, duration]);

  return (
    <span ref={ref} className={className} aria-hidden="true">
      {formatNumber(value, locale)}
    </span>
  );
}
