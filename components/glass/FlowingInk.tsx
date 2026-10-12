import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import styles from "./FlowingInk.module.css";

export type InkPalette = "mixed" | "blue" | "amber";

type FlowingInkProps = {
  palette?: InkPalette;
  /** Flow continuously. Otherwise ink only moves while its container is hovered or focused. */
  animate?: boolean;
  subtle?: boolean;
  /** Base cycle length in seconds. */
  speed?: number;
};

/** Decorative pigment layer. Place inside a positioned `.glass` element. */
export function FlowingInk({ palette = "mixed", animate = false, subtle = false, speed }: FlowingInkProps) {
  const style = speed ? ({ "--ink-speed": `${speed}s` } as CSSProperties) : undefined;
  return (
    <span
      className={cx(styles.ink, styles[palette], animate && styles.animate, subtle && styles.subtle)}
      style={style}
      aria-hidden="true"
    >
      <span className={styles.plume} />
      <span className={styles.plume} />
      <span className={styles.plume} />
    </span>
  );
}
