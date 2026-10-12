import type { CSSProperties } from "react";
import { VideoCard } from "@/components/media/VideoCard";
import type { Site, VideosPage } from "@/lib/content";
import styles from "./VideoGrid.module.css";

type VideoGridProps = {
  videos: VideosPage["items"];
  ui: Site["ui"];
  /** Heading of the list, read by assistive technology. */
  title: string;
};

/** Portrait video cards: three per row on desktop, two on tablets, one on phones. */
export function VideoGrid({ videos, ui, title }: VideoGridProps) {
  return (
    <section className="section" aria-labelledby="video-list-title">
      <div className="container">
        <h2 id="video-list-title" className="sr-only">
          {title}
        </h2>
        <ul className={styles.grid}>
          {videos.map((video, index) => (
            <li key={video.id} data-reveal style={{ "--reveal-delay": (index % 3) * 110 } as CSSProperties}>
              <VideoCard video={video} ui={ui} sizes="(min-width: 980px) 340px, (min-width: 600px) 45vw, 90vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
