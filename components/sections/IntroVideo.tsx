import { VideoFrame } from "@/components/media/VideoFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Home, Site } from "@/lib/content";
import styles from "./IntroVideo.module.css";

type IntroVideoProps = {
  content: Home["introVideo"];
  ui: Site["ui"];
};

export function IntroVideo({ content, ui }: IntroVideoProps) {
  return (
    <section id="introduction" className="section" aria-labelledby="intro-title">
      <div className="container">
        <SectionHeading
          id="intro-title"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          align="center"
        />

        <div className={styles.stage} data-reveal="scale">
          <VideoFrame video={content.video} ui={ui} sizes="(min-width: 1300px) 1220px, 94vw" cinematic />
        </div>
      </div>
    </section>
  );
}
