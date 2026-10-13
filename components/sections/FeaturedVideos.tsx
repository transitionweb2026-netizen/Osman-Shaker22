import type { CSSProperties } from "react";
import { VideoCard } from "@/components/media/VideoCard";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Home, Site } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import styles from "./FeaturedVideos.module.css";

type FeaturedVideosProps = {
  locale: Locale;
  content: Home["videos"];
  site: Site;
};

export function FeaturedVideos({ locale, content, site }: FeaturedVideosProps) {
  return (
    <section id="videos" className="section" aria-labelledby="videos-title">
      <div className="container">
        <SectionHeading
          id="videos-title"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          align="center"
        />

        <div
          className={styles.rail}
          role="region"
          aria-label={`${content.title} — ${site.ui.scrollHint}`}
          tabIndex={0}
        >
          <ul className={styles.track}>
            {content.items.map((video, index) => (
              <li key={video.id} data-reveal style={{ "--reveal-delay": index * 120 } as CSSProperties}>
                <VideoCard video={video} ui={site.ui} sizes="(min-width: 760px) 300px, 72vw" />
              </li>
            ))}
          </ul>
        </div>

        {!content.cta.hidden && (
          <div className={styles.footer} data-reveal>
            <CtaButton cta={content.cta} locale={locale} site={site} />
          </div>
        )}
      </div>
    </section>
  );
}
