import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleLibrary } from "@/components/sections/articles/ArticleLibrary";
import { PageHero } from "@/components/sections/PageHero";
import { getArticlesPage, getSite, navLabel } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/articles">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [site, page] = await Promise.all([getSite(locale), getArticlesPage(locale)]);
  return pageMetadata({ locale, path: "articles/", ...page.seo, siteName: site.name });
}

export default async function ArticlesPage({ params }: PageProps<"/[locale]/articles">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, page] = await Promise.all([getSite(locale), getArticlesPage(locale)]);

  return (
    <>
      <PageHero locale={locale} site={site} content={page.hero} pageLabel={navLabel(site, "articles")} />
      <ArticleLibrary page={page} ui={site.ui} />
    </>
  );
}
