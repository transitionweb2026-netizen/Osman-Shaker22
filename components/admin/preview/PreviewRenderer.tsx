"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { About } from "@/components/sections/About";
import { AboutIntro } from "@/components/sections/about/AboutIntro";
import { CareerTimeline } from "@/components/sections/about/CareerTimeline";
import { Certificates } from "@/components/sections/about/Certificates";
import { Philosophy } from "@/components/sections/about/Philosophy";
import { ArticleLibrary } from "@/components/sections/articles/ArticleLibrary";
import { ContactSection } from "@/components/sections/contact/ContactSection";
import { FeaturedVideos } from "@/components/sections/FeaturedVideos";
import { FeatureShowcase } from "@/components/sections/FeatureShowcase";
import { FinalCta } from "@/components/sections/FinalCta";
import { Hero } from "@/components/sections/Hero";
import { IntroVideo } from "@/components/sections/IntroVideo";
import { PageHero } from "@/components/sections/PageHero";
import { PatientJourney } from "@/components/sections/PatientJourney";
import { FaqSection } from "@/components/sections/reviews/FaqSection";
import { ReviewGrid } from "@/components/sections/reviews/ReviewGrid";
import { ReviewsFaq } from "@/components/sections/ReviewsFaq";
import { ServiceGroups } from "@/components/sections/services/ServiceGroups";
import { Statistics } from "@/components/sections/Statistics";
import { VideoGrid } from "@/components/sections/videos/VideoGrid";
import { WhyChoose } from "@/components/sections/WhyChoose";
import type { CatalogKey, ContentTree, DocumentKey } from "@/lib/cms/model";
import { PREVIEW_READY, PREVIEW_UPDATE, previewTree, type PreviewMessage } from "@/lib/cms/preview";
import { localeSettings, type Locale } from "@/lib/i18n";
import { localize } from "@/lib/localize";
import { aboutDocument, homeDocument } from "@/lib/resolve";
import type { RouteKey } from "@/lib/routes";

