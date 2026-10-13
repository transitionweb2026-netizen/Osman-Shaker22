/**
 * How CMS records map onto the website's content.
 *
 * The site renders a `ContentTree` (the shapes in `content/types.ts`). The CMS
 * stores the same values as separate records:
 *   - documents: one page section or shared setting each (`home.hero`, `settings.contact`…)
 *   - catalogs:  repeatable entries with a stable slug (services, videos, reviews…)
 *
 * Every binding below can `read` its value from a tree (defaults, and the
 * "import current website" action) and `write` a published value back into
 * a tree (the static build). This file is the single place that defines that
 * mapping; it has no browser or server dependencies.
 */
import type {
  AboutPageContent,
  Article,
  ArticlesPageContent,
  CareerMilestone,
  Certificate,
  ContactPageContent,
  FaqCategory,
  FaqItem,
  HomePageContent,
  Review,
  ReviewsPageContent,
  Service,
  ServiceGroup,
  ServicesPageContent,
  SiteContent,
  Video,
  VideosPageContent,
} from "@/content/types";

export type ContentTree = {
  site: SiteContent;
  home: HomePageContent;
  about: AboutPageContent;
  services: ServicesPageContent;
  videos: VideosPageContent;
  reviews: ReviewsPageContent;
  articles: ArticlesPageContent;
  contact: ContactPageContent;
};

export type PageKey = keyof ContentTree;

type Json = Record<string, unknown>;

type Binding = {
  read: (tree: ContentTree) => Json;
  write: (tree: ContentTree, value: Json) => void;
};

/** A whole sub-object, e.g. `home.hero`. */
function whole<P extends PageKey, K extends keyof ContentTree[P]>(page: P, prop: K): Binding {
  return {
    read: (tree) => tree[page][prop] as Json,
    write: (tree, value) => {
      tree[page][prop] = value as ContentTree[P][K];
    },
  };
}

/** Some properties of an object (the rest stays as in the tree). */
function some(get: (tree: ContentTree) => object, props: readonly string[]): Binding {
  return {
    read: (tree) => {
      const source = get(tree) as Json;
      return Object.fromEntries(props.filter((prop) => prop in source).map((prop) => [prop, source[prop]]));
    },
    write: (tree, value) => {
      const target = get(tree) as Json;
      for (const prop of props) if (prop in value) target[prop] = value[prop];
    },
  };
}

/** A list wrapped as `{ items: [...] }` (documents are always objects). */
function list(get: (tree: ContentTree) => unknown[], set: (tree: ContentTree, items: unknown[]) => void): Binding {
  return {
    read: (tree) => ({ items: get(tree) }),
    write: (tree, value) => {
      if (Array.isArray(value.items)) set(tree, value.items);
    },
  };
}

