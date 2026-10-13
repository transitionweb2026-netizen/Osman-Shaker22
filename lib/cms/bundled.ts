/**
 * The website's current content (the typed files in `content/`), packaged for
 * the CMS: defaults in the editors, the local demo, and "Import the current
 * website" when Supabase is first connected.
 */
import { aboutContent } from "@/content/about";
import { articlesPage } from "@/content/articles";
import { contactPage } from "@/content/contact";
import { homeContent } from "@/content/home";
import bundledVariants from "@/content/media-variants.generated.json";
import { reviewsPage } from "@/content/reviews";
import { servicesPage } from "@/content/services";
import { siteContent } from "@/content/site";
import { videosPage } from "@/content/videos";
import {
  readCatalogs,
  readDocuments,
  type CatalogEntry,
  type CatalogKey,
  type ContentTree,
  type DocumentKey,
} from "./model";
import type { Json, Label } from "./schema";

export function bundledTree(): ContentTree {
  return structuredClone({
    site: siteContent,
    home: homeContent,
    about: aboutContent,
    services: servicesPage,
    videos: videosPage,
    reviews: reviewsPage,
    articles: articlesPage,
    contact: contactPage,
  });
}

export type BundledMedia = { src: string; width: number; height: number; alt: Label };

/** Every bundled photo, with the alt text of its first use in the content. */
export function bundledMedia(tree: ContentTree = bundledTree()): BundledMedia[] {
  const alts = new Map<string, Label>();
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    const object = value as Json;
    if (typeof object.src === "string" && object.alt && typeof object.alt === "object" && !alts.has(object.src)) {
      alts.set(object.src, object.alt as Label);
    }
    Object.values(object).forEach(visit);
  };
  visit(tree);
  return Object.entries(bundledVariants as Record<string, { width: number; height: number }>).map(([name, v]) => ({
    src: `/media/${name}`,
    width: v.width,
    height: v.height,
    alt: alts.get(`/media/${name}`) ?? { en: "", ar: "" },
  }));
}

export type ImportPayload = {
  documents: Record<DocumentKey, Json>;
  catalogs: Record<CatalogKey, CatalogEntry[]>;
  bundledMedia: BundledMedia[];
};

export function importPayload(): ImportPayload {
  const tree = bundledTree();
  return { documents: readDocuments(tree), catalogs: readCatalogs(tree), bundledMedia: bundledMedia(tree) };
}

/** Adds `assetId` to every image value whose `src` is a known library entry. */
export function attachAssetIds<T>(value: T, idBySrc: Map<string, string>): T {
  if (Array.isArray(value)) return value.map((item) => attachAssetIds(item, idBySrc)) as T;
  if (!value || typeof value !== "object") return value;
  const object = Object.fromEntries(
    Object.entries(value as Json).map(([key, item]) => [key, attachAssetIds(item, idBySrc)]),
  ) as Json;
  if (typeof object.src === "string" && "alt" in object && idBySrc.has(object.src) && !object.assetId) {
    object.assetId = idBySrc.get(object.src);
  }
  return object as T;
}

/** Display URLs of a bundled photo (largest ~960px, thumbnail ~320px). */
export function bundledUrls(src: string): { url: string; thumbUrl: string } {
  const name = src.replace(/^\/media\//, "");
  const variant = (bundledVariants as Record<string, { widths: number[] }>)[name];
  if (!variant) return { url: src, thumbUrl: src };
  const pick = (target: number) => variant.widths.find((w) => w >= target) ?? variant.widths.at(-1);
  return { url: `/media/${name}-${pick(960)}.webp`, thumbUrl: `/media/${name}-${pick(320)}.webp` };
}
