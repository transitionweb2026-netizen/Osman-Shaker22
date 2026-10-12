import { QuoteBlock } from "@/components/cards/QuoteBlock";
import { PortraitStack } from "@/components/media/PortraitStack";
import type { About, Site } from "@/lib/content";
import { cx } from "@/lib/cx";
import styles from "./Philosophy.module.css";

type PhilosophyProps = {
  content: About["philosophy"];
  site: Site;
};

/** Philosophy quotation beside the playing-card portrait (portrait on the end side). */
export function Philosophy({ content, site }: PhilosophyProps) {
  return (
    <section id="philosophy" className={cx("section", styles.section)} aria-label={content.eyebrow}>
      <div className={cx("container", styles.split)}>
        <div data-reveal>
          <QuoteBlock eyebrow={content.eyebrow} quote={content.quote} size="feature" />
        </div>
        <div className={styles.visual} data-reveal="scale">
          <PortraitStack portrait={content.portrait} name={site.name} role={site.specialty} />
        </div>
      </div>
    </section>
  );
}
