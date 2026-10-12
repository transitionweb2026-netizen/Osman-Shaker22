import type { CSSProperties } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { About } from "@/lib/content";
import { formatIndex, type Locale } from "@/lib/i18n";
import styles from "./CareerTimeline.module.css";

type CareerTimelineProps = {
  locale: Locale;
  content: About["career"];
};

/** Chronological milestones along a glowing spine; cards alternate sides on wide screens. */
export function CareerTimeline({ locale, content }: CareerTimelineProps) {
  return (
    <section id="career" className="section" aria-labelledby="career-title">
      <div className="container">
        <SectionHeading
          id="career-title"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          align="center"
        />

        <ol className={styles.timeline} data-reveal="fade">
          {content.milestones.map((milestone, index) => (
            <li
              key={milestone.id}
              className={styles.item}
              data-reveal
              style={{ "--reveal-delay": index * 140 } as CSSProperties}
            >
              <GlassPanel className={styles.node} aria-hidden="true">
                {formatIndex(index + 1, locale)}
              </GlassPanel>
              <GlassPanel ink={index % 2 ? "blue" : "mixed"} className={styles.card}>
                <p className={styles.period}>{milestone.period}</p>
                <h3 className={styles.title}>{milestone.title}</h3>
                <p className={styles.organization}>{milestone.organization}</p>
                {milestone.description && <p className={styles.description}>{milestone.description}</p>}
              </GlassPanel>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