export const documentBindings = {
  // Site-wide settings (administrators only)
  "settings.identity": some((t) => t.site, ["name", "specialty", "description"]),
  "settings.contact": whole("site", "contact"),
  "settings.socials": list(
    (t) => t.site.socials,
    (t, items) => (t.site.socials = items as SiteContent["socials"]),
  ),
  "settings.navigation": list(
    (t) => t.site.navigation,
    (t, items) => (t.site.navigation = items as SiteContent["navigation"]),
  ),
  "settings.quickActions": whole("site", "quickActions"),
  "settings.footer": whole("site", "footer"),
  "settings.ui": {
    read: (tree) => tree.site.ui as unknown as Json,
    // Merge, so labels added to the code later keep their defaults
    write: (tree, value) => {
      tree.site.ui = { ...tree.site.ui, ...(value as Partial<SiteContent["ui"]>) };
    },
  },

  // Content shared by several pages
  "shared.cta": whole("site", "cta"),
  "shared.introVideo": {
    read: (tree) => tree.home.introVideo.video as unknown as Json,
    write: (tree, value) => {
      tree.home.introVideo.video = value as unknown as Video;
      tree.about.intro.video = value as unknown as Video;
    },
  },

  // Homepage
  "home.seo": whole("home", "seo"),
  "home.layout": whole("home", "layout"),
  "home.hero": whole("home", "hero"),
  "home.introVideo": some((t) => t.home.introVideo, ["eyebrow", "title", "description"]),
  "home.about": whole("home", "about"),
  "home.statistics": whole("home", "statistics"),
  "home.specialties": whole("home", "specialties"),
  "home.treatments": whole("home", "treatments"),
  "home.journey": whole("home", "journey"),
  "home.whyChoose": whole("home", "whyChoose"),
  "home.videos": whole("home", "videos"),
  "home.reviews": whole("home", "reviews"),
  "home.faq": whole("home", "faq"),

  // About the Doctor
  "about.seo": whole("about", "seo"),
  "about.layout": whole("about", "layout"),
  "about.hero": whole("about", "hero"),
  "about.intro": some((t) => t.about.intro, ["eyebrow", "quote"]),
  "about.specialties": whole("about", "specialties"),
  "about.career": some((t) => t.about.career, ["eyebrow", "title", "description"]),
  "about.certificates": some((t) => t.about.certificates, ["eyebrow", "title", "description"]),
  "about.philosophy": whole("about", "philosophy"),

  // Services
  "services.seo": whole("services", "seo"),
  "services.layout": whole("services", "layout"),
  "services.hero": whole("services", "hero"),

  // Videos
  "videos.seo": whole("videos", "seo"),
  "videos.hero": whole("videos", "hero"),
  "videos.list": some((t) => t.videos, ["listTitle"]),

  // Reviews & FAQs
  "reviews.seo": whole("reviews", "seo"),
  "reviews.layout": whole("reviews", "layout"),
  "reviews.hero": whole("reviews", "hero"),
  "reviews.intro": whole("reviews", "reviewsIntro"),
  "reviews.faq": some((t) => t.reviews.faq, ["eyebrow", "title", "description", "contact"]),

  // Articles
  "articles.seo": whole("articles", "seo"),
  "articles.hero": whole("articles", "hero"),
  "articles.settings": some((t) => t.articles, ["featuredLabel", "featuredId", "moreTitle"]),

  // Contact
  "contact.seo": whole("contact", "seo"),
  "contact.hero": whole("contact", "hero"),
  "contact.form": whole("contact", "form"),
  "contact.actions": whole("contact", "actions"),
} satisfies Record<string, Binding>;

export type DocumentKey = keyof typeof documentBindings;

export const documentKeys = Object.keys(documentBindings) as DocumentKey[];

export function isDocumentKey(key: string): key is DocumentKey {
  return Object.hasOwn(documentBindings, key);
}

// ---------------------------------------------------------------------------
// Catalogs
// ---------------------------------------------------------------------------

/** A catalog entry as stored by the CMS: slug + content without the id. */
export type CatalogEntry = { slug: string; content: Json; parent?: string };

export type CatalogKey =
  | "serviceGroups"
  | "services"
  | "videos"
  | "reviews"
  | "faqCategories"
  | "faqs"
  | "articles"
  | "careerMilestones"
  | "certificates";

/** Content without its id (the id is the slug). Child lists are stored as their own catalog. */
function withoutId<T extends { id: string }>(item: T, drop: readonly string[] = []): Json {
  const content: Json = { ...item };
  delete content.id;
  for (const key of drop) delete content[key];
  return content;
}

const withId = <T>(entry: CatalogEntry): T => ({ ...entry.content, id: entry.slug }) as T;

