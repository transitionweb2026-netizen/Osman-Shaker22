import { cache } from "react";
import { aboutContent } from "@/content/about";
import { articlesPage } from "@/content/articles";
import { contactPage } from "@/content/contact";
import { homeContent } from "@/content/home";
import { reviewsPage } from "@/content/reviews";
import { servicesPage } from "@/content/services";
import { siteContent } from "@/content/site";
import type {
  AboutPageContent,
  ArticlesPageContent,
  ContactPageContent,
  FaqItem,
  FeaturedServices,
  HomePageContent,
  Review,
  ReviewsPageContent,
  RouteCta,
  SectionIntro,
  Service,
  ServicesPageContent,
  SiteContent,
  Video,
  VideosPageContent,
} from "@/content/types";
import { videosPage } from "@/content/videos";
import type { Locale } from "./i18n";
import { localize, type Resolved } from "./localize";
import type { RouteKey } from "./routes";

/**
 * Where content comes from.
 *
 * Today this is the typed files in `content/`. A Supabase source can implement
 * the same interface later (see `docs/SUPABASE.md`); it runs during
 * `next build`, so the exported HTML stays fully static and indexable.
 */
export interface ContentSource {
  getSiteContent(): Promise<SiteContent>;
  getHomePage(): Promise<HomePageContent>;
  getAboutPage(): Promise<AboutPageContent>;
  getServicesPage(): Promise<ServicesPageContent>;
  getVideosPage(): Promise<VideosPageContent>;
  getReviewsPage(): Promise<ReviewsPageContent>;
  getArticlesPage(): Promise<ArticlesPageContent>;
  getContactPage(): Promise<ContactPageContent>;
}

const staticContentSource: ContentSource = {
  getSiteContent: async () => siteContent,
  getHomePage: async () => homeContent,
  getAboutPage: async () => aboutContent,
  getServicesPage: async () => servicesPage,
  getVideosPage: async () => videosPage,
  getReviewsPage: async () => reviewsPage,
  getArticlesPage: async () => articlesPage,
  getContactPage: async () => contactPage,
};

const source: ContentSource = staticContentSource;

/** Looks up catalog entries by id; an unknown id fails the build instead of publishing a broken card. */
function pick<T extends { id: string }>(catalog: T[], ids: readonly string[], kind: string): T[] {
  return ids.map((id) => {
    const item = catalog.find((entry) => entry.id === id);
    if (!item) throw new Error(`Unknown ${kind} id "${id}"`);
    return item;
  });
}

type FeaturedSection = SectionIntro & { items: Service[]; cta: RouteCta };

function resolveFeatured(featured: FeaturedServices, catalog: Service[]): FeaturedSection {
  const { serviceIds, ...rest } = featured;
  return { ...rest, items: pick(catalog, serviceIds, "service") };
}

/** Real reviews must carry the patient's own rating; only placeholders may leave it empty. */
function assertRated(reviews: Review[]): Review[] {
  for (const review of reviews) {
    if (!review.isPlaceholder && review.rating === null) {
      throw new Error(`Review "${review.id}" needs the rating the patient gave (1–5) before it is published`);
    }
  }
  return reviews;
}

type HomeDocument = Omit<HomePageContent, "specialties" | "treatments" | "videos" | "reviews" | "faq"> & {
  specialties: FeaturedSection;
  treatments: FeaturedSection;
  videos: SectionIntro & { items: Video[]; cta: RouteCta };
  reviews: SectionIntro & { items: Review[] };
  faq: SectionIntro & { items: FaqItem[]; cta: RouteCta };
};

type AboutDocument = Omit<AboutPageContent, "specialties"> & { specialties: FeaturedSection };

export type Site = Resolved<SiteContent>;
export type Home = Resolved<HomeDocument>;
export type About = Resolved<AboutDocument>;
export type ServicesPage = Resolved<ServicesPageContent>;
export type VideosPage = Resolved<VideosPageContent>;
export type ReviewsPage = Resolved<ReviewsPageContent>;
export type ArticlesPage = Resolved<ArticlesPageContent>;
export type ContactPage = Resolved<ContactPageContent>;

const serviceCatalog = cache(async () => (await source.getServicesPage()).groups.flatMap((group) => group.services));

const reviewsDocument = cache(async () => {
  const page = await source.getReviewsPage();
  assertRated(page.items);
  return page;
});

const faqCatalog = cache(async () => (await reviewsDocument()).faq.categories.flatMap((category) => category.items));

export const getSite = cache(
  async (locale: Locale): Promise<Site> => localize(await source.getSiteContent(), locale),
);

/** Navigation label of a page, e.g. for breadcrumbs. */
export function navLabel(site: Site, route: RouteKey): string {
  return site.navigation.find((item) => item.route === route)?.label ?? site.name;
}

export const getHome = cache(async (locale: Locale): Promise<Home> => {
  const [home, services, videos, reviews, faq] = await Promise.all([
    source.getHomePage(),
    serviceCatalog(),
    source.getVideosPage(),
    reviewsDocument(),
    faqCatalog(),
  ]);
  const { videoIds, ...videoSection } = home.videos;
  const { reviewIds, ...reviewSection } = home.reviews;
  const { faqIds, ...faqSection } = home.faq;
  const document: HomeDocument = {
    ...home,
    specialties: resolveFeatured(home.specialties, services),
    treatments: resolveFeatured(home.treatments, services),
    videos: { ...videoSection, items: pick(videos.items, videoIds, "video") },
    reviews: { ...reviewSection, items: pick(reviews.items, reviewIds, "review") },
    faq: { ...faqSection, items: pick(faq, faqIds, "FAQ") },
  };
  return localize(document, locale);
});

export const getAbout = cache(async (locale: Locale): Promise<About> => {
  const [about, services] = await Promise.all([source.getAboutPage(), serviceCatalog()]);
  const document: AboutDocument = { ...about, specialties: resolveFeatured(about.specialties, services) };
  return localize(document, locale);
});

export const getServicesPage = cache(
  async (locale: Locale): Promise<ServicesPage> => localize(await source.getServicesPage(), locale),
);

export const getVideosPage = cache(
  async (locale: Locale): Promise<VideosPage> => localize(await source.getVideosPage(), locale),
);

export const getReviewsPage = cache(
  async (locale: Locale): Promise<ReviewsPage> => localize(await reviewsDocument(), locale),
);

export const getArticlesPage = cache(
  async (locale: Locale): Promise<ArticlesPage> => localize(await source.getArticlesPage(), locale),
);

export const getContactPage = cache(
  async (locale: Locale): Promise<ContactPage> => localize(await source.getContactPage(), locale),
);
