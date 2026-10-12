import { GlassPanel } from "@/components/glass/GlassPanel";
import type { MediaAsset } from "@/content/types";
import { cx } from "@/lib/cx";
import type { Resolved } from "@/lib/localize";
import { MediaImage } from "./MediaImage";
import styles from "./PortraitStack.module.css";
import { TiltStage } from "./TiltStage";

type PortraitStackProps = {
  portrait: Resolved<MediaAsset>;
  name: string;
  role: string;
};

function CornerPips() {
  return (
    <>
      <span className={cx(styles.pip, styles.pipStart)} />
      <span className={cx(styles.pip, styles.pipEnd)} />
    </>
  );
}

/** The doctor's portrait as a playing card over fanned glass cards, with a gentle tilt. */
export function PortraitStack({ portrait, name, role }: PortraitStackProps) {
  return (
    <TiltStage className={styles.stage}>
      <div className={styles.deck}>
        <GlassPanel ink="amber" className={cx(styles.card, styles.back3)} aria-hidden="true">
          <CornerPips />
        </GlassPanel>
        <GlassPanel ink="blue" className={cx(styles.card, styles.back2)} aria-hidden="true">
          <CornerPips />
        </GlassPanel>
        <GlassPanel ink="mixed" animateInk className={cx(styles.card, styles.back1)} aria-hidden="true">
          <CornerPips />
        </GlassPanel>
        <figure className={cx(styles.card, styles.main)}>
          {/* The upright card crops the 3:2 photo's sides, so ~2× the card width is requested (lower it for a portrait-format photo) */}
          <MediaImage image={portrait} sizes="(min-width: 640px) 900px, 140vw" className={styles.photo} />
          <span className={styles.glare} aria-hidden="true" />
          <GlassPanel as="figcaption" blur className={styles.caption}>
            <span className={styles.captionName}>{name}</span>
            <span className={styles.captionRole}>{role}</span>
          </GlassPanel>
        </figure>
      </div>
    </TiltStage>
  );
}
