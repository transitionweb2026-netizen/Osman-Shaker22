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
};

/**
 * Patient review with its star rating. A real review shows the rating its
 * author gave; placeholder entries are plain statements (not quotations) with
 * empty stars marked "rating pending".
 */
export function ReviewCard({ review, locale, ui }: ReviewCardProps) {
  const placeholder = Boolean(review.isPlaceholder);
  const ratingLabel =
    review.rating === null
      ? ui.ratingPending
      : ui.ratingLabel.replace("{rating}", formatNumber(review.rating, locale));

  return (
    <GlassPanel as="article" ink="blue" className={styles.review}>
      <div className={styles.top}>
        <StarRating rating={review.rating} label={ratingLabel} pendingLabel={ui.ratingPending} />
        {!placeholder && <Icon name="quote" size={28} className={styles.mark} />}
      </div>
      {placeholder ? (
        <p className={cx(styles.text, styles.placeholderText)}>{review.text}</p>
      ) : (
        <blockquote className={styles.text}>{review.text}</blockquote>
      )}
      {review.reviewer && <p className={styles.reviewer}>{review.reviewer}</p>}
    </GlassPanel>
  );
}
