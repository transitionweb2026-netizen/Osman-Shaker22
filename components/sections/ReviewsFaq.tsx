import type { CSSProperties } from "react";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { FaqAccordion } from "@/components/media/FaqAccordion";
import { RouteButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Home, Site } from "@/lib/content";
import { cx } from "@/lib/cx";
import type { Locale } from "@/lib/i18n";
import styles from "./ReviewsFaq.module.css";

type ReviewsFaqProps = {
  locale: Locale;
  reviews: Home["reviews"];
  faq: Home["faq"];
  ui: Site["ui"];
};

/** Patient reviews and FAQs side by side; the grid follows the reading direction in Arabic. */
export function ReviewsFaq({ locale, reviews, faq, ui }: ReviewsFaqProps) {
  return (
    <div className="section">
      <div className={cx("container", styles.layout)}>
        <section id="reviews" className={styles.column} aria-labelledby="reviews-title">
          <SectionHeading
            id="reviews-title"
            eyebrow={reviews.eyebrow}
            title={reviews.title}
            description={reviews.description}
          />
          <ul className={styles.reviews}>
            {reviews.items.map((review, index) => (
              <li key={review.id} data-reveal style={{ "--reveal-delay": index * 100 } as CSSProperties}>
                <ReviewCard review={review} locale={locale} ui={ui} />
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" className={styles.column} aria-labelledby="faq-title">
          <SectionHeading id="faq-title" eyebrow={faq.eyebrow} title={faq.title} description={faq.description} />
          <div data-reveal>
            <FaqAccordion items={faq.items} />
          </div>
          <div className={styles.more} data-reveal>
            <RouteButton route={faq.cta.route} locale={locale} soonLabel={ui.comingSoon}>
              {faq.cta.label}
            </RouteButton>
          </div>
        </section>
      </div>
    </div>
  );
}
