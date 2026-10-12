import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/sections/PageHero";
import { VideoGrid } from "@/components/sections/videos/VideoGrid";
import { getSite, getVideosPage, navLabel } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/videos">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [site, page] = await Promise.all([getSite(locale), getVideosPage(locale)]);
  return pageMetadata({ locale, path: "videos/", ...page.seo, siteName: site.name });
}

export default async function VideosPage({ params }: PageProps<"/[locale]/videos">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, page] = await Promise.all([getSite(locale), getVideosPage(locale)]);

  return (
    <>
      <PageHero locale={locale} site={site} content={page.hero} pageLabel={navLabel(site, "videos")} />
      <VideoGrid videos={page.items} ui={site.ui} title={page.listTitle} />
    </>
  );
}
