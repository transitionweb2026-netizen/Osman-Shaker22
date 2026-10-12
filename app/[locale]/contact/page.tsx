import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactSection } from "@/components/sections/contact/ContactSection";
import { PageHero } from "@/components/sections/PageHero";
import { getContactPage, getSite, navLabel } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [site, page] = await Promise.all([getSite(locale), getContactPage(locale)]);
  return pageMetadata({ locale, path: "contact/", ...page.seo, siteName: site.name });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, page] = await Promise.all([getSite(locale), getContactPage(locale)]);

  return (
    <>
      <PageHero locale={locale} site={site} content={page.hero} pageLabel={navLabel(site, "contact")} />
      <ContactSection locale={locale} page={page} site={site} />
    </>
  );
}
