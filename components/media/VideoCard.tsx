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
 *
 * Nothing is laid over the poster: covers usually carry their own title, so the
 * title is for screen readers only.
 */
export function VideoCard({ video, ui, sizes }: VideoCardProps) {
  return (
    <GlassPanel as="article" ink="mixed" className={`ink-host ${styles.card}`}>
      <h3 className="sr-only">{video.title}</h3>
      <div className={styles.screen}>
        <VideoPlayer
          source={video.source}
          title={video.title}
          playLabel={ui.playVideo}
          comingSoonLabel={ui.videoComingSoon}
          poster={<MediaImage image={video.poster} sizes={sizes} />}
        />
      </div>
    </GlassPanel>
  );
}
