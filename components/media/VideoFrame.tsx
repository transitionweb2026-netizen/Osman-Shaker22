import { GlassPanel } from "@/components/glass/GlassPanel";
import type { Site } from "@/lib/content";
import type { Video } from "@/content/types";
import { cx } from "@/lib/cx";
import type { Resolved } from "@/lib/localize";
import { MediaImage } from "./MediaImage";
import { VideoPlayer } from "./VideoPlayer";
import styles from "./VideoFrame.module.css";

type VideoFrameProps = {
  video: Resolved<Video>;
  ui: Site["ui"];
  /** Poster `sizes` for the layout the frame is placed in. */
  sizes: string;
  /** Extra-wide 2.2:1 screen on large displays (full-width placement). */
  cinematic?: boolean;
  /** No glass bezel: the screen and its title sit directly on the page background. */
  bare?: boolean;
};

/** Landscape video in a deep glass bezel with flowing ink and an ambient halo. */
export function VideoFrame({ video, ui, sizes, cinematic = false, bare = false }: VideoFrameProps) {
  const content = (
    <>
      <div className={styles.screen}>
        <VideoPlayer
          source={video.source}
          title={video.title}
          playLabel={ui.playVideo}
          comingSoonLabel={ui.videoComingSoon}
          poster={<MediaImage image={video.poster} sizes={sizes} />}
        />
      </div>
      <div className={styles.caption}>
        <span className={styles.captionTitle}>{video.title}</span>
        {video.duration && <span className={styles.duration}>{video.duration}</span>}
      </div>
    </>
  );

  return (
    <div className={cx(styles.wrap, cinematic && styles.cinematic, bare && styles.bare)}>
      {/* The halo's edges line up with the frame, so without a bezel it would read as a panel */}
      {!bare && <span className={styles.halo} aria-hidden="true" />}
      {bare ? (
        content
      ) : (
        <GlassPanel ink="mixed" animateInk grain className={styles.frame}>
          {content}
        </GlassPanel>
      )}
    </div>
  );
}
