import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Fragment, type ReactNode } from "react";
import type { AboutSectionId } from "@/content/types";
import { AboutIntro } from "@/components/sections/about/AboutIntro";
import { CareerTimeline } from "@/components/sections/about/CareerTimeline";
import { Certificates } from "@/components/sections/about/Certificates";
import { Philosophy } from "@/components/sections/about/Philosophy";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { getAbout, getSite } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { ABOUT_SECTIONS, visibleSections } from "@/lib/layout";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [site, about] = await Promise.all([getSite(locale), getAbout(locale)]);
  return pageMetadata({ locale, path: "about/", ...about.seo, siteName: site.name });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, about] = await Promise.all([getSite(locale), getAbout(locale)]);

  // Order and visibility come from the content (`about.layout`)
  const sections: Record<AboutSectionId, ReactNode> = {
    intro: <AboutIntro content={about.intro} ui={site.ui} />,
    specialties: (
      <FeatureShowcase id="specialties" variant="immersive" locale={locale} content={about.specialties} site={site} />
    ),
    career: <CareerTimeline locale={locale} content={about.career} />,
    certificates: <Certificates content={about.certificates} ui={site.ui} />,
    philosophy: <Philosophy content={about.philosophy} site={site} />,
    cta: <FinalCta site={site} />,
  };

  return (
    <>
      <Hero locale={locale} content={about.hero} site={site} />
      {visibleSections(about.layout, ABOUT_SECTIONS).map((id) => (
        <Fragment key={id}>{sections[id]}</Fragment>
      ))}
    </>
  );
}
