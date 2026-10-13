/**
 * Turns the stored content (featured ids, importance-ordered catalogs) into
 * what the page sections render. Pure functions shared by the static build
 * (`lib/content.ts`) and the CMS preview, so a preview matches the site.
 */
import type {
  AboutPageContent,
  Cta,
  FaqItem,
  FeaturedServices,
  HomePageContent,
  Review,
  SectionIntro,
  Service,
  Video,
} from "@/content/types";
import type { ContentTree } from "./cms/model";

/** How many entries of the importance-ordered catalogs the homepage shows (at most). */
export const HOME_VIDEO_COUNT = 3;
export const HOME_REVIEW_COUNT = 6;

/**
 * Looks up catalog entries by id. An unknown id (e.g. an unpublished service)
 * is left out with a warning rather than breaking the page.
 */
function pick<T extends { id: string }>(catalog: T[], ids: readonly string[], kind: string): T[] {
  return ids.flatMap((id) => {
    const item = catalog.find((entry) => entry.id === id);
    if (!item) console.warn(`[content] ${kind} "${id}" is featured but not available; it is left out.`);
    return item ? [item] : [];
  });
}

/** The most important entries of a catalog: its first `count` items, as catalogs are ordered by importance. */
function mostImportant<T>(catalog: T[], count: number): T[] {
  return catalog.slice(0, count);
}

export type FeaturedSection = SectionIntro & { items: Service[]; cta: Cta };

function resolveFeatured(featured: FeaturedServices, catalog: Service[]): FeaturedSection {
  const { serviceIds, ...rest } = featured;
  return { ...rest, items: pick(catalog, serviceIds, "service") };
}

/** Real reviews must carry the patient's own rating; only placeholders may leave it empty. */
export function assertRated(reviews: Review[]): Review[] {
  for (const review of reviews) {
    if (!review.isPlaceholder && review.rating === null) {
      throw new Error(`Review "${review.id}" needs the rating the patient gave (1–5) before it is published`);
    }
  }
  return reviews;
}

export type HomeDocument = Omit<HomePageContent, "specialties" | "treatments" | "videos" | "reviews" | "faq"> & {
  specialties: FeaturedSection;
  treatments: FeaturedSection;
  videos: SectionIntro & { items: Video[]; cta: Cta };
  reviews: SectionIntro & { items: Review[]; cta: Cta };
  faq: SectionIntro & { items: FaqItem[] };
};

export type AboutDocument = Omit<AboutPageContent, "specialties"> & { specialties: FeaturedSection };

const serviceCatalog = (tree: ContentTree) => tree.services.groups.flatMap((group) => group.services);

export function homeDocument(tree: ContentTree): HomeDocument {
  const { home } = tree;
  const services = serviceCatalog(tree);
  const faq = tree.reviews.faq.categories.flatMap((category) => category.items);
  const { faqIds, ...faqSection } = home.faq;
  return {
    ...home,
    specialties: resolveFeatured(home.specialties, services),
    treatments: resolveFeatured(home.treatments, services),
    // Same records as the Videos and Reviews & FAQs pages, so an edit updates both
    videos: { ...home.videos, items: mostImportant(tree.videos.items, HOME_VIDEO_COUNT) },
    reviews: { ...home.reviews, items: mostImportant(tree.reviews.items, HOME_REVIEW_COUNT) },
    faq: { ...faqSection, items: pick(faq, faqIds, "FAQ") },
  };
}

export function aboutDocument(tree: ContentTree): AboutDocument {
  return { ...tree.about, specialties: resolveFeatured(tree.about.specialties, serviceCatalog(tree)) };
}
