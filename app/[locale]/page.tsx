import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import type { HomeSectionId } from "@/content/types";
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
import { HOME_SECTIONS, visibleSections } from "@/lib/layout";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [site, home] = await Promise.all([getSite(locale), getHome(locale)]);
  const { title, description, ogImage, ogImageAlt, shareImage, noindex } = home.seo;
  return pageMetadata({
    locale,
    path: "",
    title,
    description,
    siteName: site.name,
    image: { url: ogImage, alt: ogImageAlt },
    shareImage,
    noindex,
  });
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, home] = await Promise.all([getSite(locale), getHome(locale)]);

  // Order and visibility come from the content (`home.layout`)
  const sections: Record<HomeSectionId, ReactNode> = {
    introVideo: <IntroVideo content={home.introVideo} ui={site.ui} />,
    about: <About locale={locale} content={home.about} site={site} />,
    statistics: <Statistics locale={locale} content={home.statistics} />,
    specialties: (
      <FeatureShowcase id="specialties" variant="immersive" locale={locale} content={home.specialties} site={site} />
    ),
    treatments: (
      <FeatureShowcase id="treatments" variant="immersive" locale={locale} content={home.treatments} site={site} />
    ),
    journey: <PatientJourney locale={locale} content={home.journey} site={site} />,
    whyChoose: <WhyChoose locale={locale} content={home.whyChoose} />,
    videos: <FeaturedVideos locale={locale} content={home.videos} site={site} />,
    reviewsFaq: <ReviewsFaq locale={locale} reviews={home.reviews} faq={home.faq} site={site} />,
    cta: <FinalCta site={site} />,
  };

  return (
    <>
      <Hero locale={locale} content={home.hero} site={site} />
      {visibleSections(home.layout, HOME_SECTIONS).map((id) => (
        <Fragment key={id}>{sections[id]}</Fragment>
      ))}
    </>
  );
}
