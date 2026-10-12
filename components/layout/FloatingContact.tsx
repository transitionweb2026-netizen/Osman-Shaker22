import { GlassPanel } from "@/components/glass/GlassPanel";
import { Icon } from "@/components/ui/Icon";
import type { Site } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/contact";
import { cx } from "@/lib/cx";
import styles from "./FloatingContact.module.css";

/** WhatsApp and call shortcuts, fixed to the reading end of the screen on every page. */
export function FloatingContact({ site }: { site: Site }) {
  const { phone, whatsapp, whatsappMessage } = site.contact;
  const { ui } = site;
  if (!phone && !whatsapp) return null;

  return (
    <div className={styles.dock} role="group" aria-label={ui.quickContact}>
      {whatsapp && (
        <GlassPanel
          as="a"
          href={whatsappHref(whatsapp, whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          ink="amber"
          blur
          className={cx(styles.button, styles.whatsapp)}
        >
          <Icon name="whatsapp" size={26} />
          <span className={styles.label} aria-hidden="true">
            {ui.chatOnWhatsapp}
          </span>
          <span className="sr-only">
            {ui.chatOnWhatsapp} {ui.opensInNewTab}
          </span>
        </GlassPanel>
      )}
      {phone && (
        <GlassPanel as="a" href={telHref(phone)} ink="blue" blur className={cx(styles.button, styles.phone)}>
          <Icon name="phone" size={22} />
          <span className={styles.label} aria-hidden="true">
            {ui.callClinic}
          </span>
          <span className="sr-only">{ui.callClinic}</span>
        </GlassPanel>
      )}
    </div>
  );
}
