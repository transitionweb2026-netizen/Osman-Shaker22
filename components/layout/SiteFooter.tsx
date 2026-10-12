import { BrandMark } from "@/components/ui/BrandMark";
import { Icon } from "@/components/ui/Icon";
import type { Site } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/contact";
import { cx } from "@/lib/cx";
import type { Locale } from "@/lib/i18n";
import { localeHref, resolveRoute } from "@/lib/routes";
import styles from "./SiteFooter.module.css";

type SiteFooterProps = {
  locale: Locale;
  site: Site;
};

export function SiteFooter({ locale, site }: SiteFooterProps) {
  const { contact, footer, ui } = site;
  const socials = site.socials.filter((social) => social.url);
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <a href={localeHref(locale)} className={styles.brand} aria-label={ui.homeLink}>
              <BrandMark idPrefix="footer-mark" size={48} />
              <span>
                <span className={styles.brandName}>{site.name}</span>
                <span className={styles.brandRole}>{site.specialty}</span>
              </span>
            </a>
            <p className={styles.description}>{site.description}</p>
            {socials.length > 0 && (
              <ul className={styles.socials}>
                {socials.map((social) => (
                  <li key={social.platform}>
                    <a href={social.url!} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                      <Icon name={social.platform} size={20} />
                      <span className="sr-only">
                        {social.label} {ui.opensInNewTab}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <nav aria-label={ui.footerNavigation}>
            <h2 className={styles.colTitle}>{footer.navigationHeading}</h2>
            <ul className={styles.links}>
              {site.navigation.map((item) => {
                const href = resolveRoute(item.route, locale);
                return (
                  <li key={item.route}>
                    {href ? (
                      <a href={href} className={styles.link}>
                        {item.label}
                      </a>
                    ) : (
                      <span className={cx(styles.link, styles.linkSoon)}>
                        {item.label}
                        <span className={styles.soonTag}>{ui.comingSoon}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {(contact.phone || contact.whatsapp) && (
            <div>
              <h2 className={styles.colTitle}>{footer.contactHeading}</h2>
              <ul className={styles.links}>
                {contact.phone && (
                  <li>
                    <a href={telHref(contact.phone)} className={styles.link}>
                      <Icon name="phone" size={18} />
                      <span className="sr-only">{ui.phone}: </span>
                      <span className="ltr">{contact.phone.display}</span>
                    </a>
                  </li>
                )}
                {contact.whatsapp && (
                  <li>
                    <a
                      href={whatsappHref(contact.whatsapp, contact.whatsappMessage)}
                      className={styles.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon name="whatsapp" size={18} />
                      {ui.whatsapp}
                      <span className="sr-only">{ui.opensInNewTab}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

          {socials.length > 0 && (
            <div>
              <h2 className={styles.colTitle}>{footer.followHeading}</h2>
              <ul className={styles.links}>
                {socials.map((social) => (
                  <li key={social.platform}>
                    <a href={social.url!} className={styles.link} target="_blank" rel="noopener noreferrer">
                      <Icon name={social.platform} size={18} />
                      {social.label}
                      <span className="sr-only">{ui.opensInNewTab}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className={styles.bottom}>
          <p className={styles.disclaimer}>{footer.disclaimer}</p>
          <div className={styles.bottomRow}>
            <p>{footer.copyright.replace("{year}", String(year))}</p>
            <a href="#main" className={styles.toTop}>
              <Icon name="arrowUp" size={18} />
              {ui.backToTop}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
