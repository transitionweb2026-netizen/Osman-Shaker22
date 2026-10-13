/**
 * Supabase-backed store. Runs in the browser with the publishable key and the
 * signed-in member's session; Row Level Security decides what each call may do
 * (see supabase/migrations). No privileged key is ever used here.
 */
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { attachAssetIds, bundledUrls } from "../bundled";
import { MEDIA_BUCKET, supabaseKey, supabaseUrl } from "../config";
import { uploadWithProgress } from "../media-upload";
import type { CatalogKey, DocumentKey } from "../model";
import { catalogs as catalogDefs, catalogKeys } from "../registry";
import type { Json, Label } from "../schema";
import { catalogTitleKey, postgrestTerm } from "./search";
import {
  CmsError,
  type CatalogQuery,
  type CatalogRecord,
  type CmsStore,
  type ContentStatusRow,
  type DocumentRecord,
  type ImportProgress,
  type MediaQuery,
  type MediaRecord,
  type MediaUsage,
  type Page,
  type PreparedUpload,
  type Revision,
} from "./types";

/** Column linking a catalog entry to its parent entry. */
const parentColumn: Partial<Record<CatalogKey, string>> = { services: "group_id", faqs: "category_id" };

type Row = Record<string, unknown>;

/** Human-readable errors for the common database refusals. */
function fail(error: PostgrestError | { message: string; code?: string } | null): never {
  const code = error && "code" in error ? error.code : undefined;
  const messages: Record<string, string> = {
    "42501": "You don't have permission to do this.",
    "23505": "This id is already used. Choose another one.",
    "23503": "This item is still used elsewhere, so it can't be removed.",
    "23514": "This can't be published yet: required information is missing (for reviews, consent and the patient's rating; for articles, a medical reviewer).",
    PGRST301: "Your session has expired. Please sign in again.",
  };
  const fromDatabase = error?.message ?? "";
  // Messages raised by our own database functions are already written for editors
  const custom = /[a-z].*\.$/.test(fromDatabase) && code && ["23503", "23514", "P0002"].includes(code) ? fromDatabase : null;
  throw new CmsError(custom ?? (code && messages[code]) ?? (fromDatabase || "Something went wrong. Please try again."), code);
}

function toDocument(row: Row): DocumentRecord {
  return {
    id: row.id as string,
    key: row.key as DocumentKey,
    draft: row.draft as Json,
    published: (row.published as Json) ?? null,
    publishedAt: (row.published_at as string) ?? null,
    updatedAt: row.updated_at as string,
  };
}

function toCatalog(catalog: CatalogKey, row: Row): CatalogRecord {
  const parent = parentColumn[catalog];
  return {
    id: row.id as string,
    catalog,
    slug: row.slug as string,
    parentId: parent ? ((row[parent] as string) ?? null) : null,
    sortOrder: row.sort_order as number,
    draft: row.draft as Json,
    published: (row.published as Json) ?? null,
    publishedAt: (row.published_at as string) ?? null,
    updatedAt: row.updated_at as string,
    ...(catalog === "reviews"
      ? { consentConfirmed: Boolean(row.consent_confirmed), verificationNote: (row.verification_note as string) ?? null }
      : {}),
  };
}

function toMedia(row: Row): MediaRecord {
  return {
    id: row.id as string,
    kind: row.kind as "image" | "video",
    storagePath: (row.storage_path as string) ?? null,
    thumbPath: (row.thumb_path as string) ?? null,
    bundledSrc: (row.bundled_src as string) ?? null,
    mimeType: (row.mime_type as string) ?? null,
    sizeBytes: (row.size_bytes as number) ?? null,
    width: (row.width as number) ?? null,
    height: (row.height as number) ?? null,
    originalName: (row.original_name as string) ?? null,
    title: (row.title as string) ?? null,
    alt: (row.alt as Label) ?? { en: "", ar: "" },
    isPublic: Boolean(row.is_public),
    createdAt: row.created_at as string,
  };
}

export class SupabaseStore implements CmsStore {
  readonly mode = "supabase" as const;

  constructor(private readonly db: SupabaseClient) {}

  // ---- documents -------------------------------------------------------------

  async getDocument(key: DocumentKey) {
    const { data, error } = await this.db.from("cms_documents").select("*").eq("key", key).maybeSingle();
    if (error) fail(error);
    return data ? toDocument(data) : null;
  }

  async listDocuments() {
    const { data, error } = await this.db.from("cms_documents").select("*").order("key");
    if (error) fail(error);
    return (data ?? []).map(toDocument);
  }

