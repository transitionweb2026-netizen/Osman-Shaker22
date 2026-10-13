import type { Metadata } from "next";
import { ogImages } from "@/content/media";
import type { MediaAsset } from "@/content/types";
import { localeSettings, locales, type Locale } from "./i18n";
import type { Resolved } from "./localize";
import { shareImageUrl } from "./media";
import { localeHref } from "./routes";
import { allowIndexing } from "./site-url";

type PageMetadataInput = {
  locale: Locale;
  /** Path below the locale prefix, e.g. `"services/"` (`""` for the homepage). */
  path: string;
  title: string;
  description: string;
  siteName: string;
  /** Fallback sharing image (defaults to the site's generated one). */
  image?: { url: string; alt: string };
  /** Sharing image chosen in the content; takes precedence over `image`. */
  shareImage?: Resolved<MediaAsset> | null;
  /** Page-level "do not index" (the site-wide launch setting still applies on top). */
  noindex?: boolean;
};

/** Localized metadata with canonical URL, hreflang alternates and Open Graph / Twitter cards. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  siteName,
  image,
  shareImage,
  noindex,
}: PageMetadataInput): Metadata {
  const ogImage = shareImage
    ? { url: shareImageUrl(shareImage.src), alt: shareImage.alt }
    : (image ?? { url: ogImages[locale], alt: siteName });
  return {
    title,
    description,
    // Without a page-level value the layout's site-wide setting applies.
    ...(noindex ? { robots: { index: false, follow: allowIndexing } } : {}),
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
