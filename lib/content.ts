import { cache } from "react";
import snapshotJson from "@/content/cms-snapshot.json";
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
  HomePageContent,
  ReviewsPageContent,
  ServicesPageContent,
  SiteContent,
  VideosPageContent,
} from "@/content/types";
import { videosPage } from "@/content/videos";
import { applySnapshot, type CmsSnapshot, type ContentTree } from "./cms/model";
import { fetchPublishedSite, toSnapshot } from "./cms/published";
import type { Locale } from "./i18n";
import { localize, type Resolved } from "./localize";
import { aboutDocument, assertRated, homeDocument, type AboutDocument, type HomeDocument } from "./resolve";
import type { RouteKey } from "./routes";

/**
 * Where content comes from.
 *
 * The typed files in `content/` are the defaults. Content published in the
 * CMS (Supabase) is applied on top of them when a page is rendered: pages are
 * cached and re-rendered right after each publish (lib/cms/published.ts), so
 * they stay fast and indexable while edits appear within seconds. The
 * snapshot pulled by `npm run cms:sync` is the fallback (see `docs/CMS.md`).
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

const bundledContent: ContentTree = {
  site: siteContent,
  home: homeContent,
  about: aboutContent,
  services: servicesPage,
  videos: videosPage,
  reviews: reviewsPage,
  articles: articlesPage,
  contact: contactPage,
};

/** The snapshot committed with the code (`npm run cms:sync`), used when Supabase cannot be reached. */
const committedSnapshot = snapshotJson as unknown as CmsSnapshot;

/**
 * Published CMS content: read live from Supabase (cached and refreshed on every
 * publish, see lib/cms/published.ts), or the committed snapshot as a fallback.
 */
const currentSnapshot = cache(async (): Promise<CmsSnapshot & { live: boolean }> => {
  const site = await fetchPublishedSite();
  return site ? { ...toSnapshot(site), live: true } : { ...committedSnapshot, live: false };
});

const currentContent = cache(async (): Promise<ContentTree> => applySnapshot(bundledContent, await currentSnapshot()));

/** Which published content the site shows, for /cms-build.json and the development live reload. */
export async function getCmsSnapshotInfo() {
  const snapshot = await currentSnapshot();
  return {
    enabled: snapshot.enabled,
    version: snapshot.version ?? null,
    syncedAt: snapshot.syncedAt ?? null,
    live: snapshot.live,
  };
}

const source: ContentSource = {
  getSiteContent: async () => (await currentContent()).site,
  getHomePage: async () => (await currentContent()).home,
  getAboutPage: async () => (await currentContent()).about,
  getServicesPage: async () => (await currentContent()).services,
  getVideosPage: async () => (await currentContent()).videos,
  getReviewsPage: async () => (await currentContent()).reviews,
  getArticlesPage: async () => (await currentContent()).articles,
  getContactPage: async () => (await currentContent()).contact,
};

export type Site = Resolved<SiteContent>;
export type Home = Resolved<HomeDocument>;
export type About = Resolved<AboutDocument>;
export type ServicesPage = Resolved<ServicesPageContent>;
export type VideosPage = Resolved<VideosPageContent>;
export type ReviewsPage = Resolved<ReviewsPageContent>;
export type ArticlesPage = Resolved<ArticlesPageContent>;
export type ContactPage = Resolved<ContactPageContent>;

const reviewsDocument = cache(async () => {
  const page = await source.getReviewsPage();
  assertRated(page.items);
  return page;
});

/** Everything the featured sections draw from. */
const contentTree = cache(async (): Promise<ContentTree> => {
  const [site, home, about, services, videos, reviews, articles, contact] = await Promise.all([
    source.getSiteContent(),
    source.getHomePage(),
    source.getAboutPage(),
    source.getServicesPage(),
    source.getVideosPage(),
    reviewsDocument(),
    source.getArticlesPage(),
    source.getContactPage(),
  ]);
  return { site, home, about, services, videos, reviews, articles, contact };
});

export const getSite = cache(
  async (locale: Locale): Promise<Site> => localize(await source.getSiteContent(), locale),
);

/** Navigation label of a page, e.g. for breadcrumbs. */
export function navLabel(site: Site, route: RouteKey): string {
  return site.navigation.find((item) => item.route === route)?.label ?? site.name;
}

export const getHome = cache(
  async (locale: Locale): Promise<Home> => localize(homeDocument(await contentTree()), locale),
);

export const getAbout = cache(
  async (locale: Locale): Promise<About> => localize(aboutDocument(await contentTree()), locale),
);

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
