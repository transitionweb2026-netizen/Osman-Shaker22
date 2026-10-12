import { cx } from "@/lib/cx";
import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  /** Id of the heading, referenced by the section's `aria-labelledby`. */
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
};

export function SectionHeading({ id, eyebrow, title, description, align = "start", className }: SectionHeadingProps) {
  return (
    <header className={cx(styles.heading, align === "center" && styles.center, className)} data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className={styles.title}>
        {title}
      </h2>
      {description && <p className={styles.description}>{description}</p>}
    </header>
  );
}
