import { isDocumentKey, type CatalogKey } from "@/lib/cms/model";
import { catalogs, documents, pageOfDocument, tableToCatalog } from "@/lib/cms/registry";
import type { Json, Label } from "@/lib/cms/schema";

/** Editor link of a record (from content status rows: documents are labelled by key, catalogs by slug). */
export function recordHref(table: string, recordId: string, label: string): string {
  if (table === "cms_documents") return `/admin/edit/?doc=${encodeURIComponent(label)}`;
  return catalogItemHref(tableToCatalog[table], recordId);
}

export function catalogItemHref(catalog: CatalogKey, id: string): string {
  const path = catalogs[catalog].path;
  return `${path}${path.includes("?") ? "&" : "?"}id=${id}`;
}

/** Readable name of a record: "Homepage › Hero" or "Service · lung-cancer". */
export function recordName(table: string, label: string, tl: (label: Label) => string): string {
  if (table === "cms_documents") {
    if (!isDocumentKey(label)) return label;
    const page = pageOfDocument(label);
    return page ? `${tl(page.label)} › ${tl(documents[label].label)}` : tl(documents[label].label);
  }
  const catalog = tableToCatalog[table];
  return catalog ? `${tl(catalogs[catalog].singular)} · ${label}` : label;
}

/** Whether a value still contains content marked as a placeholder. */
export function hasPlaceholder(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasPlaceholder);
  if (!value || typeof value !== "object") return false;
  const object = value as Json;
  if (object.isPlaceholder === true) return true;
  return Object.values(object).some(hasPlaceholder);
}

/** `{ cmsContent, contentVersion, syncedAt, builtAt }` written into every static build. */
export type BuildInfo = { cmsContent: boolean; contentVersion: string | null; syncedAt: string | null; builtAt: string };

export async function fetchBuildInfo(): Promise<BuildInfo | null> {
  try {
    const response = await fetch(`/cms-build.json?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as BuildInfo;
  } catch {
    return null;
  }
}

/** True when the live build already contains the latest published change. */
export function buildIsCurrent(build: BuildInfo | null, version: string | null): boolean | null {
  if (!build) return null;
  if (!version) return true;
  if (!build.cmsContent || !build.contentVersion) return false;
  return new Date(build.contentVersion).getTime() >= new Date(version).getTime();
}
