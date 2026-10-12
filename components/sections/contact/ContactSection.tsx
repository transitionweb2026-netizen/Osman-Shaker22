import { GlassPanel } from "@/components/glass/GlassPanel";
import { ButtonLink } from "@/components/ui/Button";
import type { ContactPage, Site } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/contact";
import type { Locale } from "@/lib/i18n";
import { ContactForm } from "./ContactForm";
import styles from "./ContactSection.module.css";

type ContactSectionProps = {
  locale: Locale;
  page: ContactPage;
  site: Site;
};

/** Contact form followed by direct WhatsApp and call actions. */
export function ContactSection({ locale, page, site }: ContactSectionProps) {
  const { phone, whatsapp, whatsappMessage } = site.contact;
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT || null;

  return (
    <section className="section" aria-labelledby="contact-form-title">
      <div className={`container ${styles.layout}`}>
        <GlassPanel ink="mixed" inkSubtle grain className={styles.formPanel} data-reveal>
          <header className={styles.formHeader}>
            <h2 id="contact-form-title" className={styles.title}>
              {page.form.title}
            </h2>
            <p className={styles.description}>{page.form.description}</p>
          </header>
          <ContactForm form={page.form} whatsapp={whatsapp} endpoint={endpoint} locale={locale} />
        </GlassPanel>

        <GlassPanel
          as="section"
          ink="mixed"
          animateInk
          className={styles.actions}
          aria-labelledby="contact-actions-title"
          data-reveal
        >
          <div className={styles.actionsText}>
            <p className="eyebrow">{page.actions.eyebrow}</p>
            <h2 id="contact-actions-title" className={styles.actionsTitle}>
              {page.actions.title}
            </h2>
            {phone && (
              <p className={styles.number}>
                <span className="ltr">{phone.display}</span>
              </p>
            )}
          </div>
          <div className={styles.buttons}>
            {whatsapp && (
              <ButtonLink
                href={whatsappHref(whatsapp, whatsappMessage)}
                icon="whatsapp"
                size="lg"
                newTabHint={site.ui.opensInNewTab}
              >
                {page.actions.whatsappLabel}
              </ButtonLink>
            )}
            {phone && (
              <ButtonLink href={telHref(phone)} icon="phone" variant="glass" size="lg">
                {page.actions.callLabel}
              </ButtonLink>
            )}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
