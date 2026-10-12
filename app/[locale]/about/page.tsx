import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutIntro } from "@/components/sections/about/AboutIntro";
import { CareerTimeline } from "@/components/sections/about/CareerTimeline";
import { Certificates } from "@/components/sections/about/Certificates";
import { Philosophy } from "@/components/sections/about/Philosophy";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { getAbout, getSite } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
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

  return (
    <>
      <Hero content={about.hero} site={site} secondaryHref="#career" />
      <AboutIntro content={about.intro} ui={site.ui} />
      <FeatureShowcase id="specialties" variant="immersive" locale={locale} content={about.specialties} site={site} />
      <CareerTimeline locale={locale} content={about.career} />
      <Certificates content={about.certificates} ui={site.ui} />
      <Philosophy content={about.philosophy} site={site} />
      <FinalCta site={site} />
    </>
  );
}
