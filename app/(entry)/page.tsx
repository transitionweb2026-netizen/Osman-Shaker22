import type { Metadata } from "next";
import { LanguageGate } from "@/components/layout/LanguageGate";
import { siteContent } from "@/content/site";
import { LOCALE_STORAGE_KEY, defaultLocale, locales } from "@/lib/i18n";
import { localeHref } from "@/lib/routes";

export const metadata: Metadata = {
  title: `${siteContent.name.en} | ${siteContent.name.ar}`,
  description: `${siteContent.description.en} ${siteContent.description.ar}`,
  alternates: {
    canonical: "/",
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, localeHref(l)])),
      "x-default": "/",
    },
  },
  // A redirecting language chooser — the localized homepages are the pages to index.
  robots: { index: false, follow: true },
};

/*
 * Static, server-free language selection: a saved choice wins, otherwise the
 * browser's first preferred language, otherwise the default. Runs before the
 * page paints. Without JavaScript the bilingual chooser below is shown.
 */
const redirectScript = `(function(){var s=${JSON.stringify(locales)},l;try{l=localStorage.getItem(${JSON.stringify(
  LOCALE_STORAGE_KEY,
)})}catch(e){}if(s.indexOf(l)<0){var p=((navigator.languages&&navigator.languages[0])||navigator.language||"").toLowerCase().slice(0,2);l=s.indexOf(p)<0?${JSON.stringify(
  defaultLocale,
)}:p}location.replace("/"+l+"/"+location.hash)})();`;

export default function EntryPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: redirectScript }} />
      <LanguageGate
        message={{
          en: "Please choose your language.",
          ar: "يُرجى اختيار اللغة.",
        }}
      />
    </>
  );
}
