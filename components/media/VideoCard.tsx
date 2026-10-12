import { GlassPanel } from "@/components/glass/GlassPanel";
import type { Video } from "@/content/types";
import type { Site } from "@/lib/content";
import type { Resolved } from "@/lib/localize";
import { MediaImage } from "./MediaImage";
import styles from "./VideoCard.module.css";
import { VideoPlayer } from "./VideoPlayer";

type VideoCardProps = {
  video: Resolved<Video>;
  ui: Site["ui"];
  sizes: string;
};

/**
 * Portrait (9:16) video card. Play controls appear only when the entry has a
 * real `source`; otherwise the poster shows a "coming soon" state.
 */
export function VideoCard({ video, ui, sizes }: VideoCardProps) {
  return (
    <GlassPanel as="article" ink="mixed" className={`ink-host ${styles.card}`}>
      <div className={styles.screen}>
        <VideoPlayer
          source={video.source}
          title={video.title}
          playLabel={ui.playVideo}
          comingSoonLabel={ui.videoComingSoon}
          poster={<MediaImage image={video.poster} sizes={sizes} />}
          overlay={
            <GlassPanel blur className={styles.meta}>
              <h3 className={styles.title}>{video.title}</h3>
              {video.duration && <p className={styles.duration}>{video.duration}</p>}
            </GlassPanel>
          }
        />
      </div>
    </GlassPanel>
  );
}
