import type { CSSProperties } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { RouteButton } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Home, Site } from "@/lib/content";
import { formatNumber, type Locale } from "@/lib/i18n";
import styles from "./PatientJourney.module.css";

type PatientJourneyProps = {
  locale: Locale;
  content: Home["journey"];
  site: Site;
};

export function PatientJourney({ locale, content, site }: PatientJourneyProps) {
  return (
    <section id="journey" className="section" aria-labelledby="journey-title">
      <div className="container">
        <SectionHeading
          id="journey-title"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          align="center"
        />

        <ol className={styles.steps}>
          {content.steps.map((step, index) => (
            <li
              key={step.id}
              className={styles.step}
              data-reveal
              style={{ "--reveal-delay": index * 120 } as CSSProperties}
            >
              <GlassPanel className={styles.node}>
                <Icon name={step.icon} size={30} />
                <span className={styles.number} aria-hidden="true">
                  {formatNumber(index + 1, locale)}
                </span>
              </GlassPanel>
              <div className={styles.text}>
                <h3>{step.title}</h3>
                <p className={styles.description}>{step.description}</p>
              </div>
              <span className={styles.arrow} aria-hidden="true">
                <Icon name="chevron" size={14} />
              </span>
            </li>
          ))}
        </ol>

        <div className={styles.footer} data-reveal>
          <p className={styles.note}>{content.note}</p>
          <RouteButton route={content.cta.route} locale={locale} soonLabel={site.ui.comingSoon}>
            {content.cta.label}
          </RouteButton>
        </div>
      </div>
    </section>
  );
}
