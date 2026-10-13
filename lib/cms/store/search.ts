import type { CatalogKey } from "../model";
import type { Json } from "../schema";

/** The content field that names an entry (used for search and lists). */
export const catalogTitleKey: Record<CatalogKey, string> = {
  serviceGroups: "title",
  services: "title",
  videos: "title",
  reviews: "text",
  faqCategories: "title",
  faqs: "question",
  articles: "title",
  careerMilestones: "title",
  certificates: "title",
};

export function catalogSearchText(catalog: CatalogKey, record: { slug: string; draft: Json }): string {
  const title = record.draft[catalogTitleKey[catalog]] as { en?: string; ar?: string } | undefined;
  return `${record.slug} ${title?.en ?? ""} ${title?.ar ?? ""}`;
}

/** Case- and diacritics-insensitive match (Arabic tashkeel is ignored too). */
export function matchesSearch(haystack: string, needle: string): boolean {
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ًͯ-ٰٟ]/g, "")
      .replace(/[إأآ]/g, "ا");
  return normalize(haystack).includes(normalize(needle.trim()));
}

/** Search terms safe to embed in a PostgREST filter. */
export function postgrestTerm(search: string): string {
  return search.replace(/[,()*%\\:"]/g, " ").trim();
}
