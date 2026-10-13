import { PortraitStack } from "@/components/media/PortraitStack";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Home, Site } from "@/lib/content";
import { cx } from "@/lib/cx";
import type { Locale } from "@/lib/i18n";
import styles from "./About.module.css";

type AboutProps = {
  locale: Locale;
  content: Home["about"];
  site: Site;
};

export function About({ locale, content, site }: AboutProps) {
  return (
    <section id="about" className={cx("section", styles.section)} aria-labelledby="about-title">
      <div className={cx("container", styles.layout)}>
        <div className={styles.text}>
          <SectionHeading id="about-title" eyebrow={content.eyebrow} title={content.title} />
          <div className={styles.paragraphs} data-reveal>
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {!content.cta.hidden && (
            <div data-reveal>
              <CtaButton cta={content.cta} locale={locale} site={site} />
            </div>
          )}
        </div>

        <div className={styles.visual} data-reveal="scale">
          <PortraitStack portrait={content.portrait} name={site.name} role={site.specialty} />
        </div>
      </div>
    </section>
  );
}
