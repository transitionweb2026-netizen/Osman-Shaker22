import type {
  AboutSectionId,
  HomeSectionId,
  PageLayout,
  ReviewsSectionId,
  ServicesSectionId,
} from "@/content/types";

/** Sections below the hero, in their default order. */
export const HOME_SECTIONS: readonly HomeSectionId[] = [
  "introVideo",
  "about",
  "statistics",
  "specialties",
  "treatments",
  "journey",
  "whyChoose",
  "videos",
  "reviewsFaq",
  "cta",
];
export const ABOUT_SECTIONS: readonly AboutSectionId[] = ["intro", "specialties", "career", "certificates", "philosophy", "cta"];
export const SERVICES_SECTIONS: readonly ServicesSectionId[] = ["groups", "cta"];
export const REVIEWS_SECTIONS: readonly ReviewsSectionId[] = ["reviews", "faq"];

/**
 * A complete layout: the configured order first, then any section the
 * configuration does not mention (so new sections never disappear), without
 * duplicates or unknown ids.
 */
export function normalizeLayout<Id extends string>(
  layout: PageLayout<Id> | undefined,
  known: readonly Id[],
): PageLayout<Id> {
  const seen = new Set<Id>();
  const sections: PageLayout<Id>["sections"] = [];
  for (const section of layout?.sections ?? []) {
    if (known.includes(section.id) && !seen.has(section.id)) {
      seen.add(section.id);
      sections.push(section.hidden ? { id: section.id, hidden: true } : { id: section.id });
    }
  }
  for (const id of known) if (!seen.has(id)) sections.push({ id });
  return { sections };
}

/** The ids of the sections to render, in order. */
export function visibleSections<Id extends string>(layout: PageLayout<Id> | undefined, known: readonly Id[]): Id[] {
  return normalizeLayout(layout, known)
    .sections.filter((section) => !section.hidden)
    .map((section) => section.id);
}
