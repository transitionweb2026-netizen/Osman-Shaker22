/**
 * Content published in the CMS, read by the website server at request time.
 *
 * The site renders pages from `cms_published_site()` (published content only,
 * callable with the publishable key). The response is cached under the
 * `cms` tag: every publish calls `/api/revalidate/` (see
 * supabase/migrations/20261119120000_cms_live_revalidate.sql), which expires
 * the tag, so the next visit renders the new content. Without that call the
 * cache still refreshes after `FALLBACK_REVALIDATE_SECONDS`.
 *
 * Files uploaded in the CMS are served by `/cms-media/<id>/…`
 * (app/cms-media/[id]/[file]/route.ts), so new photos need no build either.
 */
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";
import type { CatalogEntry, CatalogKey, CmsSnapshot } from "./model";
import type { Json } from "./schema";

export const CMS_CACHE_TAG = "cms";

/** Safety net when the publish notification is not configured or fails. */
const FALLBACK_REVALIDATE_SECONDS = 60;

const CATALOGS: CatalogKey[] = [
  "serviceGroups",
  "services",
  "videos",
  "reviews",
  "faqCategories",
  "faqs",
  "articles",
  "careerMilestones",
  "certificates",
];

export type PublishedMedia = {
  id: string;
  kind: "image" | "video";
  path: string;
  mime: string | null;
  width: number | null;
  height: number | null;
};

type PublishedSite = {
  initialized?: boolean;
  version?: string | null;
  documents?: Record<string, Json>;
  media?: PublishedMedia[];
} & Record<string, unknown>;

/** Supabase API base for server-side reads. `CMS_SUPABASE_URL` overrides it (tests, proxies). */
export function cmsApiUrl(): string {
  return (process.env.CMS_SUPABASE_URL ?? "").trim().replace(/\/+$/, "") || supabaseUrl;
}

/** The last successful response of this server instance, used when Supabase cannot be reached. */
let lastGood: PublishedSite | null = null;

async function requestPublishedSite(): Promise<PublishedSite> {
  const response = await fetch(`${cmsApiUrl()}/rest/v1/rpc/cms_published_site`, {
    headers: { apikey: supabaseKey, Accept: "application/json" },
    next: {
      tags: [CMS_CACHE_TAG],
      revalidate: process.env.NODE_ENV === "development" ? 5 : FALLBACK_REVALIDATE_SECONDS,
    },
  });
  if (!response.ok) throw new Error(`cms_published_site answered HTTP ${response.status}`);
  return (await response.json()) as PublishedSite;
}

/**
 * The published site, or `null` when Supabase is not configured or unreachable
 * (the caller then uses the snapshot committed with the code).
 */
export async function fetchPublishedSite(): Promise<PublishedSite | null> {
  if (!isSupabaseConfigured) return null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const site = await requestPublishedSite();
      if (site?.initialized) lastGood = site;
      return site?.initialized ? site : null;
    } catch (error) {
      if (attempt === 2) {
        console.warn(`[cms] Published content unavailable (${error instanceof Error ? error.message : error}).`);
      }
    }
  }
  return lastGood;
}

/** A file used by published content, for `/cms-media/<id>/…`. */
export async function getPublishedMedia(id: string): Promise<PublishedMedia | null> {
  const site = await fetchPublishedSite();
  return site?.media?.find((item) => item.id === id) ?? null;
}

const IMAGE_SRC = /^\/media\/cms-([0-9a-f-]{36})$/;
const VIDEO_SRC = /^\/media\/cms-([0-9a-f-]{36})\.(mp4|webm)$/;

/** Points CMS uploads (`/media/cms-<id>`, written by the CMS) at the runtime media route. */
function linkMedia(value: unknown, media: Map<string, PublishedMedia>): void {
  if (Array.isArray(value)) {
    value.forEach((item) => linkMedia(item, media));
    return;
  }
  if (!value || typeof value !== "object") return;
  const node = value as Record<string, unknown>;
  if (typeof node.src === "string" && typeof node.assetId === "string") {
    const image = IMAGE_SRC.exec(node.src);
    const video = VIDEO_SRC.exec(node.src);
    const record = media.get(node.assetId);
    if (record && image && record.kind === "image") {
      node.src = `/cms-media/${record.id}`;
      if (record.width && record.height) node.dimensions = { width: record.width, height: record.height };
    } else if (record && video && record.kind === "video") {
      node.src = `/cms-media/${record.id}/video.${video[2]}`;
    }
  }
  Object.values(node).forEach((child) => linkMedia(child, media));
}

/** The published site in the snapshot format `applySnapshot` reads. */
export function toSnapshot(site: PublishedSite): CmsSnapshot {
  const catalogs: Partial<Record<CatalogKey, CatalogEntry[]>> = {};
  for (const name of CATALOGS) {
    const entries = (site[name] ?? []) as { slug: string; content: Json; group?: string; category?: string }[];
    catalogs[name] = entries.map((entry) => {
      const parent = entry.group ?? entry.category;
      return parent ? { slug: entry.slug, content: entry.content, parent } : { slug: entry.slug, content: entry.content };
    });
  }
  const documents = structuredClone(site.documents ?? {});
  const media = new Map((site.media ?? []).map((item) => [item.id, item]));
  linkMedia(documents, media);
  linkMedia(catalogs, media);
  return { enabled: true, version: site.version ?? null, documents, catalogs };
}
