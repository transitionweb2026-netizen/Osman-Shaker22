import { GlassPanel } from "@/components/glass/GlassPanel";
import { BrandMark } from "@/components/ui/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { siteContent } from "@/content/site";
import { localeSettings } from "@/lib/i18n";
import { localeHref } from "@/lib/routes";
import styles from "./LanguageGate.module.css";

type LanguageGateProps = {
  /** Bilingual message shown under the name. */
  message: { en: string; ar: string };
};

/** Bilingual, language-neutral screen used by the `/` entry page and the 404 page. */
export function LanguageGate({ message }: LanguageGateProps) {
  return (
    <main className={styles.gate}>
      <GlassPanel ink="mixed" animateInk grain className={styles.card}>
        <BrandMark idPrefix="gate-mark" size={64} />
        <h1 className={styles.names}>
          <span className={styles.nameEn}>{siteContent.name.en}</span>
          <span className={styles.nameAr} lang="ar" dir="rtl">
            {siteContent.name.ar}
          </span>
        </h1>
        <div className={styles.message}>
          <p>{message.en}</p>
          <p lang="ar" dir="rtl">
            {message.ar}
          </p>
        </div>
        <nav className={styles.choices} aria-label="Language / اللغة">
          <ButtonLink href={localeHref("en")} arrow>
            <span lang="en">{localeSettings.en.nativeName}</span>
          </ButtonLink>
          <ButtonLink href={localeHref("ar")} variant="glass">
            <span lang="ar">{localeSettings.ar.nativeName}</span>
          </ButtonLink>
        </nav>
      </GlassPanel>
    </main>
  );
}