  async saveDocumentDraft(key: DocumentKey, draft: Json) {
    const { data, error } = await this.db
      .from("cms_documents")
      .upsert({ key, draft }, { onConflict: "key" })
      .select("*")
      .single();
    if (error) fail(error);
    return toDocument(data);
  }

  // ---- catalogs ------------------------------------------------------------------

  private table(catalog: CatalogKey) {
    return catalogDefs[catalog].table;
  }

  async listCatalog(catalog: CatalogKey, query: CatalogQuery): Promise<Page<CatalogRecord>> {
    let request = this.db
      .from(this.table(catalog))
      .select("*", { count: "exact" })
      .order("sort_order")
      .order("slug");
    const parent = parentColumn[catalog];
    if (parent && query.parentId) request = request.eq(parent, query.parentId);
    const term = postgrestTerm(query.search ?? "");
    if (term) {
      const key = catalogTitleKey[catalog];
      request = request.or(`slug.ilike.*${term}*,draft->${key}->>en.ilike.*${term}*,draft->${key}->>ar.ilike.*${term}*`);
    }
    const from = (query.page - 1) * query.pageSize;
    const { data, error, count } = await request.range(from, from + query.pageSize - 1);
    if (error) fail(error);
    return { items: (data ?? []).map((row) => toCatalog(catalog, row)), total: count ?? 0 };
  }

  async listAll(catalog: CatalogKey) {
    const { data, error } = await this.db.from(this.table(catalog)).select("*").order("sort_order").order("slug").limit(1000);
    if (error) fail(error);
    return (data ?? []).map((row) => toCatalog(catalog, row));
  }

  async getCatalogItem(catalog: CatalogKey, id: string) {
    const { data, error } = await this.db.from(this.table(catalog)).select("*").eq("id", id).maybeSingle();
    if (error) fail(error);
    return data ? toCatalog(catalog, data) : null;
  }

  async createCatalogItem(catalog: CatalogKey, input: { slug: string; parentId: string | null; draft: Json }) {
    const { data: last } = await this.db
      .from(this.table(catalog))
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    const row: Row = { slug: input.slug, draft: input.draft, sort_order: ((last?.[0]?.sort_order as number) ?? 0) + 1 };
    const parent = parentColumn[catalog];
    if (parent) row[parent] = input.parentId;
    const { data, error } = await this.db.from(this.table(catalog)).insert(row).select("*").single();
    if (error) fail(error);
    return toCatalog(catalog, data);
  }

  async saveCatalogDraft(
    catalog: CatalogKey,
    id: string,
    draft: Json,
    extra: { parentId?: string | null; consentConfirmed?: boolean; verificationNote?: string | null } = {},
  ) {
    const row: Row = { draft };
    const parent = parentColumn[catalog];
    if (parent && extra.parentId !== undefined) row[parent] = extra.parentId;
    if (catalog === "reviews") {
      if (extra.consentConfirmed !== undefined) row.consent_confirmed = extra.consentConfirmed;
      if (extra.verificationNote !== undefined) row.verification_note = extra.verificationNote;
    }
    const { data, error } = await this.db.from(this.table(catalog)).update(row).eq("id", id).select("*").single();
    if (error) fail(error);
    return toCatalog(catalog, data);
  }

  async deleteCatalogItem(catalog: CatalogKey, id: string) {
    const { data, error } = await this.db.from(this.table(catalog)).delete().eq("id", id).select("id");
    if (error) fail(error);
    if (!data?.length) fail({ message: "Only administrators can delete entries.", code: "42501" });
  }

  async reorder(catalog: CatalogKey, orderedIds: string[]) {
    const { error } = await this.db.rpc("cms_reorder", { p_table: this.table(catalog), p_ids: orderedIds });
    if (error) fail(error);
  }

  // ---- lifecycle ------------------------------------------------------------------

  async publish(table: string, id: string) {
    const { error } = await this.db.rpc("cms_publish", { p_table: table, p_id: id });
    if (error) fail(error);
  }

  async unpublish(table: string, id: string) {
    const { error } = await this.db.rpc("cms_unpublish", { p_table: table, p_id: id });
    if (error) fail(error);
  }

  async revertToPublished(table: string, id: string) {
    const { data, error } = await this.db.from(table).select("published").eq("id", id).single();
    if (error) fail(error);
    if (!data.published) throw new CmsError("There is no published version to go back to.");
    const { error: updateError } = await this.db.from(table).update({ draft: data.published }).eq("id", id);
    if (updateError) fail(updateError);
  }

