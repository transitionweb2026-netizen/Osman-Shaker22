"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import styles from "./FaqAccordion.module.css";

type FaqAccordionProps = {
  items: { id: string; question: string; answer: string }[];
  /** Heading level of the questions: 4 when the accordion sits under a topic heading. */
  level?: 3 | 4;
  /** Start with the first question open. */
  openFirst?: boolean;
};

/** WAI-ARIA accordion: one panel open at a time, arrow keys move between questions. */
export function FaqAccordion({ items, level = 3, openFirst = true }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(openFirst ? (items[0]?.id ?? null) : null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const Heading = level === 4 ? "h4" : "h3";

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const target = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  };

  return (
    <GlassPanel strong className={styles.list}>
      {items.map((item, index) => {
        const open = openId === item.id;
        const triggerId = `faq-trigger-${item.id}`;
        const panelId = `faq-panel-${item.id}`;
        return (
          <div key={item.id} className={cx(styles.item, open && styles.open)}>
            <Heading className={styles.heading}>
              <button
                ref={(el) => {
                  triggers.current[index] = el;
                }}
                id={triggerId}
                type="button"
                className={styles.trigger}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <span>{item.question}</span>
                <span className={styles.toggle} aria-hidden="true">
                  <Icon name="plus" size={18} />
                </span>
              </button>
            </Heading>
            <div id={panelId} role="region" aria-labelledby={triggerId} className={styles.panel}>
              <div className={styles.panelInner}>
                <p className={styles.answer}>{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </GlassPanel>
  );
}
