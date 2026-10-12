"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { VideoSource } from "@/content/types";
import { cx } from "@/lib/cx";
import styles from "./VideoPlayer.module.css";

type VideoPlayerProps = {
  source: VideoSource | null;
  title: string;
  /** Poster image, rendered on the server. */
  poster: ReactNode;
  /** Extra content over the poster (e.g. a title), removed once the video plays. */
  overlay?: ReactNode;
  playLabel: string;
  comingSoonLabel: string;
  className?: string;
};

function embedUrl(source: Extract<VideoSource, { kind: "youtube" }>) {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(source.id)}?autoplay=1&rel=0&playsinline=1`;
}

/**
 * Poster-first video. The real player (YouTube embed or video file) is only
 * loaded after the visitor presses play, so nothing autoplays with sound and
 * no third-party script loads up front. Without a source, the poster shows a
 * "coming soon" state instead of a fake play button.
 */
export function VideoPlayer({
  source,
  title,
  poster,
  overlay,
  playLabel,
  comingSoonLabel,
  className,
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  if (playing && source) {
    return (
      <div className={cx(styles.player, className)}>
        {source.kind === "youtube" ? (
          <iframe
            className={styles.frame}
            src={embedUrl(source)}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video className={styles.frame} controls autoPlay playsInline>
            <source src={source.src} type={source.type} />
          </video>
        )}
      </div>
    );
  }

  return (
    <div className={cx(styles.player, className)}>
      <div className={styles.poster}>{poster}</div>
      <span className={styles.shade} aria-hidden="true" />
      <div className={cx(styles.center, !source && styles.disabled)}>
        {source ? (
          <button type="button" className={styles.play} onClick={() => setPlaying(true)}>
            <span className={styles.core}>
              <Icon name="play" size={26} />
            </span>
            <span className="sr-only">
              {playLabel}: {title}
            </span>
          </button>
        ) : (
          <>
            {/* No source yet: a neutral marker instead of a play control */}
            <span className={styles.play} aria-hidden="true">
              <span className={styles.core}>
                <Icon name="clock" size={26} />
              </span>
            </span>
            <span className={styles.soon}>{comingSoonLabel}</span>
          </>
        )}
      </div>
      {overlay}
    </div>
  );
}
