"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/dialog/Dialog";
import { DialogTrigger } from "@/components/dialog/DialogTrigger";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { MediaImage } from "@/components/media/MediaImage";
import { Icon } from "@/components/ui/Icon";
import type { About, Site } from "@/lib/content";
import styles from "./CertificateGallery.module.css";

type CertificateGalleryProps = {
  items: About["certificates"]["items"];
  label: string;
  ui: Site["ui"];
};

/**
 * Horizontally scrolling certificate cards with previous/next controls and
 * touch swiping (scroll snapping). Real certificate scans open in an enlarged
 * view with their original proportions; placeholders show a neutral frame.
 */
export function CertificateGallery({ items, label, ui }: CertificateGalleryProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    // scrollLeft is negative in RTL; its magnitude is the distance from the start.
    const position = Math.abs(track.scrollLeft);
    const max = track.scrollWidth - track.clientWidth;
    setEdges({ start: position <= 2, end: position >= max - 2 });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateEdges);
    };
    onScroll();
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [updateEdges]);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const rtl = getComputedStyle(track).direction === "rtl";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap) * (rtl ? -1 : 1),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className={styles.gallery}>
      <ul ref={trackRef} className={styles.track} tabIndex={0} aria-label={label}>
        {items.map((certificate) => {
          const dialogId = `certificate-${certificate.id}`;
          return (
            <li key={certificate.id} className={styles.slide}>
              <GlassPanel ink="mixed" className={styles.card}>
                <div className={styles.mat}>
                  {certificate.image ? (
                    <>
                      <MediaImage image={certificate.image} sizes="(min-width: 1024px) 420px, 80vw" />
                      <DialogTrigger target={dialogId} className={styles.enlarge}>
                        <Icon name="expand" size={18} />
                        <span className="sr-only">
                          {ui.enlarge}: {certificate.title}
                        </span>
                      </DialogTrigger>
                    </>
                  ) : (
                    <div className={styles.placeholder}>
                      <Icon name="certificate" size={42} />
                      <span>{ui.certificatePending}</span>
                    </div>
                  )}
                </div>
              </GlassPanel>
              {certificate.image && (
                <Dialog id={dialogId} labelledBy={`${dialogId}-title`} closeLabel={ui.close} variant="media">
                  <figure className={styles.lightbox}>
                    <MediaImage image={certificate.image} sizes="(min-width: 1140px) 1100px, 100vw" />
                    <figcaption id={`${dialogId}-title`} className={styles.lightboxCaption}>
                      {certificate.title}
                    </figcaption>
                  </figure>
                </Dialog>
              )}
            </li>
          );
        })}
      </ul>

      <div className={styles.controls}>
        <button type="button" className={styles.control} onClick={() => step(-1)} disabled={edges.start}>
          <Icon name="arrow" size={20} className={styles.previousIcon} />
          <span className="sr-only">{ui.previous}</span>
        </button>
        <button type="button" className={styles.control} onClick={() => step(1)} disabled={edges.end}>
          <Icon name="arrow" size={20} />
          <span className="sr-only">{ui.next}</span>
        </button>
      </div>
    </div>
  );
}
