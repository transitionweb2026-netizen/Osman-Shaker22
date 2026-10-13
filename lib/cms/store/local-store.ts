/**
 * Local demo store: used when Supabase is not configured.
 *
 * It follows the same rules as the database (draft vs published copies,
 * revisions, ordering, media usage) but keeps everything in this browser's
 * localStorage. Nothing is uploaded, and nothing reaches the website.
 */
import { LOCAL_STORE_KEY } from "../config";
import { attachAssetIds, bundledUrls, importPayload, type ImportPayload } from "../bundled";
import type { CatalogKey, DocumentKey } from "../model";
import { catalogs as catalogDefs, catalogKeys, tableToCatalog } from "../registry";
import type { Json } from "../schema";
import {
  CmsError,
  statusOf,
  type CatalogQuery,
  type CatalogRecord,
  type CmsStore,
  type ContentStatusRow,
  type DocumentRecord,
  type MediaQuery,
  type MediaRecord,
  type MediaUsage,
  type Page,
  type Revision,
} from "./types";
import { catalogSearchText, matchesSearch } from "./search";

type LocalData = {
  documents: Record<string, DocumentRecord>;
  catalogs: Record<CatalogKey, CatalogRecord[]>;
  media: MediaRecord[];
  revisions: Record<string, Revision[]>;
  version: string | null;
};

const now = () => new Date().toISOString();
const uuid = () => crypto.randomUUID();
const clone = <T>(value: T): T => structuredClone(value);

function emptyData(): LocalData {
  return {
    documents: {},
    catalogs: Object.fromEntries(catalogKeys.map((key) => [key, []])) as unknown as Record<CatalogKey, CatalogRecord[]>,
    media: [],
    revisions: {},
    version: null,
  };
}

export class LocalStore implements CmsStore {
  readonly mode = "local" as const;
  private data: LocalData;

  constructor() {
    this.data = this.load() ?? this.seed();
  }

