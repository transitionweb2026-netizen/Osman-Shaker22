import { GlassPanel } from "@/components/glass/GlassPanel";
import { MediaImage } from "@/components/media/MediaImage";
import { ButtonLink } from "@/components/ui/Button";
import type { Site } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/contact";
import styles from "./FinalCta.module.css";

type FinalCtaProps = {
  site: Site;
};

/** Consultation card shared by several pages; content lives in `site.cta`. */
export function FinalCta({ site }: FinalCtaProps) {
  const content = site.cta;
  const { phone, whatsapp, whatsappMessage } = site.contact;

  return (
    <section id="contact" className="section" aria-labelledby="cta-title">
      <div className="container">
        <GlassPanel ink="mixed" animateInk inkSpeed={22} grain className={styles.card} data-reveal="scale">
          <div className={styles.visual}>
            <MediaImage image={content.image} sizes="(min-width: 1024px) 560px, 92vw" />
          </div>
          <div className={styles.text}>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 id="cta-title" className={styles.title}>
              {content.title}
            </h2>
            <p className={styles.description}>{content.description}</p>
            <div className={styles.actions}>
              {whatsapp && (
                <ButtonLink
                  href={whatsappHref(whatsapp, whatsappMessage)}
                  icon="whatsapp"
                  size="lg"
                  newTabHint={site.ui.opensInNewTab}
                >
                  {content.whatsappLabel}
                </ButtonLink>
              )}
              {phone && (
                <ButtonLink href={telHref(phone)} icon="phone" variant="glass" size="lg">
                  {content.callLabel}
                </ButtonLink>
              )}
            </div>
            {phone && (
              <p className={styles.phoneLine}>
                <span>{site.ui.phone}</span>
                <a href={telHref(phone)} className="ltr">
                  {phone.display}
                </a>
              </p>
            )}
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
