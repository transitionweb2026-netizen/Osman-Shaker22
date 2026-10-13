import type { CSSProperties } from "react";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { FaqAccordion } from "@/components/media/FaqAccordion";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Home, Site } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import styles from "./ReviewsFaq.module.css";

type ReviewsFaqProps = {
  locale: Locale;
  reviews: Home["reviews"];
  faq: Home["faq"];
  site: Site;
};

/**
 * Patient reviews and FAQs as two equal columns whose headings and content
 * line up (the grid follows the reading direction in Arabic), with one button
 * to the Reviews & FAQs page centered beneath both.
 */
export function ReviewsFaq({ locale, reviews, faq, site }: ReviewsFaqProps) {
  const { ui } = site;
  return (
    <div className="section">
      <div className="container">
        <div className={styles.layout}>
          <section id="reviews" className={styles.column} aria-labelledby="reviews-title">
            <SectionHeading
              id="reviews-title"
              eyebrow={reviews.eyebrow}
              title={reviews.title}
              description={reviews.description}
            />
            {/* Phones: a swipeable row; larger screens: a 2 × 3 grid */}
            <div className={styles.rail} role="region" aria-label={`${reviews.title} — ${ui.scrollHint}`} tabIndex={0}>
              <ul className={styles.reviews}>
                {reviews.items.map((review, index) => (
                  <li key={review.id} data-reveal style={{ "--reveal-delay": (index % 2) * 100 } as CSSProperties}>
                    <ReviewCard review={review} locale={locale} ui={ui} compact />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="faq" className={styles.column} aria-labelledby="faq-title">
            <SectionHeading id="faq-title" eyebrow={faq.eyebrow} title={faq.title} description={faq.description} />
            <div data-reveal>
              <FaqAccordion items={faq.items} />
            </div>
          </section>
        </div>

        {!reviews.cta.hidden && (
          <div className={styles.more} data-reveal>
            <CtaButton cta={reviews.cta} locale={locale} site={site} />
          </div>
        )}
      </div>
    </div>
  );
}
