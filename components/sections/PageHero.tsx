import type { ReactNode } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { MediaImage } from "@/components/media/MediaImage";
import { Icon } from "@/components/ui/Icon";
import type { PageHeroContent } from "@/content/types";
import type { Site } from "@/lib/content";
import { cx } from "@/lib/cx";
import type { Locale } from "@/lib/i18n";
import type { Resolved } from "@/lib/localize";
import { localeHref } from "@/lib/routes";
import heroStyles from "./Hero.module.css";
import styles from "./PageHero.module.css";

type PageHeroProps = {
  locale: Locale;
  site: Site;
  content: Resolved<PageHeroContent>;
  /** Name of the current page in the breadcrumb. */
  pageLabel: string;
  children?: ReactNode;
};

/**
 * Hero for internal pages: the homepage hero's image treatment and motion,
 * in a shorter composition with breadcrumbs.
 */
export function PageHero({ locale, site, content, pageLabel, children }: PageHeroProps) {
  const home = site.navigation.find((item) => item.route === "home")?.label ?? site.name;

  return (
    <section className={cx(heroStyles.hero, styles.page)} aria-labelledby="page-title">
      <div className={heroStyles.media}>
        <MediaImage image={content.image} sizes="100vw" priority className={heroStyles.image} />
      </div>
      <div className={heroStyles.tint} aria-hidden="true" />
      <div className={heroStyles.grade} aria-hidden="true" />
      <div className={heroStyles.scrim} aria-hidden="true" />
      <div className={heroStyles.light} aria-hidden="true" />

      <div className="container-wide">
        <div className={heroStyles.content}>
          <nav aria-label={site.ui.breadcrumb} className={styles.breadcrumb}>
            <ol>
              <li>
                <a href={localeHref(locale)}>{home}</a>
              </li>
              <li aria-hidden="true" className={styles.separator}>
                <Icon name="chevron" size={14} />
              </li>
              <li>
                <span aria-current="page">{pageLabel}</span>
              </li>
            </ol>
          </nav>

          <GlassPanel as="p" blur className={heroStyles.eyebrow}>
            <span className={heroStyles.pulse} aria-hidden="true" />
            {content.eyebrow}
          </GlassPanel>

          <h1 id="page-title" className={cx(heroStyles.title, styles.title)}>
            {content.title}
          </h1>

          <p className={heroStyles.description}>{content.description}</p>

          {children}
        </div>
      </div>
    </section>
  );
}