  async revisions(recordId: string): Promise<Revision[]> {
    const { data, error } = await this.db
      .from("cms_revisions")
      .select("id, action, draft, published, created_at")
      .eq("record_id", recordId)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) fail(error);
    return (data ?? []).map((row) => ({
      id: row.id as number,
      action: row.action as Revision["action"],
      draft: (row.draft as Json) ?? null,
      published: (row.published as Json) ?? null,
      createdAt: row.created_at as string,
    }));
  }

  async contentStatus(): Promise<ContentStatusRow[]> {
    const { data, error } = await this.db.rpc("cms_content_status");
    if (error) fail(error);
    return ((data ?? []) as Row[]).map((row) => ({
      table: row.table_name as string,
      recordId: row.record_id as string,
      label: row.label as string,
      status: row.status as ContentStatusRow["status"],
      updatedAt: row.updated_at as string,
      publishedAt: (row.published_at as string) ?? null,
    }));
  }

  async contentVersion() {
    const { data, error } = await this.db.from("cms_site_state").select("content_changed_at").maybeSingle();
    if (error) fail(error);
    return (data?.content_changed_at as string) ?? null;
  }

  // ---- media -------------------------------------------------------------------

  async listMedia(query: MediaQuery): Promise<Page<MediaRecord>> {
    let request = this.db.from("cms_media").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (query.kind && query.kind !== "all") request = request.eq("kind", query.kind);
    const term = postgrestTerm(query.search ?? "");
    if (term) {
      request = request.or(
        `title.ilike.*${term}*,original_name.ilike.*${term}*,alt->>en.ilike.*${term}*,alt->>ar.ilike.*${term}*`,
      );
    }
    const from = (query.page - 1) * query.pageSize;
    const { data, error, count } = await request.range(from, from + query.pageSize - 1);
    if (error) fail(error);
    return { items: (data ?? []).map(toMedia), total: count ?? 0 };
  }

  async getMedia(id: string) {
    const { data, error } = await this.db.from("cms_media").select("*").eq("id", id).maybeSingle();
    if (error) fail(error);
    return data ? toMedia(data) : null;
  }

  async uploadMedia(upload: PreparedUpload, onProgress: (fraction: number) => void) {
    const { data: session } = await this.db.auth.getSession();
    const token = session.session?.access_token;
    if (!token) fail({ message: "Your session has expired. Please sign in again.", code: "PGRST301" });

    const id = crypto.randomUUID();
    const path = `${upload.kind === "image" ? "images" : "videos"}/${id}.${upload.extension}`;
    const thumbPath = upload.thumbnail ? `thumbs/${id}.webp` : null;
    const objectUrl = (name: string) => `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${name}`;
    const headers = (type: string) => ({
      Authorization: `Bearer ${token}`,
      apikey: supabaseKey,
      "Content-Type": type,
      "x-upsert": "false",
      "cache-control": "max-age=31536000",
    });

    try {
      await uploadWithProgress(objectUrl(path), upload.file, headers(upload.mimeType), (f) => onProgress(f * 0.95));
      if (upload.thumbnail && thumbPath) await uploadWithProgress(objectUrl(thumbPath), upload.thumbnail, headers("image/webp"), () => {});
    } catch (error) {
      await this.db.storage.from(MEDIA_BUCKET).remove([path, ...(thumbPath ? [thumbPath] : [])]);
      throw new CmsError(error instanceof Error ? error.message : "Upload failed.");
    }

    const { data, error } = await this.db
      .from("cms_media")
      .insert({
        id,
        kind: upload.kind,
        storage_path: path,
        thumb_path: thumbPath,
        mime_type: upload.mimeType,
        size_bytes: upload.file.size,
        width: upload.width,
        height: upload.height,
        duration_seconds: upload.durationSeconds,
        original_name: upload.file.name.slice(0, 255),
        title: upload.file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 200),
      })
      .select("*")
      .single();
    if (error) {
      await this.db.storage.from(MEDIA_BUCKET).remove([path, ...(thumbPath ? [thumbPath] : [])]);
      fail(error);
    }
    onProgress(1);
    return toMedia(data);
  }

  async updateMedia(id: string, patch: { title?: string | null; alt?: Label }) {
    const { data, error } = await this.db.from("cms_media").update(patch).eq("id", id).select("*").single();
    if (error) fail(error);
    return toMedia(data);
  }

  async deleteMedia(id: string) {
    const media = await this.getMedia(id);
    if (!media) return;
    const { data, error } = await this.db.from("cms_media").delete().eq("id", id).select("id");
    if (error) fail(error);
    if (!data?.length) fail({ message: "Only administrators can delete files.", code: "42501" });
    const files = [media.storagePath, media.thumbPath].filter((p): p is string => Boolean(p));
    if (files.length) await this.db.storage.from(MEDIA_BUCKET).remove(files);
  }

  async mediaUsage(id: string): Promise<MediaUsage[]> {
    const { data, error } = await this.db.rpc("cms_media_usage", { p_asset: id });
    if (error) fail(error);
    return ((data ?? []) as Row[]).map((row) => ({
      table: row.table_name as string,
      recordId: row.record_id as string,
      label: row.label as string,
      inDraft: Boolean(row.in_draft),
      inPublished: Boolean(row.in_published),
    }));
  }

  async mediaUrls(records: MediaRecord[]) {
    const result: Record<string, { url: string; thumbUrl: string }> = {};
    const paths = new Set<string>();
    for (const media of records) {
      if (media.bundledSrc) result[media.id] = bundledUrls(media.bundledSrc);
      else {
        if (media.storagePath) paths.add(media.storagePath);
        if (media.thumbPath) paths.add(media.thumbPath);
      }
    }
    if (paths.size) {
      const { data } = await this.db.storage.from(MEDIA_BUCKET).createSignedUrls([...paths], 60 * 60);
      const signed = new Map((data ?? []).map((item) => [item.path, item.signedUrl]));
      for (const media of records) {
        if (media.bundledSrc || !media.storagePath) continue;
        const url = signed.get(media.storagePath) ?? "";
        result[media.id] = { url, thumbUrl: (media.thumbPath && signed.get(media.thumbPath)) || url };
      }
    }
    return result;
  }

  // ---- setup ---------------------------------------------------------------------

  async isInitialized() {
    const { count, error } = await this.db.from("cms_documents").select("id", { count: "exact", head: true });
    if (error) fail(error);
    return (count ?? 0) > 0;
  }

  /**
   * Copies the website's current content into the database. Existing rows are
   * kept (`ignoreDuplicates`), so running it again only fills what is missing.
   */
  async importContent(
    payload: Parameters<CmsStore["importContent"]>[0],
    options: { publish: boolean },
    onProgress: (progress: ImportProgress) => void,
  ) {
    const stamp = new Date().toISOString();
    const total = 3 + catalogKeys.length;
    let done = 0;
    const step = (label: string) => onProgress({ done: ++done, total, label });
    const state = (draft: Json) => (options.publish ? { draft, published: draft, published_at: stamp } : { draft });

    // 1. Bundled photos become library entries
    const { error: mediaError } = await this.db.from("cms_media").upsert(
      payload.bundledMedia.map((m) => ({
        kind: "image",
        bundled_src: m.src,
        mime_type: "image/webp",
        width: m.width,
        height: m.height,
        alt: m.alt,
        original_name: m.src.replace("/media/", ""),
      })),
      { onConflict: "bundled_src", ignoreDuplicates: true },
    );
    if (mediaError) fail(mediaError);
    const { data: mediaRows, error: listError } = await this.db.from("cms_media").select("id, bundled_src").not("bundled_src", "is", null);
    if (listError) fail(listError);
    const idBySrc = new Map((mediaRows ?? []).map((row) => [row.bundled_src as string, row.id as string]));
    step("Photo library");

    // 2. Page sections and settings
    const { error: docError } = await this.db.from("cms_documents").upsert(
      Object.entries(payload.documents).map(([key, value]) => ({ key, ...state(attachAssetIds(value, idBySrc)) })),
      { onConflict: "key", ignoreDuplicates: true },
    );
    if (docError) fail(docError);
    step("Page sections and settings");

    // 3. Catalogs (parents first, so children can reference them)
    const idsBySlug: Partial<Record<CatalogKey, Map<string, string>>> = {};
    for (const catalog of catalogKeys) {
      const def = catalogDefs[catalog];
      const parent = parentColumn[catalog];
      const rows = payload.catalogs[catalog].map((entry, index) => {
        const row: Row = { slug: entry.slug, sort_order: index + 1, ...state(attachAssetIds(entry.content, idBySrc)) };
        if (parent && def.parent && entry.parent) row[parent] = idsBySlug[def.parent]?.get(entry.parent);
        return row;
      });
      if (rows.length) {
        const { error } = await this.db.from(def.table).upsert(rows, { onConflict: "slug", ignoreDuplicates: true });
        if (error) fail(error);
      }
      const { data, error } = await this.db.from(def.table).select("id, slug");
      if (error) fail(error);
      idsBySlug[catalog] = new Map((data ?? []).map((row) => [row.slug as string, row.id as string]));
      step(def.label.en);
    }

    if (options.publish) await this.db.rpc("cms_refresh_media_visibility");
    step("Done");
  }
}
