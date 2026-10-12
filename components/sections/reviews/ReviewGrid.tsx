import type { CSSProperties } from "react";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ReviewsPage, Site } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import styles from "./ReviewGrid.module.css";

type ReviewGridProps = {
  locale: Locale;
  intro: ReviewsPage["reviewsIntro"];
  reviews: ReviewsPage["items"];
  ui: Site["ui"];
};

/** Review cards in a balanced three-column layout (two on tablets, one on phones). */
export function ReviewGrid({ locale, intro, reviews, ui }: ReviewGridProps) {
  return (
    <section id="reviews" className="section" aria-labelledby="reviews-title">
      <div className="container">
        <SectionHeading id="reviews-title" eyebrow={intro.eyebrow} title={intro.title} description={intro.description} />
        <ul className={styles.grid}>
          {reviews.map((review, index) => (
            <li key={review.id} data-reveal style={{ "--reveal-delay": (index % 3) * 110 } as CSSProperties}>
              <ReviewCard review={review} locale={locale} ui={ui} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