/** Reads every catalog from a content tree, in display order. */
export function readCatalogs(tree: ContentTree): Record<CatalogKey, CatalogEntry[]> {
  const groups = tree.services.groups;
  const categories = tree.reviews.faq.categories;
  return {
    serviceGroups: groups.map((group) => ({ slug: group.id, content: withoutId(group, ["services"]) })),
    services: groups.flatMap((group) =>
      group.services.map((service) => ({ slug: service.id, content: withoutId(service), parent: group.id })),
    ),
    videos: tree.videos.items.map((video) => ({ slug: video.id, content: withoutId(video) })),
    reviews: tree.reviews.items.map((review) => ({ slug: review.id, content: withoutId(review) })),
    faqCategories: categories.map((category) => ({ slug: category.id, content: withoutId(category, ["items"]) })),
    faqs: categories.flatMap((category) =>
      category.items.map((item) => ({ slug: item.id, content: withoutId(item), parent: category.id })),
    ),
    articles: tree.articles.articles.map((article) => ({ slug: article.id, content: withoutId(article) })),
    careerMilestones: tree.about.career.milestones.map((m) => ({ slug: m.id, content: withoutId(m) })),
    certificates: tree.about.certificates.items.map((c) => ({ slug: c.id, content: withoutId(c) })),
  };
}

/** Writes published catalogs into a tree. Catalogs that are absent keep the tree's entries. */
export function writeCatalogs(tree: ContentTree, catalogs: Partial<Record<CatalogKey, CatalogEntry[]>>): void {
  if (catalogs.serviceGroups && catalogs.services) {
    const services = catalogs.services;
    tree.services.groups = catalogs.serviceGroups.map((group) => ({
      ...withId<Omit<ServiceGroup, "services">>(group),
      services: services.filter((service) => service.parent === group.slug).map((s) => withId<Service>(s)),
    }));
  }
  if (catalogs.videos) tree.videos.items = catalogs.videos.map((v) => withId<Video>(v));
  if (catalogs.reviews) tree.reviews.items = catalogs.reviews.map((r) => withId<Review>(r));
  if (catalogs.faqCategories && catalogs.faqs) {
    const faqs = catalogs.faqs;
    tree.reviews.faq.categories = catalogs.faqCategories.map((category) => ({
      ...withId<Omit<FaqCategory, "items">>(category),
      items: faqs.filter((faq) => faq.parent === category.slug).map((f) => withId<FaqItem>(f)),
    }));
  }
  if (catalogs.articles) tree.articles.articles = catalogs.articles.map((a) => withId<Article>(a));
  if (catalogs.careerMilestones) {
    tree.about.career.milestones = catalogs.careerMilestones.map((m) => withId<CareerMilestone>(m));
  }
  if (catalogs.certificates) tree.about.certificates.items = catalogs.certificates.map((c) => withId<Certificate>(c));
}

// ---------------------------------------------------------------------------
// Published snapshot (written by `npm run cms:sync`, read by the build)
// ---------------------------------------------------------------------------

export type CmsSnapshot = {
  /** False until `npm run cms:sync` has pulled published content from Supabase. */
  enabled: boolean;
  syncedAt?: string;
  /** When published content last changed in the CMS (`cms_site_state`). */
  version?: string | null;
  documents?: Record<string, Json>;
  catalogs?: Partial<Record<CatalogKey, CatalogEntry[]>>;
  /** Placeholder items found in the published content (`npm run check:content`). */
  placeholders?: string[];
};

/** The content tree with published CMS content applied over the bundled defaults. */
export function applySnapshot(base: ContentTree, snapshot: CmsSnapshot): ContentTree {
  const tree = structuredClone(base);
  if (!snapshot.enabled) return tree;
  for (const [key, value] of Object.entries(snapshot.documents ?? {})) {
    if (isDocumentKey(key) && value && typeof value === "object") documentBindings[key].write(tree, value);
  }
  writeCatalogs(tree, snapshot.catalogs ?? {});
  return tree;
}

/** Every document's current value in a tree (CMS defaults and import). */
export function readDocuments(tree: ContentTree): Record<DocumentKey, Json> {
  return Object.fromEntries(documentKeys.map((key) => [key, structuredClone(documentBindings[key].read(tree))])) as Record<
    DocumentKey,
    Json
  >;
}
