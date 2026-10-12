import { DialogTrigger } from "@/components/dialog/DialogTrigger";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { MediaImage } from "@/components/media/MediaImage";
import { Icon } from "@/components/ui/Icon";
import type { MediaAsset } from "@/content/types";
import { cx } from "@/lib/cx";
import { formatIndex, type Locale } from "@/lib/i18n";
import type { Resolved } from "@/lib/localize";
import styles from "./ServiceCard.module.css";

export type ServiceCardData = {
  title: string;
  summary: string;
  image: Resolved<MediaAsset>;
};

type ServiceCardProps = {
  card: ServiceCardData;
  /** Zero-based position, shown as "01", "02"… */
  index: number;
  locale: Locale;
  /** `framed`: photo inside a glass bezel. `immersive`: full-bleed photo with a glass caption. */
  variant: "framed" | "immersive";
  sizes?: string;
  /** Makes the whole card open this dialog (Services page). */
  details?: { dialogId: string; label: string };
  /** Landscape card for the Services catalog (its list item must be a size container). */
  compact?: boolean;
  className?: string;
};

const FRAMED_SIZES = "(min-width: 1200px) 240px, (min-width: 640px) 310px, 78vw";
/** Tall immersive cards crop the photo's sides, so the image renders much wider than the card. */
const TALL_SIZES = "(min-width: 1200px) 720px, 640px";

/** Specialty / treatment card used on the homepage, About page and Services page. */
export function ServiceCard({
  card,
  index,
  locale,
  variant,
  sizes,
  details,
  compact = false,
  className,
}: ServiceCardProps) {
  const imageSizes = sizes ?? (variant === "immersive" && !compact ? TALL_SIZES : FRAMED_SIZES);
  const extraClass = cx(compact && styles.compact, className);
  const indexBadge = (
    <GlassPanel as="span" blur className={styles.index} aria-hidden="true">
      {formatIndex(index + 1, locale)}
    </GlassPanel>
  );

  // Visual cue only; the transparent trigger below covers the whole card.
  const cue = details && (
    <span className={styles.action} aria-hidden="true">
      {details.label}
      <Icon name="arrow" size={16} />
    </span>
  );

  const trigger = details && (
    <DialogTrigger target={details.dialogId} className={styles.trigger}>
      <span className="sr-only">
        {details.label}: {card.title}
      </span>
    </DialogTrigger>
  );

  if (variant === "framed") {
    return (
      <GlassPanel
        as="article"
        ink="mixed"
        className={cx(styles.card, styles.framed, details && styles.interactive, extraClass)}
      >
        <div className={styles.framedMedia}>
          <MediaImage image={card.image} sizes={imageSizes} />
          {indexBadge}
        </div>
        <div className={styles.framedBody}>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          <p className={styles.cardText}>{card.summary}</p>
          {cue}
        </div>
        {trigger}
      </GlassPanel>
    );
  }

  return (
    <article className={cx("ink-host", styles.card, styles.immersive, details && styles.interactive, extraClass)}>
      <MediaImage image={card.image} sizes={imageSizes} />
      <span className={styles.immersiveShade} aria-hidden="true" />
      {indexBadge}
      <GlassPanel ink="amber" inkSubtle className={styles.immersiveCaption}>
        <h3 className={styles.cardTitle}>{card.title}</h3>
        <p className={styles.cardText}>{card.summary}</p>
        {cue}
      </GlassPanel>
      {trigger}
    </article>
  );
}
