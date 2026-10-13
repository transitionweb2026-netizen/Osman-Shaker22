/**
 * Draft previews: the editor posts the value being edited to an iframe at
 * `/admin/preview/`, which renders it with the website's own components.
 * Nothing is published or saved by previewing.
 */
import type { Locale } from "@/lib/i18n";
import { bundledTree } from "./bundled";
import { documentBindings, writeCatalogs, type CatalogEntry, type CatalogKey, type ContentTree, type DocumentKey } from "./model";
import type { Json } from "./schema";

export const PREVIEW_PATH = "/admin/preview/";
export const PREVIEW_READY = "cms-preview-ready";
export const PREVIEW_UPDATE = "cms-preview";

export type PreviewTarget = { kind: "document"; key: DocumentKey } | { kind: "catalog"; catalog: CatalogKey; slug: string };

export type PreviewMessage = {
  type: typeof PREVIEW_UPDATE;
  target: PreviewTarget;
  locale: Locale;
  /** The document's draft value (catalog targets carry theirs inside `catalogs`). */
  value: Json | null;
  /** Draft entries of related catalogs in display order, with the edited entry applied. */
  catalogs: Partial<Record<CatalogKey, CatalogEntry[]>>;
};

/** Documents and catalogs that have a visual preview. */
const previewDocuments = new Set<DocumentKey>([
  "shared.cta",
  "shared.introVideo",
  "home.hero",
  "home.introVideo",
  "home.about",
  "home.statistics",
  "home.specialties",
  "home.treatments",
  "home.journey",
  "home.whyChoose",
  "home.videos",
  "home.reviews",
  "home.faq",
  "about.hero",
  "about.intro",
  "about.specialties",
  "about.career",
  "about.certificates",
  "about.philosophy",
  "services.hero",
  "videos.hero",
  "videos.list",
  "reviews.hero",
  "reviews.intro",
  "reviews.faq",
  "articles.hero",
  "articles.settings",
  "contact.hero",
  "contact.form",
  "contact.actions",
]);

export function hasPreview(target: PreviewTarget): boolean {
  return target.kind === "catalog" || previewDocuments.has(target.key);
}

/** Catalogs a preview draws from (parents included, as the site groups children under them). */
export function previewCatalogs(target: PreviewTarget): CatalogKey[] {
  const keys = new Set<CatalogKey>();
  if (target.kind === "catalog") keys.add(target.catalog);
  else {
    const key = target.key;
    if (key.endsWith(".specialties") || key.endsWith(".treatments")) keys.add("services");
    if (key === "home.videos" || key === "videos.list") keys.add("videos");
    if (key === "home.reviews" || key === "home.faq" || key === "reviews.intro") keys.add("reviews");
    if (key === "home.reviews" || key === "home.faq" || key === "reviews.faq") keys.add("faqs");
    if (key === "articles.settings") keys.add("articles");
    if (key === "about.career") keys.add("careerMilestones");
    if (key === "about.certificates") keys.add("certificates");
  }
  if (keys.has("services") || keys.has("serviceGroups")) keys.add("services").add("serviceGroups");
  if (keys.has("faqs") || keys.has("faqCategories")) keys.add("faqs").add("faqCategories");
  return [...keys];
}

/** The website content with the draft applied over the bundled defaults. */
export function previewTree(message: PreviewMessage): ContentTree {
  const tree = bundledTree();
  writeCatalogs(tree, message.catalogs);
  if (message.target.kind === "document" && message.value) documentBindings[message.target.key].write(tree, structuredClone(message.value));
  return tree;
}
