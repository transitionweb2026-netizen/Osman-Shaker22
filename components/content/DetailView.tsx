import type { ReactNode } from "react";
import { MediaImage } from "@/components/media/MediaImage";
import type { MediaAsset } from "@/content/types";
import { cx } from "@/lib/cx";
import type { Resolved } from "@/lib/localize";
import styles from "./DetailView.module.css";

type DetailViewProps = {
  /** Id of the title, used by the dialog's `aria-labelledby`. */
  titleId: string;
  eyebrow: string;
  title: string;
  image: Resolved<MediaAsset>;
  /** Extra line under the title (e.g. reviewer). */
  meta?: ReactNode;
  /** Narrow reading column for articles. */
  reading?: boolean;
  children: ReactNode;
};

/** Layout inside service and article popups: image header, title, body. */
export function DetailView({ titleId, eyebrow, title, image, meta, reading = false, children }: DetailViewProps) {
  return (
    <article className={cx(styles.detail, reading && styles.reading)}>
      <div className={styles.media}>
        <MediaImage image={image} sizes="(min-width: 960px) 920px, 100vw" decorative />
      </div>
      <div className={styles.body}>
        <header className={styles.header}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {meta}
        </header>
        {children}
      </div>
    </article>
  );
}
