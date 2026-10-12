import type { CSSProperties } from "react";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { DetailView } from "@/components/content/DetailView";
import { Dialog } from "@/components/dialog/Dialog";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ServicesPage, Site } from "@/lib/content";
import { whatsappHref } from "@/lib/contact";
import { cx } from "@/lib/cx";
import { formatIndex, type Locale } from "@/lib/i18n";
import styles from "./ServiceGroups.module.css";

type ServiceGroupsProps = {
  locale: Locale;
  groups: ServicesPage["groups"];
  site: Site;
};

const CARD_SIZES = "(min-width: 1200px) 400px, (min-width: 640px) 46vw, 80vw";

/**
 * One clearly separated section per service group, all in the same landscape
 * card style; every card opens a detail popup.
 */
export function ServiceGroups({ locale, groups, site }: ServiceGroupsProps) {
  const { ui, contact } = site;

  return groups.map((group, groupIndex) => {
    const titleId = `${group.id}-title`;

    return (
      <section key={group.id} id={group.id} className={cx("section", styles.group)} aria-labelledby={titleId}>
        <div className="container">
          <div className={styles.head}>
            <span className={styles.number} aria-hidden="true">
              {formatIndex(groupIndex + 1, locale)}
            </span>
            <SectionHeading id={titleId} eyebrow={group.eyebrow} title={group.title} description={group.description} />
          </div>

          <div className={styles.rail} role="region" aria-label={`${group.title} — ${ui.scrollHint}`} tabIndex={0}>
            <ul className={cx(styles.grid, group.services.length === 4 && styles.pairs)}>
              {group.services.map((service, index) => (
                <li key={service.id} data-reveal style={{ "--reveal-delay": index * 80 } as CSSProperties}>
                  <ServiceCard
                    card={service}
                    index={index}
                    locale={locale}
                    variant="immersive"
                    sizes={CARD_SIZES}
                    details={{ dialogId: `service-${service.id}`, label: ui.viewDetails }}
                    compact
                  />
                </li>
              ))}
            </ul>
          </div>

          {group.services.map((service) => {
            const dialogId = `service-${service.id}`;
            return (
              <Dialog key={service.id} id={dialogId} labelledBy={`${dialogId}-title`} closeLabel={ui.close}>
                <DetailView titleId={`${dialogId}-title`} eyebrow={group.eyebrow} title={service.title} image={service.image}>
                  <ContentBlocks blocks={service.details} />
                  {contact.whatsapp && (
                    <div className={styles.dialogActions}>
                      <ButtonLink
                        href={whatsappHref(contact.whatsapp, ui.askAboutServiceMessage.replace("{service}", service.title))}
                        icon="whatsapp"
                        newTabHint={ui.opensInNewTab}
                      >
                        {ui.askAboutService}
                      </ButtonLink>
                    </div>
                  )}
                </DetailView>
              </Dialog>
            );
          })}
        </div>
      </section>
    );
  });
}
