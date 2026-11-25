import { GlassPanel } from "@/components/glass/GlassPanel";
import { Icon } from "@/components/ui/Icon";
import type { Review } from "@/content/types";
import type { Site } from "@/lib/content";
import { cx } from "@/lib/cx";
import { formatNumber, type Locale } from "@/lib/i18n";
import type { Resolved } from "@/lib/localize";
import { StarRating } from "./StarRating";
import styles from "./ReviewCard.module.css";

type ReviewCardProps = {
  review: Resolved<Review>;
  locale: Locale;
  ui: Site["ui"];
  /** Tighter spacing for narrow grids (homepage). */
  compact?: boolean;
};

/**
 * Patient review. A review with a rating shows the stars its author gave;
 * without a rating no stars are shown. Placeholder entries are plain
 * statements (not quotations).
 */
export function ReviewCard({ review, locale, ui, compact = false }: ReviewCardProps) {
  const placeholder = Boolean(review.isPlaceholder);
  const rated = review.rating !== null;

  return (
    <GlassPanel as="article" ink="blue" className={cx(styles.review, compact && styles.compact)}>
      {(rated || !placeholder) && (
        <div className={styles.top}>
          {rated && (
            <StarRating
              rating={review.rating}
              label={ui.ratingLabel.replace("{rating}", formatNumber(review.rating ?? 0, locale))}
              pendingLabel={ui.ratingPending}
            />
          )}
          {!placeholder && <Icon name="quote" size={28} className={styles.mark} />}
        </div>
      )}
      {placeholder ? (
        <p className={cx(styles.text, styles.placeholderText)}>{review.text}</p>
      ) : (
        <blockquote className={styles.text}>{review.text}</blockquote>
      )}
      {review.reviewer && <p className={styles.reviewer}>{review.reviewer}</p>}
    </GlassPanel>
  );
}
