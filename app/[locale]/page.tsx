import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { About } from "@/components/sections/About";
import { FeaturedVideos } from "@/components/sections/FeaturedVideos";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { IntroVideo } from "@/components/sections/IntroVideo";
import { PatientJourney } from "@/components/sections/PatientJourney";
import { ReviewsFaq } from "@/components/sections/ReviewsFaq";
import { Statistics } from "@/components/sections/Statistics";
import { WhyChoose } from "@/components/sections/WhyChoose";
import { getHome, getSite } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [site, home] = await Promise.all([getSite(locale), getHome(locale)]);
  const { title, description, ogImage, ogImageAlt } = home.seo;
  return pageMetadata({
    locale,
    path: "",
    title,
    description,
    siteName: site.name,
    image: { url: ogImage, alt: ogImageAlt },
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, home] = await Promise.all([getSite(locale), getHome(locale)]);

  return (
    <>
      <Hero content={home.hero} site={site} />
      <IntroVideo content={home.introVideo} ui={site.ui} />
      <About locale={locale} content={home.about} site={site} />
      <Statistics locale={locale} content={home.statistics} />
      <FeatureShowcase id="specialties" variant="immersive" locale={locale} content={home.specialties} site={site} />
      <FeatureShowcase id="treatments" variant="immersive" locale={locale} content={home.treatments} site={site} />
      <PatientJourney locale={locale} content={home.journey} site={site} />
      <WhyChoose locale={locale} content={home.whyChoose} />
      <FeaturedVideos locale={locale} content={home.videos} site={site} />
      <ReviewsFaq locale={locale} reviews={home.reviews} faq={home.faq} ui={site.ui} />
      <FinalCta site={site} />
    </>
  );
}
