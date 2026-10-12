import { GlassPanel } from "@/components/glass/GlassPanel";
import { FaqAccordion } from "@/components/media/FaqAccordion";
import { ButtonLink, RouteButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ReviewsPage, Site } from "@/lib/content";
import { whatsappHref } from "@/lib/contact";
import { cx } from "@/lib/cx";
import { formatIndex, type Locale } from "@/lib/i18n";
import styles from "./FaqSection.module.css";

type FaqSectionProps = {
  locale: Locale;
  faq: ReviewsPage["faq"];
  site: Site;
};

/**
 * The full FAQ, grouped by topic. On large screens a sticky sidebar holds the
 * topic index and a contact card; on smaller screens the topics become a row
 * of chips and the contact card follows the questions.
 */
export function FaqSection({ locale, faq, site }: FaqSectionProps) {
  const { ui, contact } = site;

  return (
    <section id="faq" className={cx("section", styles.section)} aria-labelledby="faq-title">
      <div className="container">
        <SectionHeading id="faq-title" eyebrow={faq.eyebrow} title={faq.title} description={faq.description} />

        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <nav aria-label={ui.faqTopics} className={styles.topics} data-reveal>
              <p className={styles.topicsTitle} aria-hidden="true">
                {ui.faqTopics}
              </p>
              <ol className={styles.topicList}>
                {faq.categories.map((category, index) => (
                  <li key={category.id}>
                    <a href={`#faq-${category.id}`} className={styles.topic}>
                      <span className={styles.topicIndex} aria-hidden="true">
                        {formatIndex(index + 1, locale)}
                      </span>
                      {category.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <GlassPanel ink="amber" inkSubtle className={styles.contact} data-reveal>
              <h3 className={styles.contactTitle}>{faq.contact.title}</h3>
              <p className={styles.contactText}>{faq.contact.text}</p>
              <div className={styles.contactActions}>
                {contact.whatsapp && (
                  <ButtonLink
                    href={whatsappHref(contact.whatsapp, faq.contact.whatsappMessage)}
                    icon="whatsapp"
                    newTabHint={ui.opensInNewTab}
                  >
                    {ui.chatOnWhatsapp}
                  </ButtonLink>
                )}
                <RouteButton route="contact" locale={locale} soonLabel={ui.comingSoon}>
                  {faq.contact.contactLabel}
                </RouteButton>
              </div>
            </GlassPanel>
          </div>

          <div className={styles.groups}>
            {faq.categories.map((category, index) => (
              <div key={category.id} id={`faq-${category.id}`} className={styles.group} data-reveal>
                <h3 className={styles.groupTitle}>
                  <span className={styles.groupIndex} aria-hidden="true">
                    {formatIndex(index + 1, locale)}
                  </span>
                  {category.title}
                </h3>
                <FaqAccordion items={category.items} level={4} openFirst={index === 0} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
