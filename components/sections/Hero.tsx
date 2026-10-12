import { GlassPanel } from "@/components/glass/GlassPanel";
import { SocialContactPanel } from "@/components/layout/SocialContactPanel";
import { MediaImage } from "@/components/media/MediaImage";
import { ButtonLink } from "@/components/ui/Button";
import type { Home, Site } from "@/lib/content";
import { whatsappHref } from "@/lib/contact";
import styles from "./Hero.module.css";

type HeroProps = {
  content: Home["hero"];
  site: Site;
  /** Target of the secondary button (an in-page section). */
  secondaryHref?: string;
};

export function Hero({ content, site, secondaryHref = "#specialties" }: HeroProps) {
  const { whatsapp, whatsappMessage } = site.contact;

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
            {whatsapp && (
              <ButtonLink
                href={whatsappHref(whatsapp, whatsappMessage)}
                icon="whatsapp"
                size="lg"
                newTabHint={site.ui.opensInNewTab}
              >
                {content.primaryCta}
              </ButtonLink>
            )}
            <ButtonLink href={secondaryHref} variant="glass" size="lg" arrow>
              {content.secondaryCta}
            </ButtonLink>
          </div>

          <SocialContactPanel site={site} />
        </div>
      </div>
    </section>
  );
}
