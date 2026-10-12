export const locales = ["en", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Key used to remember the visitor's language choice for the `/` entry page. */
export const LOCALE_STORAGE_KEY = "preferred-locale";

export type Direction = "ltr" | "rtl";

type LocaleSettings = {
  dir: Direction;
  /** Name of the language in that language, e.g. for the switcher. */
  nativeName: string;
  shortLabel: string;
  /** BCP 47 tag used for `Intl` number formatting. */
  intl: string;
  ogLocale: string;
};

export const localeSettings: Record<Locale, LocaleSettings> = {
  en: { dir: "ltr", nativeName: "English", shortLabel: "EN", intl: "en-US", ogLocale: "en_US" },
  // Arabic-Indic digits for figures; phone numbers stay in Latin digits (see `content/site.ts`).
  ar: { dir: "rtl", nativeName: "العربية", shortLabel: "AR", intl: "ar-EG-u-nu-arab", ogLocale: "ar_EG" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(localeSettings[locale].intl).format(value);
}

/**
 * Ordinal label for numbered items: "01" in English. Arabic keeps "١" —
 * the Arabic-Indic zero is a dot, so a padded "٠١" would read like a decimal.
 */
export function formatIndex(position: number, locale: Locale): string {
  const label = formatNumber(position, locale);
  return locale === "en" ? label.padStart(2, "0") : label;
}

/** Path of the current page in another locale, e.g. `/en/about/` -> `/ar/about/`. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  if (segments.length > 1 && isLocale(segments[1])) {
    segments[1] = target;
    const path = segments.join("/");
    return path.endsWith("/") ? path : `${path}/`;
  }
  return `/${target}/`;
}
