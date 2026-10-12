"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { LOCALE_STORAGE_KEY, localeSettings, locales, switchLocalePath, type Locale } from "@/lib/i18n";
import styles from "./LanguageSwitcher.module.css";

function rememberLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); switching still works.
  }
}

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
  className?: string;
};

/**
 * EN / AR switcher. Each option is a real link to the same page in the other
 * language, so it works without JavaScript and loads the correct `lang`/`dir`.
 */
export function LanguageSwitcher({ locale, label, className }: LanguageSwitcherProps) {
  const pathname = usePathname() ?? `/${locale}/`;
  const style = { "--active": locales.indexOf(locale) } as CSSProperties;

  return (
    <nav aria-label={label} className={cx(styles.switcher, className)} style={style}>
      <span className={styles.thumb} aria-hidden="true" />
      {locales.map((target) => {
        const { shortLabel, nativeName } = localeSettings[target];
        return (
          <a
            key={target}
            href={switchLocalePath(pathname, target)}
            hrefLang={target}
            lang={target}
            aria-current={target === locale ? "true" : undefined}
            className={styles.option}
            onClick={() => rememberLocale(target)}
          >
            {shortLabel}
            <span className="sr-only"> {nativeName}</span>
          </a>
        );
      })}
    </nav>
  );
}
