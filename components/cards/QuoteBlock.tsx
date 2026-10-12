import { GlassPanel } from "@/components/glass/GlassPanel";
import { Icon } from "@/components/ui/Icon";
import type { Quote } from "@/content/types";
import { cx } from "@/lib/cx";
import type { Resolved } from "@/lib/localize";
import styles from "./QuoteBlock.module.css";

type QuoteBlockProps = {
  eyebrow: string;
  quote: Resolved<Quote>;
  /** `feature` sets the quotation larger (About page). */
  size?: "default" | "feature";
  /** No glass panel: the quotation sits directly on the page background. */
  bare?: boolean;
  className?: string;
};

/**
 * Editorial quotation on liquid glass. The attribution line appears only when
 * the wording has been approved (`attribution` is set in the content).
 */
export function QuoteBlock({ eyebrow, quote, size = "default", bare = false, className }: QuoteBlockProps) {
  const classes = cx(styles.quote, styles[size], bare && styles.bare, className);
  const content = (
    <>
      <span className={styles.mark} aria-hidden="true">
        <Icon name="quote" size={size === "feature" ? 56 : 44} />
      </span>
      <p className="eyebrow">{eyebrow}</p>
      <blockquote className={styles.text}>
        <p>{quote.text}</p>
      </blockquote>
      {quote.attribution && <figcaption className={styles.attribution}>{quote.attribution}</figcaption>}
      <span className={styles.rule} aria-hidden="true" />
    </>
  );

  return bare ? (
    <figure className={classes}>{content}</figure>
  ) : (
    <GlassPanel as="figure" ink="mixed" inkSubtle grain className={classes}>
      {content}
    </GlassPanel>
  );
}