/** Renders the section(s) a document or catalog appears in. */
function render(tree: ContentTree, message: PreviewMessage): ReactNode {
  const locale: Locale = message.locale;
  const site = localize(tree.site, locale);
  const label = (route: RouteKey) => site.navigation.find((item) => item.route === route)?.label ?? site.name;
  const home = () => localize(homeDocument(tree), locale);
  const about = () => localize(aboutDocument(tree), locale);
  const reviews = () => localize(tree.reviews, locale);

  const byCatalog: Record<CatalogKey, () => ReactNode> = {
    serviceGroups: () => <ServiceGroups locale={locale} groups={localize(tree.services.groups, locale)} site={site} />,
    services: () => byCatalog.serviceGroups(),
    videos: () => {
      const page = localize(tree.videos, locale);
      return <VideoGrid videos={page.items} ui={site.ui} title={page.listTitle} />;
    },
    reviews: () => {
      const page = reviews();
      return <ReviewGrid locale={locale} intro={page.reviewsIntro} reviews={page.items} ui={site.ui} />;
    },
    faqCategories: () => <FaqSection locale={locale} faq={reviews().faq} site={site} />,
    faqs: () => byCatalog.faqCategories(),
    articles: () => <ArticleLibrary page={localize(tree.articles, locale)} ui={site.ui} />,
    careerMilestones: () => <CareerTimeline locale={locale} content={about().career} />,
    certificates: () => <Certificates content={about().certificates} ui={site.ui} />,
  };

  const byDocument: Partial<Record<DocumentKey, () => ReactNode>> = {
    "shared.cta": () => <FinalCta site={site} />,
    "shared.introVideo": () => <IntroVideo content={home().introVideo} ui={site.ui} />,
    "home.hero": () => <Hero locale={locale} content={home().hero} site={site} />,
    "home.introVideo": () => <IntroVideo content={home().introVideo} ui={site.ui} />,
    "home.about": () => <About locale={locale} content={home().about} site={site} />,
    "home.statistics": () => <Statistics locale={locale} content={home().statistics} />,
    "home.specialties": () => (
      <FeatureShowcase id="specialties" variant="immersive" locale={locale} content={home().specialties} site={site} />
    ),
    "home.treatments": () => (
      <FeatureShowcase id="treatments" variant="immersive" locale={locale} content={home().treatments} site={site} />
    ),
    "home.journey": () => <PatientJourney locale={locale} content={home().journey} site={site} />,
    "home.whyChoose": () => <WhyChoose locale={locale} content={home().whyChoose} />,
    "home.videos": () => <FeaturedVideos locale={locale} content={home().videos} site={site} />,
    "home.reviews": () => <ReviewsFaq locale={locale} reviews={home().reviews} faq={home().faq} site={site} />,
    "home.faq": () => <ReviewsFaq locale={locale} reviews={home().reviews} faq={home().faq} site={site} />,
    "about.hero": () => <Hero locale={locale} content={about().hero} site={site} />,
    "about.intro": () => <AboutIntro content={about().intro} ui={site.ui} />,
    "about.specialties": () => (
      <FeatureShowcase id="specialties" variant="immersive" locale={locale} content={about().specialties} site={site} />
    ),
    "about.career": () => byCatalog.careerMilestones(),
    "about.certificates": () => byCatalog.certificates(),
    "about.philosophy": () => <Philosophy content={about().philosophy} site={site} />,
    "services.hero": () => (
      <PageHero locale={locale} site={site} content={localize(tree.services.hero, locale)} pageLabel={label("services")} />
    ),
    "videos.hero": () => (
      <PageHero locale={locale} site={site} content={localize(tree.videos.hero, locale)} pageLabel={label("videos")} />
    ),
    "videos.list": () => byCatalog.videos(),
    "reviews.hero": () => (
      <PageHero locale={locale} site={site} content={localize(tree.reviews.hero, locale)} pageLabel={label("reviews")} />
    ),
    "reviews.intro": () => byCatalog.reviews(),
    "reviews.faq": () => byCatalog.faqCategories(),
    "articles.hero": () => (
      <PageHero locale={locale} site={site} content={localize(tree.articles.hero, locale)} pageLabel={label("articles")} />
    ),
    "articles.settings": () => byCatalog.articles(),
    "contact.hero": () => (
      <PageHero locale={locale} site={site} content={localize(tree.contact.hero, locale)} pageLabel={label("contact")} />
    ),
    "contact.form": () => <ContactSection locale={locale} page={localize(tree.contact, locale)} site={site} />,
    "contact.actions": () => <ContactSection locale={locale} page={localize(tree.contact, locale)} site={site} />,
  };

  const { target } = message;
  const draw = target.kind === "catalog" ? byCatalog[target.catalog] : byDocument[target.key];
  return draw ? draw() : null;
}

/** Keeps a half-finished draft from blanking the preview. */
class PreviewBoundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previous: { resetKey: string }) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }

  render() {
    return this.state.failed ? (
      <p style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-muted, #9fb0c8)" }}>
        This draft can&rsquo;t be previewed yet — complete the highlighted fields. · لا يمكن معاينة هذه المسودة بعد.
      </p>
    ) : (
      this.props.children
    );
  }
}

export function PreviewRenderer() {
  const [state, setState] = useState<{ message: PreviewMessage; seq: number } | null>(null);
  const message = state?.message ?? null;

  useEffect(() => {
    // Only the CMS window that embeds this page may drive it
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      const data = event.data as PreviewMessage | undefined;
      if (data?.type === PREVIEW_UPDATE) setState((current) => ({ message: data, seq: (current?.seq ?? 0) + 1 }));
    };
    window.addEventListener("message", onMessage);
    if (window.parent !== window) window.parent.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!message) return;
    document.documentElement.lang = message.locale;
    document.documentElement.dir = localeSettings[message.locale].dir;
  }, [message]);

  if (!state || !message) return null;
  return (
    <main id="main" className="page-atmosphere" style={{ minBlockSize: "100vh" }}>
      <PreviewBoundary resetKey={String(state.seq)}>
        <PreviewContent message={message} />
      </PreviewBoundary>
    </main>
  );
}

/** Building the tree inside the boundary lets it catch errors from malformed drafts too. */
function PreviewContent({ message }: { message: PreviewMessage }) {
  return render(previewTree(message), message);
}
