import { GlassPanel } from "@/components/glass/GlassPanel";
import { SocialContactPanel } from "@/components/layout/SocialContactPanel";
import { MediaImage } from "@/components/media/MediaImage";
import { CtaButton } from "@/components/ui/CtaButton";
import type { Home, Site } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import styles from "./Hero.module.css";

type HeroProps = {
  locale: Locale;
  content: Home["hero"];
  site: Site;
};

export function Hero({ locale, content, site }: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media}>
        <MediaImage image={content.image} sizes="100vw" priority className={styles.image} />
      </div>
      <div className={styles.tint} aria-hidden="true" />
      <div className={styles.grade} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.light} aria-hidden="true" />

      <div className="container-wide">
        <div className={styles.content}>
          <GlassPanel as="p" blur className={styles.eyebrow}>
            <span className={styles.pulse} aria-hidden="true" />
            {content.eyebrow}
          </GlassPanel>

          <h1 id="hero-title" className={styles.title}>
            {content.title} <span className={`${styles.accent} text-gradient`}>{content.titleAccent}</span>
          </h1>

          <p className={styles.description}>{content.description}</p>

          <div className={styles.actions}>
            <CtaButton cta={content.primaryCta} locale={locale} site={site} variant="primary" size="lg" />
            <CtaButton cta={content.secondaryCta} locale={locale} site={site} variant="glass" size="lg" />
          </div>

          <SocialContactPanel site={site} />
        </div>
      </div>
    </section>
  );
}
