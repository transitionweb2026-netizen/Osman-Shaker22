import { GlassPanel } from "@/components/glass/GlassPanel";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { ContactPage, Site } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/contact";
import { cx } from "@/lib/cx";
import type { Locale } from "@/lib/i18n";
import { ContactForm } from "./ContactForm";
import styles from "./ContactSection.module.css";

type ContactSectionProps = {
  locale: Locale;
  page: ContactPage;
  site: Site;
};

/** Clinic details (address, booking numbers, hours, fee), the contact form, then WhatsApp and call actions. */
export function ContactSection({ locale, page, site }: ContactSectionProps) {
  const { phone, whatsapp, whatsappMessage, clinic } = site.contact;
  const endpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT || null;
  const phones = clinic?.phones?.filter((number) => number.e164 && number.display) ?? [];

  return (
    <section className="section" aria-labelledby="contact-form-title">
      <div className={`container ${styles.layout}`}>
        {clinic && (
          <GlassPanel
            as="section"
            ink="mixed"
            inkSubtle
            className={styles.clinic}
            aria-labelledby="clinic-title"
            data-reveal
          >
            <h2 id="clinic-title" className={styles.clinicTitle}>
              {clinic.title}
            </h2>
            <dl className={styles.clinicGrid}>
              {clinic.address && (
                <div className={cx(styles.clinicItem, styles.clinicWide)}>
                  <dt className={styles.clinicLabel}>
                    <Icon name="pin" size={20} />
                    {clinic.addressLabel}
                  </dt>
                  <dd className={styles.clinicValue}>
                    <p>{clinic.address}</p>
                    {clinic.mapUrl && (
                      <ButtonLink href={clinic.mapUrl} variant="glass" newTabHint={site.ui.opensInNewTab}>
                        {clinic.mapLabel}
                      </ButtonLink>
                    )}
                  </dd>
                </div>
              )}
              {phones.length > 0 && (
                <div className={styles.clinicItem}>
                  <dt className={styles.clinicLabel}>
                    <Icon name="phone" size={20} />
                    {clinic.phonesLabel}
                  </dt>
                  <dd className={styles.clinicValue}>
                    <ul className={styles.phones}>
                      {phones.map((number) => (
                        <li key={number.e164}>
                          <a href={telHref(number)} className={cx("ltr", styles.phoneLink)}>
                            {number.display}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              {clinic.hours && (
                <div className={styles.clinicItem}>
                  <dt className={styles.clinicLabel}>
                    <Icon name="clock" size={20} />
                    {clinic.hoursLabel}
                  </dt>
                  <dd className={styles.clinicValue}>{clinic.hours}</dd>
                </div>
              )}
              {clinic.fee && (
                <div className={styles.clinicItem}>
                  <dt className={styles.clinicLabel}>
                    <Icon name="wallet" size={20} />
                    {clinic.feeLabel}
                  </dt>
                  <dd className={styles.clinicValue}>{clinic.fee}</dd>
                </div>
              )}
            </dl>
          </GlassPanel>
        )}

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
