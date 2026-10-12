import type { Metadata } from "next";
import { ogImages } from "@/content/media";
import { localeSettings, locales, type Locale } from "./i18n";
import { localeHref } from "./routes";

type PageMetadataInput = {
  locale: Locale;
  /** Path below the locale prefix, e.g. `"services/"` (`""` for the homepage). */
  path: string;
  title: string;
  description: string;
  siteName: string;
  image?: { url: string; alt: string };
};

/** Localized metadata with canonical URL, hreflang alternates and Open Graph / Twitter cards. */
export function pageMetadata({ locale, path, title, description, siteName, image }: PageMetadataInput): Metadata {
  const ogImage = image ?? { url: ogImages[locale], alt: siteName };
  return {
    title,
    description,
    alternates: {
      canonical: localeHref(locale, path),
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, localeHref(l, path)])),
        "x-default": path ? localeHref("en", path) : "/",
      },
    },
    openGraph: {
      type: "website",
      url: localeHref(locale, path),
      siteName,
      title,
      description,
      locale: localeSettings[locale].ogLocale,
      alternateLocale: locales.filter((l) => l !== locale).map((l) => localeSettings[l].ogLocale),
      images: [{ url: ogImage.url, width: 1200, height: 630, alt: ogImage.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}
