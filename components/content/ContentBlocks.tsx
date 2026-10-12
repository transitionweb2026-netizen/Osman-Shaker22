import type { ContentBlock } from "@/content/types";
import { cx } from "@/lib/cx";
import type { Resolved } from "@/lib/localize";
import styles from "./ContentBlocks.module.css";

type ContentBlocksProps = {
  blocks: Resolved<ContentBlock>[];
  /** Larger type and wider rhythm for articles. */
  reading?: boolean;
};

/** Renders structured long-form content (service details, articles). */
export function ContentBlocks({ blocks, reading = false }: ContentBlocksProps) {
  return (
    <div className={cx(styles.blocks, reading && styles.reading)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return <h3 key={index}>{block.text}</h3>;
          case "paragraph":
            return <p key={index}>{block.text}</p>;
          case "list":
            return (
              <ul key={index} className={styles.list}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            );
          case "note":
            return (
              <aside key={index} className={styles.note}>
                <p>{block.text}</p>
              </aside>
            );
        }
      })}
    </div>
  );
}
