import type { CatalogKey, DocumentKey } from "../model";
import type { Json, Label } from "../schema";

/** never published / published and unchanged / published with unpublished edits */
export type RecordStatus = "draft" | "published" | "changed";

export type DocumentRecord = {
  id: string;
  key: DocumentKey;
  draft: Json;
  published: Json | null;
  publishedAt: string | null;
  updatedAt: string;
};

export type CatalogRecord = {
  id: string;
  catalog: CatalogKey;
  slug: string;
  /** Id of the parent record (service group, FAQ topic). */
  parentId: string | null;
  sortOrder: number;
  draft: Json;
  published: Json | null;
  publishedAt: string | null;
  updatedAt: string;
  /** Reviews only: admin-only verification data, never published. */
  consentConfirmed?: boolean;
  verificationNote?: string | null;
};

export type MediaRecord = {
  id: string;
  kind: "image" | "video";
  /** Path in the storage bucket (uploads) … */
  storagePath: string | null;
  thumbPath: string | null;
  /** … or a photo bundled with the website code (`/media/<name>`). */
  bundledSrc: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
  originalName: string | null;
  title: string | null;
  alt: Label;
  isPublic: boolean;
  createdAt: string;
};

export type MediaUsage = {
  table: string;
  recordId: string;
  label: string;
  inDraft: boolean;
  inPublished: boolean;
};

export type Revision = {
  id: number;
  action: "update" | "delete";
  draft: Json | null;
  published: Json | null;
  createdAt: string;
};

export type ContentStatusRow = {
  table: string;
  recordId: string;
  label: string;
  status: RecordStatus;
  updatedAt: string;
  publishedAt: string | null;
};

export type Page<T> = { items: T[]; total: number };

export type CatalogQuery = {
  search?: string;
  parentId?: string | null;
  page: number;
  pageSize: number;
};

export type MediaQuery = {
  search?: string;
  kind?: "image" | "video" | "all";
  page: number;
  pageSize: number;
};

export type PreparedUpload = {
  file: File;
  kind: "image" | "video";
  mimeType: string;
  extension: string;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  thumbnail: Blob | null;
};

export type ImportProgress = { done: number; total: number; label: string };

/**
 * Everything the CMS screens need. Implemented by the Supabase store (real
 * data, protected by Row Level Security) and the local demo store.
 */
export interface CmsStore {
  readonly mode: "supabase" | "local";

  // Page sections and settings
  getDocument(key: DocumentKey): Promise<DocumentRecord | null>;
  listDocuments(): Promise<DocumentRecord[]>;
  saveDocumentDraft(key: DocumentKey, draft: Json): Promise<DocumentRecord>;

  // Catalogs
  listCatalog(catalog: CatalogKey, query: CatalogQuery): Promise<Page<CatalogRecord>>;
  /** All entries in order (small catalogs: pickers, references, parents). */
  listAll(catalog: CatalogKey): Promise<CatalogRecord[]>;
  getCatalogItem(catalog: CatalogKey, id: string): Promise<CatalogRecord | null>;
  createCatalogItem(catalog: CatalogKey, input: { slug: string; parentId: string | null; draft: Json }): Promise<CatalogRecord>;
  saveCatalogDraft(
    catalog: CatalogKey,
    id: string,
    draft: Json,
    extra?: { parentId?: string | null; consentConfirmed?: boolean; verificationNote?: string | null },
  ): Promise<CatalogRecord>;
  deleteCatalogItem(catalog: CatalogKey, id: string): Promise<void>;
  reorder(catalog: CatalogKey, orderedIds: string[]): Promise<void>;

  // Lifecycle (documents use the table name `cms_documents`)
  publish(table: string, id: string): Promise<void>;
  unpublish(table: string, id: string): Promise<void>;
  /** Discards unpublished edits: draft := published. */
  revertToPublished(table: string, id: string): Promise<void>;
  revisions(recordId: string): Promise<Revision[]>;
  contentStatus(): Promise<ContentStatusRow[]>;
  /** When published content last changed (compared with the live site's build). */
  contentVersion(): Promise<string | null>;

  // Media
  listMedia(query: MediaQuery): Promise<Page<MediaRecord>>;
  getMedia(id: string): Promise<MediaRecord | null>;
  uploadMedia(upload: PreparedUpload, onProgress: (fraction: number) => void): Promise<MediaRecord>;
  updateMedia(id: string, patch: { title?: string | null; alt?: Label }): Promise<MediaRecord>;
  deleteMedia(id: string): Promise<void>;
  mediaUsage(id: string): Promise<MediaUsage[]>;
  /** Display URLs (signed for private uploads), keyed by media id. */
  mediaUrls(records: MediaRecord[]): Promise<Record<string, { url: string; thumbUrl: string }>>;

  // Setup
  isInitialized(): Promise<boolean>;
  importContent(
    data: {
      documents: Record<DocumentKey, Json>;
      catalogs: Record<CatalogKey, { slug: string; content: Json; parent?: string }[]>;
      bundledMedia: { src: string; width: number; height: number; alt: Label }[];
    },
    options: { publish: boolean },
    onProgress: (progress: ImportProgress) => void,
  ): Promise<void>;
}

export function statusOf(draft: Json, published: Json | null): RecordStatus {
  if (!published) return "draft";
  return JSON.stringify(draft) === JSON.stringify(published) ? "published" : "changed";
}

/** Readable message from Supabase / Postgres errors. */
export class CmsError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
    this.name = "CmsError";
  }
}
