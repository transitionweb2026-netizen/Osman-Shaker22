import { documentBindings, type CatalogEntry, type CatalogKey, type DocumentKey } from "@/lib/cms/model";
import { bundledTree } from "@/lib/cms/bundled";
import { catalogs as catalogDefs, documents as documentDefs } from "@/lib/cms/registry";
import { L, type Field, type Issue, type Json, type Label } from "@/lib/cms/schema";
import type { CatalogRecord, CmsStore, DocumentRecord } from "@/lib/cms/store/types";

/** Catalogs referenced by reference fields (pickers and checks need their entries). */
export function referencedCatalogs(fields: Field[]): CatalogKey[] {
  const keys = new Set<CatalogKey>();
  const visit = (list: Field[]) => {
    for (const field of list) {
      if (field.type === "references" || field.type === "reference") keys.add(field.catalog);
      if (field.type === "group" || field.type === "list") visit(field.fields);
      if (field.type === "optional") visit([field.field]);
    }
  };
  visit(fields);
  return [...keys];
}

export async function loadCatalogs(store: CmsStore, keys: CatalogKey[]): Promise<Partial<Record<CatalogKey, CatalogRecord[]>>> {
  const lists = await Promise.all(keys.map((key) => store.listAll(key)));
  return Object.fromEntries(keys.map((key, i) => [key, lists[i]]));
}

/** Catalog records as site entries (drafts, with parent slugs), for previews. */
export function toEntries(catalogs: Partial<Record<CatalogKey, CatalogRecord[]>>): Partial<Record<CatalogKey, CatalogEntry[]>> {
  const result: Partial<Record<CatalogKey, CatalogEntry[]>> = {};
  for (const [key, records] of Object.entries(catalogs) as [CatalogKey, CatalogRecord[]][]) {
    const parentKey = catalogDefs[key].parent;
    const parents = parentKey ? (catalogs[parentKey] ?? []) : [];
    result[key] = records.map((record) => {
      const parent = parents.find((p) => p.id === record.parentId)?.slug;
      return parent ? { slug: record.slug, content: record.draft, parent } : { slug: record.slug, content: record.draft };
    });
  }
  return result;
}

/** The bundled value of a document (used until the record exists in the database). */
export function defaultDocument(key: DocumentKey): Json {
  return structuredClone(documentBindings[key].read(bundledTree()));
}

/** Documents whose reference fields point at an entry (by slug). */
export function findReferences(documents: DocumentRecord[], catalog: CatalogKey, slug: string): Label[] {
  const found: Label[] = [];
  const uses = (fields: Field[], value: unknown): boolean => {
    if (!value || typeof value !== "object") return false;
    const object = value as Json;
    return fields.some((field) => {
      const v = object[field.key];
      switch (field.type) {
        case "references":
          return field.catalog === catalog && Array.isArray(v) && v.includes(slug);
        case "reference":
          return field.catalog === catalog && v === slug;
        case "group":
          return uses(field.fields, v);
        case "optional":
          return uses([field.field], object);
        case "list":
          return Array.isArray(v) && v.some((item) => uses(field.fields, item));
        default:
          return false;
      }
    });
  };
  for (const document of documents) {
    const def = documentDefs[document.key];
    if (def && (uses(def.fields, document.draft) || (document.published && uses(def.fields, document.published)))) found.push(def.label);
  }
  return found;
}

/** Publishing rules the database enforces, shown before trying (reviews and articles). */
export function catalogRules(
  catalog: CatalogKey,
  value: Json,
  extra: { consentConfirmed?: boolean },
): Issue[] {
  if (value.isPlaceholder === true) return [];
  const issues: Issue[] = [];
  if (catalog === "reviews") {
    if (!extra.consentConfirmed) {
      issues.push({
        path: "consent",
        severity: "incomplete",
        message: L(
          "Confirm the patient's documented consent before publishing a real review.",
          "أكّد موافقة المريض الموثّقة قبل نشر رأي حقيقي.",
        ),
      });
    }
    if (!(typeof value.rating === "number" && value.rating >= 1 && value.rating <= 5)) {
      issues.push({
        path: "rating",
        severity: "incomplete",
        message: L("A real review needs the rating the patient gave (1–5).", "يحتاج الرأي الحقيقي إلى التقييم الذي منحه المريض (١–٥)."),
      });
    }
  }
  if (catalog === "articles" && !(value.reviewedBy && typeof value.reviewedBy === "object")) {
    issues.push({
      path: "reviewedBy",
      severity: "incomplete",
      message: L(
        "A real medical article needs its clinical reviewer before publishing.",
        "يحتاج المقال الطبي الحقيقي إلى اسم المراجع الطبي قبل النشر.",
      ),
    });
  }
  return issues;
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
