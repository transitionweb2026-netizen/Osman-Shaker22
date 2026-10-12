import { cx } from "@/lib/cx";
import styles from "./StarRating.module.css";

type StarRatingProps = {
  /** 1–5, or `null` while there is no genuine rating yet. */
  rating: number | null;
  /** Accessible text, e.g. "Rated 5 out of 5" or "Rating pending". */
  label: string;
  /** Visible note beside empty stars. */
  pendingLabel: string;
};

const STAR = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z";

/** Five stars filled up to the rating; outlined and marked "pending" when there is no rating yet. */
export function StarRating({ rating, label, pendingLabel }: StarRatingProps) {
  const filled = rating === null ? 0 : Math.round(rating);

  return (
    <div className={cx(styles.rating, rating === null && styles.pending)}>
      <span className={styles.stars} role="img" aria-label={label}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={cx(styles.star, star <= filled && styles.filled)}
          >
            <path d={STAR} />
          </svg>
        ))}
      </span>
      {rating === null && (
        <span className={styles.note} aria-hidden="true">
          {pendingLabel}
        </span>
      )}
    </div>
  );
}