  private load(): LocalData | null {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORE_KEY);
      return raw ? (JSON.parse(raw) as LocalData) : null;
    } catch {
      return null;
    }
  }

  private persist() {
    try {
      window.localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage full or blocked: the demo keeps working for this visit.
    }
  }

  /** Starts the demo with the website's current content, already published. */
  private seed(): LocalData {
    this.data = emptyData();
    this.applyImport(importPayload(), true);
    this.persist();
    return this.data;
  }

  /** Clears local edits and starts again from the website's current content. */
  reset() {
    try {
      window.localStorage.removeItem(LOCAL_STORE_KEY);
    } catch {
      /* ignore */
    }
    this.data = this.seed();
  }

  private touchVersion() {
    this.data.version = now();
  }

  private recordRevision(id: string, action: Revision["action"], draft: Json | null, published: Json | null) {
    const list = this.data.revisions[id] ?? [];
    list.unshift({ id: Date.now() + list.length, action, draft: clone(draft), published: clone(published), createdAt: now() });
    this.data.revisions[id] = list.slice(0, 30);
  }

  private applyImport(payload: ImportPayload, publish: boolean) {
    const idBySrc = new Map<string, string>();
    for (const media of payload.bundledMedia) {
      const id = uuid();
      idBySrc.set(media.src, id);
      this.data.media.push({
        id,
        kind: "image",
        storagePath: null,
        thumbPath: null,
        bundledSrc: media.src,
        mimeType: "image/webp",
        sizeBytes: null,
        width: media.width,
        height: media.height,
        originalName: media.src.replace("/media/", ""),
        title: null,
        alt: media.alt,
        isPublic: false,
        createdAt: now(),
      });
    }
    const stamp = now();
    for (const [key, value] of Object.entries(payload.documents)) {
      const draft = attachAssetIds(value, idBySrc);
      this.data.documents[key] = {
        id: uuid(),
        key: key as DocumentKey,
        draft,
        published: publish ? clone(draft) : null,
        publishedAt: publish ? stamp : null,
        updatedAt: stamp,
      };
    }
    const parentIds: Partial<Record<CatalogKey, Map<string, string>>> = {};
    for (const catalog of catalogKeys) {
      const def = catalogDefs[catalog];
      const ids = new Map<string, string>();
      parentIds[catalog] = ids;
      this.data.catalogs[catalog] = payload.catalogs[catalog].map((entry, index) => {
        const id = uuid();
        ids.set(entry.slug, id);
        const draft = attachAssetIds(entry.content, idBySrc);
        return {
          id,
          catalog,
          slug: entry.slug,
          parentId: def.parent && entry.parent ? (parentIds[def.parent]?.get(entry.parent) ?? null) : null,
          sortOrder: index + 1,
          draft,
          published: publish ? clone(draft) : null,
          publishedAt: publish ? stamp : null,
          updatedAt: stamp,
          ...(catalog === "reviews" ? { consentConfirmed: false, verificationNote: null } : {}),
        };
      });
    }
    this.touchVersion();
    this.refreshMediaVisibility();
  }

  // ---- documents ---------------------------------------------------------------

  async getDocument(key: DocumentKey) {
    return clone(this.data.documents[key] ?? null);
  }

  async listDocuments() {
    return clone(Object.values(this.data.documents));
  }

  async saveDocumentDraft(key: DocumentKey, draft: Json) {
    const existing = this.data.documents[key];
    if (existing) {
      this.recordRevision(existing.id, "update", existing.draft, existing.published);
      existing.draft = clone(draft);
      existing.updatedAt = now();
    } else {
      this.data.documents[key] = { id: uuid(), key, draft: clone(draft), published: null, publishedAt: null, updatedAt: now() };
    }
    this.persist();
    return clone(this.data.documents[key]);
  }

  // ---- catalogs ------------------------------------------------------------------

  private list(catalog: CatalogKey) {
    return this.data.catalogs[catalog];
  }

  private find(catalog: CatalogKey, id: string) {
    const record = this.list(catalog).find((r) => r.id === id);
    if (!record) throw new CmsError("This entry no longer exists.");
    return record;
  }

  async listCatalog(catalog: CatalogKey, query: CatalogQuery): Promise<Page<CatalogRecord>> {
    let items = [...this.list(catalog)].sort((a, b) => a.sortOrder - b.sortOrder);
    if (query.parentId) items = items.filter((r) => r.parentId === query.parentId);
    if (query.search) items = items.filter((r) => matchesSearch(catalogSearchText(catalog, r), query.search ?? ""));
    const start = (query.page - 1) * query.pageSize;
    return { items: clone(items.slice(start, start + query.pageSize)), total: items.length };
  }

  async listAll(catalog: CatalogKey) {
    return clone([...this.list(catalog)].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  async getCatalogItem(catalog: CatalogKey, id: string) {
    return clone(this.list(catalog).find((r) => r.id === id) ?? null);
  }

  async createCatalogItem(catalog: CatalogKey, input: { slug: string; parentId: string | null; draft: Json }) {
    if (this.list(catalog).some((r) => r.slug === input.slug)) {
      throw new CmsError("This id is already used. Choose another one.", "23505");
    }
    const record: CatalogRecord = {
      id: uuid(),
      catalog,
      slug: input.slug,
      parentId: input.parentId,
      sortOrder: Math.max(0, ...this.list(catalog).map((r) => r.sortOrder)) + 1,
      draft: clone(input.draft),
      published: null,
      publishedAt: null,
      updatedAt: now(),
      ...(catalog === "reviews" ? { consentConfirmed: false, verificationNote: null } : {}),
    };
    this.list(catalog).push(record);
    this.persist();
    return clone(record);
  }

  async saveCatalogDraft(
    catalog: CatalogKey,
    id: string,
    draft: Json,
    extra: { parentId?: string | null; consentConfirmed?: boolean; verificationNote?: string | null } = {},
  ) {
    const record = this.find(catalog, id);
    this.recordRevision(record.id, "update", record.draft, record.published);
    record.draft = clone(draft);
    if (extra.parentId !== undefined) record.parentId = extra.parentId;
    if (extra.consentConfirmed !== undefined) record.consentConfirmed = extra.consentConfirmed;
    if (extra.verificationNote !== undefined) record.verificationNote = extra.verificationNote;
    record.updatedAt = now();
    if (record.published && extra.parentId !== undefined) this.touchVersion();
    this.persist();
    return clone(record);
  }

  async deleteCatalogItem(catalog: CatalogKey, id: string) {
    const record = this.find(catalog, id);
    const def = catalogDefs[catalog];
    const children = catalogKeys.filter((key) => catalogDefs[key].parent === catalog);
    for (const child of children) {
      if (this.list(child).some((r) => r.parentId === id)) {
        throw new CmsError(`Move or delete the ${def.label.en.toLowerCase()} entries inside it first.`, "23503");
      }
    }
    this.recordRevision(record.id, "delete", record.draft, record.published);
    this.data.catalogs[catalog] = this.list(catalog).filter((r) => r.id !== id);
    if (record.published) this.touchVersion();
    this.refreshMediaVisibility();
    this.persist();
  }

  async reorder(catalog: CatalogKey, orderedIds: string[]) {
    orderedIds.forEach((id, index) => {
      const record = this.list(catalog).find((r) => r.id === id);
      if (record) record.sortOrder = index + 1;
    });
    this.touchVersion();
    this.persist();
  }

  // ---- lifecycle ----------------------------------------------------------------

  private recordFor(table: string, id: string): DocumentRecord | CatalogRecord {
    if (table === "cms_documents") {
      const doc = Object.values(this.data.documents).find((d) => d.id === id);
      if (!doc) throw new CmsError("This section no longer exists.");
      return doc;
    }
    const catalog = tableToCatalog[table];
    if (!catalog) throw new CmsError("Unknown content type.");
    return this.find(catalog, id);
  }

  async publish(table: string, id: string) {
    const record = this.recordFor(table, id);
    if (table === "cms_reviews") {
      const review = record as CatalogRecord;
      const real = !review.draft.isPlaceholder;
      if (real && (!review.consentConfirmed || ![1, 2, 3, 4, 5].includes(review.draft.rating as number))) {
        throw new CmsError("A real review needs documented consent and the patient's rating before it is published.", "23514");
      }
    }
    if (table === "cms_articles" && !record.draft.isPlaceholder && !record.draft.reviewedBy) {
      throw new CmsError("A real article needs a named medical reviewer before it is published.", "23514");
    }
    this.recordRevision(record.id, "update", record.draft, record.published);
    record.published = clone(record.draft);
    record.publishedAt = now();
    record.updatedAt = now();
    this.touchVersion();
    this.refreshMediaVisibility();
    this.persist();
  }

  async unpublish(table: string, id: string) {
    const record = this.recordFor(table, id);
    this.recordRevision(record.id, "update", record.draft, record.published);
    record.published = null;
    record.publishedAt = null;
    record.updatedAt = now();
    this.touchVersion();
    this.refreshMediaVisibility();
    this.persist();
  }

  async revertToPublished(table: string, id: string) {
    const record = this.recordFor(table, id);
    if (!record.published) throw new CmsError("There is no published version to go back to.");
    this.recordRevision(record.id, "update", record.draft, record.published);
    record.draft = clone(record.published);
    record.updatedAt = now();
    this.persist();
  }

  async revisions(recordId: string) {
    return clone(this.data.revisions[recordId] ?? []);
  }

  async contentStatus(): Promise<ContentStatusRow[]> {
    const rows: ContentStatusRow[] = Object.values(this.data.documents).map((d) => ({
      table: "cms_documents",
      recordId: d.id,
      label: d.key,
      status: statusOf(d.draft, d.published),
      updatedAt: d.updatedAt,
      publishedAt: d.publishedAt,
    }));
    for (const catalog of catalogKeys) {
      for (const r of this.list(catalog)) {
        rows.push({
          table: catalogDefs[catalog].table,
          recordId: r.id,
          label: r.slug,
          status: statusOf(r.draft, r.published),
          updatedAt: r.updatedAt,
          publishedAt: r.publishedAt,
        });
      }
    }
    return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async contentVersion() {
    return this.data.version;
  }

  // ---- media -------------------------------------------------------------------

  private allContent(): { table: string; id: string; label: string; draft: Json; published: Json | null }[] {
    const rows = Object.values(this.data.documents).map((d) => ({
      table: "cms_documents",
      id: d.id,
      label: d.key as string,
      draft: d.draft,
      published: d.published,
    }));
    for (const catalog of catalogKeys) {
      for (const r of this.list(catalog)) {
        rows.push({ table: catalogDefs[catalog].table, id: r.id, label: r.slug, draft: r.draft, published: r.published });
      }
    }
    return rows;
  }

  private refreshMediaVisibility() {
    const published = JSON.stringify(this.allContent().map((r) => r.published));
    for (const media of this.data.media) media.isPublic = published.includes(`"assetId":"${media.id}"`);
  }

  async listMedia(query: MediaQuery): Promise<Page<MediaRecord>> {
    let items = [...this.data.media].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (query.kind && query.kind !== "all") items = items.filter((m) => m.kind === query.kind);
    if (query.search) {
      items = items.filter((m) =>
        matchesSearch(`${m.title ?? ""} ${m.originalName ?? ""} ${m.alt.en} ${m.alt.ar}`, query.search ?? ""),
      );
    }
    const start = (query.page - 1) * query.pageSize;
    return { items: clone(items.slice(start, start + query.pageSize)), total: items.length };
  }

  async getMedia(id: string) {
    return clone(this.data.media.find((m) => m.id === id) ?? null);
  }

  async uploadMedia(): Promise<MediaRecord> {
    throw new CmsError("Uploading needs the Supabase connection. In the local demo you can use the photos already on the website.");
  }

  async updateMedia(id: string, patch: { title?: string | null; alt?: { en: string; ar: string } }) {
    const media = this.data.media.find((m) => m.id === id);
    if (!media) throw new CmsError("This file no longer exists.");
    if (patch.title !== undefined) media.title = patch.title;
    if (patch.alt) media.alt = patch.alt;
    this.persist();
    return clone(media);
  }

  async deleteMedia(id: string) {
    const usage = await this.mediaUsage(id);
    if (usage.some((u) => u.inPublished)) {
      throw new CmsError("This file is used by published content. Replace or unpublish it there first.", "23503");
    }
    this.data.media = this.data.media.filter((m) => m.id !== id);
    this.persist();
  }

  async mediaUsage(id: string): Promise<MediaUsage[]> {
    const needle = `"assetId":"${id}"`;
    return this.allContent()
      .map((r) => ({
        table: r.table,
        recordId: r.id,
        label: r.label,
        inDraft: JSON.stringify(r.draft).includes(needle),
        inPublished: r.published ? JSON.stringify(r.published).includes(needle) : false,
      }))
      .filter((u) => u.inDraft || u.inPublished);
  }

  async mediaUrls(records: MediaRecord[]) {
    return Object.fromEntries(records.map((m) => [m.id, bundledUrls(m.bundledSrc ?? "")]));
  }

  // ---- setup ---------------------------------------------------------------------

  async isInitialized() {
    return Object.keys(this.data.documents).length > 0;
  }

  async importContent() {
    // The demo is already seeded with the website's content; see reset().
  }
}
