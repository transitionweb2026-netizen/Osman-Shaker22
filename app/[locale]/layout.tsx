import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { RevealObserver } from "@/components/layout/RevealObserver";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSite } from "@/lib/content";
import { whatsappHref } from "@/lib/contact";
import { fontVariables } from "@/lib/fonts";
import { isLocale, localeSettings, locales } from "@/lib/i18n";
import { localeHref, resolveRoute } from "@/lib/routes";
import { allowIndexing, siteUrl } from "@/lib/site-url";
import "../globals.css";

// Only `/en/` and `/ar/` exist; both are generated at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: allowIndexing ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#040d1f",
  colorScheme: "dark",
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const site = await getSite(locale);
  const { contact, ui } = site;

  return (
    <html lang={locale} dir={localeSettings[locale].dir} className={fontVariables}>
      <body>
        <a href="#main" className="skip-link">
          {ui.skipToContent}
        </a>
        <SiteHeader
          locale={locale}
          brandName={site.name}
          brandRole={site.specialty}
          homeHref={localeHref(locale)}
          homeLabel={ui.homeLink}
          navigation={site.navigation
            .filter((item) => !item.hidden)
            .map((item) => ({
              key: item.route,
              label: item.label,
              href: resolveRoute(item.route, locale),
            }))}
          book={
            contact.whatsapp && site.quickActions.headerBookButton
              ? { href: whatsappHref(contact.whatsapp, contact.whatsappMessage), label: ui.bookConsultation }
              : null
          }
          ui={{
            mainNavigation: ui.mainNavigation,
            openMenu: ui.openMenu,
            closeMenu: ui.closeMenu,
            chooseLanguage: ui.chooseLanguage,
            comingSoon: ui.comingSoon,
            opensInNewTab: ui.opensInNewTab,
          }}
        />
        <main id="main" tabIndex={-1} className="page-atmosphere">
          {children}
        </main>
        <SiteFooter locale={locale} site={site} />
        <FloatingContact site={site} />
        <RevealObserver />
      </body>
    </html>
  );
}
