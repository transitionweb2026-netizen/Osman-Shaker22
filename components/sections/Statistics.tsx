import type { CSSProperties } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { StatCounter } from "@/components/media/StatCounter";
import type { Home } from "@/lib/content";
import { cx } from "@/lib/cx";
import { formatNumber, type Locale } from "@/lib/i18n";
import styles from "./Statistics.module.css";

type StatisticsProps = {
  locale: Locale;
  content: Home["statistics"];
};

export function Statistics({ locale, content }: StatisticsProps) {
  return (
    <section className={cx("section", styles.section)} aria-labelledby="stats-title">
      <div className="container">
        <GlassPanel ink="mixed" animateInk inkSpeed={20} grain className={styles.panel} data-reveal="scale">
          <div className={styles.head}>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2 id="stats-title" className={styles.title}>
              {content.title}
            </h2>
          </div>
          <ul className={styles.grid}>
            {content.items.map((item, index) => (
              <li
                key={item.id}
                className={styles.item}
                data-reveal
                style={{ "--reveal-delay": index * 110 } as CSSProperties}
              >
                <p className={styles.figure}>
                  <StatCounter value={item.value} locale={locale} className={styles.number} />
                  {item.suffix && (
                    <span className={styles.suffix} aria-hidden="true">
                      {item.suffix}
                    </span>
                  )}
                  <span className="sr-only">
                    {formatNumber(item.value, locale)}
                    {item.suffix}
                  </span>
                </p>
                <p className={styles.label}>{item.label}</p>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>
    </section>
  );
}
