import type { ContentBlock } from "@/content/types";
import { cx } from "@/lib/cx";
import type { Resolved } from "@/lib/localize";
import styles from "./ContentBlocks.module.css";

type ContentBlocksProps = {
  blocks: Resolved<ContentBlock>[];
  /** Larger type and wider rhythm for articles. */
  reading?: boolean;
};

/** Text written in this language (blocks may be filled in one language only). */
const filled = (text: unknown): text is string => typeof text === "string" && text.trim().length > 0;

/**
 * Renders structured long-form content (service details, articles).
 * Blocks, and list points, that are empty in the current language are skipped.
 */
export function ContentBlocks({ blocks, reading = false }: ContentBlocksProps) {
  return (
    <div className={cx(styles.blocks, reading && styles.reading)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return filled(block.text) ? <h3 key={index}>{block.text}</h3> : null;
          case "paragraph":
            return filled(block.text) ? <p key={index}>{block.text}</p> : null;
          case "list": {
            const items = (Array.isArray(block.items) ? block.items : []).filter(filled);
            return items.length ? (
              <ul key={index} className={styles.list}>
                {items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            ) : null;
          }
          case "note":
            return filled(block.text) ? (
              <aside key={index} className={styles.note}>
                <p>{block.text}</p>
              </aside>
            ) : null;
          default:
            return null;
        }
      })}
    </div>
  );
}
