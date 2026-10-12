import type { CSSProperties } from "react";
import { QuoteBlock } from "@/components/cards/QuoteBlock";
import { VideoFrame } from "@/components/media/VideoFrame";
import type { About, Site } from "@/lib/content";
import { cx } from "@/lib/cx";
import styles from "./AboutIntro.module.css";

type AboutIntroProps = {
  content: About["intro"];
  ui: Site["ui"];
};

/** Quotation beside the introduction video (video on the end side), both directly on the page background. */
export function AboutIntro({ content, ui }: AboutIntroProps) {
  return (
    <section id="introduction" className="section" aria-label={content.eyebrow}>
      <div className={cx("container", styles.split)}>
        <div data-reveal>
          <QuoteBlock eyebrow={content.eyebrow} quote={content.quote} size="feature" bare />
        </div>
        <div data-reveal="scale" style={{ "--reveal-delay": 120 } as CSSProperties}>
          <VideoFrame video={content.video} ui={ui} sizes="(min-width: 1024px) 720px, 94vw" bare />
        </div>
      </div>
    </section>
  );
}
