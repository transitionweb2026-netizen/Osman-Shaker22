import { GlassPanel } from "@/components/glass/GlassPanel";
import { Icon } from "@/components/ui/Icon";
import type { Site } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/contact";
import { cx } from "@/lib/cx";
import styles from "./SocialContactPanel.module.css";

type SocialContactPanelProps = {
  site: Site;
  className?: string;
};

/** One horizontal glass bar: social profiles, WhatsApp and the phone number. */
export function SocialContactPanel({ site, className }: SocialContactPanelProps) {
  const { contact, ui } = site;
  const socials = site.socials.filter((social) => social.url);

  return (
    <GlassPanel blur className={cx(styles.panel, className)} role="group" aria-label={ui.contactPanel}>
      <ul className={styles.list}>
        {socials.map((social) => (
          <li key={social.platform}>
            <a href={social.url!} className={styles.icon} target="_blank" rel="noopener noreferrer">
              <Icon name={social.platform} size={20} />
              <span className="sr-only">
                {social.label} {ui.opensInNewTab}
              </span>
            </a>
          </li>
        ))}
        {contact.whatsapp && (
          <li>
            <a
              href={whatsappHref(contact.whatsapp, contact.whatsappMessage)}
              className={styles.icon}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={21} />
              <span className="sr-only">
                {ui.whatsapp} {ui.opensInNewTab}
              </span>
            </a>
          </li>
        )}
        {contact.phone && (
          <li>
            <a href={telHref(contact.phone)} className={styles.phone}>
              <Icon name="phone" size={18} />
              <span className="sr-only">{ui.phone}: </span>
              <span className={`ltr ${styles.number}`}>{contact.phone.display}</span>
            </a>
          </li>
        )}
      </ul>
    </GlassPanel>
  );
}
