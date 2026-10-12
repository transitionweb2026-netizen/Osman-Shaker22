import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { PageHero } from "@/components/sections/PageHero";
import heroStyles from "@/components/sections/PageHero.module.css";
import { FaqSection } from "@/components/sections/reviews/FaqSection";
import { ReviewGrid } from "@/components/sections/reviews/ReviewGrid";
import { Icon } from "@/components/ui/Icon";
import { getReviewsPage, getSite, navLabel, type ReviewsPage as ReviewsPageData } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/reviews">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [site, page] = await Promise.all([getSite(locale), getReviewsPage(locale)]);
  return pageMetadata({ locale, path: "reviews/", ...page.seo, siteName: site.name });
}

/** FAQPage structured data with every visible question and answer. */
function faqJsonLd(faq: ReviewsPageData["faq"]): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.categories.flatMap((category) =>
      category.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
  };
  // Escaping "<" keeps the content from closing the script element
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function ReviewsPage({ params }: PageProps<"/[locale]/reviews">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [site, page] = await Promise.all([getSite(locale), getReviewsPage(locale)]);
  const jumpLinks = [
    { href: "#reviews", label: page.reviewsIntro.eyebrow },
    { href: "#faq", label: page.faq.eyebrow },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd(page.faq) }} />
      <PageHero locale={locale} site={site} content={page.hero} pageLabel={navLabel(site, "reviews")}>
        {/* Jump links to the reviews and the FAQ */}
        <ul className={heroStyles.links}>
          {jumpLinks.map((link) => (
            <li key={link.href}>
              <GlassPanel as="a" href={link.href} blur className={heroStyles.chip}>
                {link.label}
                <Icon name="arrowUp" size={16} />
              </GlassPanel>
            </li>
          ))}
        </ul>
      </PageHero>
      <ReviewGrid locale={locale} intro={page.reviewsIntro} reviews={page.items} ui={site.ui} />
      <FaqSection locale={locale} faq={page.faq} site={site} />
    </>
  );
}
