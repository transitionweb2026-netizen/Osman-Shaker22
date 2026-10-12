import type { CSSProperties } from "react";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { RouteButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Home, Site } from "@/lib/content";
import { cx } from "@/lib/cx";
import type { Locale } from "@/lib/i18n";
import styles from "./FeatureShowcase.module.css";

type Showcase = Home["specialties"] | Home["treatments"];

type FeatureShowcaseProps = {
  /** Section id, also used as the in-page anchor. */
  id: string;
  locale: Locale;
  content: Showcase;
  site: Site;
  /** `framed`: photo inside a glass bezel. `immersive`: full-bleed photo with a glass caption. */
  variant: "framed" | "immersive";
};

/** Heading, five featured services and a link onward — homepage and About page. */
export function FeatureShowcase({ id, locale, content, site, variant }: FeatureShowcaseProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} className="section" aria-labelledby={titleId}>
      <div className="container">
        <SectionHeading id={titleId} eyebrow={content.eyebrow} title={content.title} description={content.description} />

        <div className={styles.rail} role="region" aria-label={`${content.title} — ${site.ui.scrollHint}`} tabIndex={0}>
          <ul className={cx(styles.track, variant === "immersive" && styles.immersiveTrack)}>
            {content.items.map((card, index) => (
              <li key={card.id} data-reveal style={{ "--reveal-delay": index * 90 } as CSSProperties}>
                <ServiceCard card={card} index={index} locale={locale} variant={variant} />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footer} data-reveal>
          <RouteButton route={content.cta.route} locale={locale} soonLabel={site.ui.comingSoon}>
            {content.cta.label}
          </RouteButton>
        </div>
      </div>
    </section>
  );
}
