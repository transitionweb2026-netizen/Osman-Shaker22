import { GlassPanel } from "@/components/glass/GlassPanel";
import { FaqAccordion } from "@/components/media/FaqAccordion";
import { ButtonLink, RouteButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ReviewsPage, Site } from "@/lib/content";
import { whatsappHref } from "@/lib/contact";
import { cx } from "@/lib/cx";
import type { Locale } from "@/lib/i18n";
import styles from "./FaqSection.module.css";

type FaqSectionProps = {
  locale: Locale;
  faq: ReviewsPage["faq"];
  site: Site;
};

/**
 * The full FAQ as one list of questions, in the CMS order (topics first, then
 * the questions inside each). On large screens a sticky sidebar holds a
 * contact card; on smaller screens it follows the questions.
 */
export function FaqSection({ locale, faq, site }: FaqSectionProps) {
  const { ui, contact } = site;
  const questions = faq.categories.flatMap((category) => category.items);

  return (
    <section id="faq" className={cx("section", styles.section)} aria-labelledby="faq-title">
      <div className="container">
        <SectionHeading id="faq-title" eyebrow={faq.eyebrow} title={faq.title} description={faq.description} />

        <div className={styles.layout}>
          <div className={styles.sidebar}>
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
            <div className={styles.group} data-reveal>
              <FaqAccordion items={questions} level={3} openFirst />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
