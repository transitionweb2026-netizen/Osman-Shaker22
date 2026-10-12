import type { CSSProperties } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { MediaImage } from "@/components/media/MediaImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Home } from "@/lib/content";
import { cx } from "@/lib/cx";
import { formatIndex, type Locale } from "@/lib/i18n";
import styles from "./WhyChoose.module.css";

type WhyChooseProps = {
  locale: Locale;
  content: Home["whyChoose"];
};

export function WhyChoose({ locale, content }: WhyChooseProps) {
  return (
    <section id="why" className={cx("section", styles.section)} aria-labelledby="why-title">
      <div className={cx("container", styles.layout)}>
        <div>
          <SectionHeading
            id="why-title"
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
          <ol className={styles.principles}>
            {content.principles.map((principle, index) => (
              <li
                key={principle.id}
                className={styles.principle}
                data-reveal
                style={{ "--reveal-delay": index * 100 } as CSSProperties}
              >
                <span className={styles.principleNumber} aria-hidden="true">
                  {formatIndex(index + 1, locale)}
                </span>
                <div className={styles.principleBody}>
                  <h3>{principle.title}</h3>
                  <p className={styles.principleText}>{principle.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <figure className={styles.visual} data-reveal="scale">
          <span className={styles.ring} aria-hidden="true" />
          <GlassPanel ink="blue" animateInk inkSpeed={30} className={styles.frame}>
            <div className={styles.photo}>
              <MediaImage image={content.image} sizes="(min-width: 1024px) 500px, 92vw" />
            </div>
          </GlassPanel>
          <GlassPanel as="figcaption" blur ink="amber" inkSubtle className={styles.caption}>
            <span className={styles.captionMark} aria-hidden="true" />
            <p className={styles.captionText}>{content.caption}</p>
          </GlassPanel>
        </figure>
      </div>
    </section>
  );
}
