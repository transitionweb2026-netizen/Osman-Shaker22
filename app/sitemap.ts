import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { localeHref, pagePaths } from "@/lib/routes";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return pagePaths.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}${localeHref(locale, path)}`]));
    return locales.map((locale) => ({
      url: `${siteUrl}${localeHref(locale, path)}`,
      alternates: { languages },
      changeFrequency: "monthly" as const,
      priority: path ? 0.8 : 1,
    }));
  });
}
