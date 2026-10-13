"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { formatDateTime } from "@/lib/cms/admin-i18n";
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES, MEDIA_LIMITS } from "@/lib/cms/config";
import { formatBytes, prepareUpload, UploadRejected } from "@/lib/cms/media-upload";
import { CmsError, type MediaRecord, type MediaUsage } from "@/lib/cms/store/types";
import { cx } from "@/lib/cx";
import { AdminIcon } from "../AdminIcon";
import { useAdmin, useStore } from "../AdminProvider";
import { Badge, Button, Dialog, EmptyState, IconButton, Notice, Pagination, SearchInput, Skeleton, Tabs, TextInput } from "../ui";
import styles from "./media.module.css";

const PAGE_SIZE = 24;

type Upload = { id: string; name: string; progress: number; error?: string };
type Kind = "all" | "image" | "video";

export function MediaLibrary({
  accept = "any",
  onSelect,
}: {
  accept?: "image" | "video" | "any";
  /** Picker mode: called with the chosen file. */
  onSelect?: (media: MediaRecord) => void;
}) {
  const { t, mode, isAdmin, confirm, toast, locale } = useAdmin();
  const store = useStore();
  const inputId = useId();
  const [kind, setKind] = useState<Kind>(accept === "any" ? "all" : accept);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [items, setItems] = useState<MediaRecord[] | null>(null);
  const [total, setTotal] = useState(0);
  const [urls, setUrls] = useState<Record<string, { url: string; thumbUrl: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [selected, setSelected] = useState<MediaRecord | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Debounced search
  const [term, setTerm] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTerm(search);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let alive = true;
    store
      .listMedia({ search: term, kind, page, pageSize: PAGE_SIZE })
      .then(async (result) => {
        if (!alive) return;
        setItems(result.items);
        setTotal(result.total);
        setError(null);
        const resolved = await store.mediaUrls(result.items);
        if (alive) setUrls((current) => ({ ...current, ...resolved }));
      })
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : t("errorLoad")));
    return () => {
      alive = false;
    };
  }, [store, term, kind, page, reloadKey, t]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const startUploads = async (files: FileList | File[]) => {
    for (const file of Array.from(files)) {
      const id = `${file.name}-${Date.now()}-${Math.random()}`;
      setUploads((list) => [...list, { id, name: file.name, progress: 0 }]);
      const update = (patch: Partial<Upload>) => setUploads((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
      try {
        const prepared = await prepareUpload(file, accept);
        const media = await store.uploadMedia(prepared, (progress) => update({ progress }));
        update({ progress: 1 });
        toast(t("mediaUploaded", { name: file.name }));
        setUploads((list) => list.filter((u) => u.id !== id));
        reload();
        if (onSelect) setSelected(media);
      } catch (e) {
        const message = e instanceof UploadRejected ? (locale === "ar" ? e.reason.ar : e.reason.en) : e instanceof Error ? e.message : t("errorGeneric");
        update({ error: message });
      }
    }
  };

  const acceptAttr = [
    ...(accept !== "video" ? ACCEPTED_IMAGE_TYPES : []),
    ...(accept !== "image" ? ACCEPTED_VIDEO_TYPES : []),
  ].join(",");
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const uploadsEnabled = mode === "supabase";

  return (
    <div className={styles.library}>
      <div
        className={cx(styles.dropzone, dragging && styles.dragging, !uploadsEnabled && styles.disabled)}
        onDragOver={(event) => {
          if (!uploadsEnabled) return;
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (uploadsEnabled && event.dataTransfer.files.length) startUploads(event.dataTransfer.files);
        }}
      >
        <AdminIcon name="upload" size={22} />
        {uploadsEnabled ? (
          <>
            <p>
              {t("mediaUploadHint", { image: formatBytes(MEDIA_LIMITS.imageBytes), video: formatBytes(MEDIA_LIMITS.videoBytes) })}
            </p>
            <label htmlFor={inputId} className={styles.uploadButton}>
              <AdminIcon name="plus" size={16} />
              {t("upload")}
            </label>
            <input
              id={inputId}
              type="file"
              multiple
              accept={acceptAttr}
              className="sr-only"
              onChange={(event) => {
                if (event.target.files?.length) startUploads(event.target.files);
                event.target.value = "";
              }}
            />
          </>
        ) : (
          <p>{t("mediaUploadDisabled")}</p>
        )}
      </div>

      {uploads.length > 0 && (
        <ul className={styles.uploads} aria-live="polite">
          {uploads.map((upload) => (
            <li key={upload.id} className={styles.upload}>
              <span className={styles.uploadName}>{upload.error ? upload.name : t("mediaUploading", { name: upload.name })}</span>
              {upload.error ? (
                <>
                  <span className={styles.uploadError} role="alert">
                    {upload.error}
                  </span>
                  <IconButton label={t("close")} icon="close" onClick={() => setUploads((list) => list.filter((u) => u.id !== upload.id))} />
                </>
              ) : (
                <progress max={1} value={upload.progress} aria-label={upload.name} />
              )}
            </li>
          ))}
        </ul>
      )}

      <div className={styles.toolbar}>
        <SearchInput value={search} onChange={setSearch} placeholder={t("searchPlaceholder")} label={t("search")} />
        {accept === "any" && (
          <Tabs<Kind>
            label={t("mediaType")}
            value={kind}
            onChange={(value) => {
              setKind(value);
              setPage(1);
            }}
            items={[
              { value: "all", label: t("mediaKindAll") },
              { value: "image", label: t("mediaKindImages") },
              { value: "video", label: t("mediaKindVideos") },
            ]}
          />
        )}
        <div className={styles.viewToggle}>
          <IconButton label={t("mediaGrid")} icon="grid" aria-pressed={view === "grid"} onClick={() => setView("grid")} />
          <IconButton label={t("mediaList")} icon="list" aria-pressed={view === "list"} onClick={() => setView("list")} />
        </div>
        <span className={styles.count}>{t("results", { count: total })}</span>
      </div>

      {error && <Notice tone="danger">{error}</Notice>}
      {!items && !error && <Skeleton lines={4} />}
      {items && items.length === 0 && (
        <EmptyState icon="image" title={term ? t("noResults") : t("mediaEmpty")} />
      )}

      {items && items.length > 0 && view === "grid" && (
        <ul className={styles.grid}>
          {items.map((media) => (
            <li key={media.id}>
              <button
                type="button"
                className={cx(styles.tile, selected?.id === media.id && styles.tileSelected)}
                onClick={() => setSelected(media)}
                aria-label={media.title || media.originalName || media.id}
              >
                <span className={styles.thumb}>
                  {urls[media.id]?.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- library thumbnail
                    <img src={urls[media.id].thumbUrl} alt="" loading="lazy" />
                  ) : (
                    <AdminIcon name={media.kind === "video" ? "video" : "image"} size={26} />
                  )}
                  {media.kind === "video" && (
                    <span className={styles.videoTag}>
                      <AdminIcon name="video" size={14} />
                    </span>
                  )}
                </span>
                <span className={styles.tileName}>{media.title || media.originalName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {items && items.length > 0 && view === "list" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">{t("preview")}</span>
                </th>
                <th scope="col">{t("mediaTitleField")}</th>
                <th scope="col">{t("mediaType")}</th>
                <th scope="col">{t("mediaDimensions")}</th>
                <th scope="col">{t("mediaSize")}</th>
                <th scope="col">{t("mediaAdded")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((media) => (
                <tr key={media.id} className={selected?.id === media.id ? styles.rowSelected : undefined}>
                  <td>
                    <span className={styles.rowThumb}>
                      {urls[media.id]?.thumbUrl && (
                        // eslint-disable-next-line @next/next/no-img-element -- library thumbnail
                        <img src={urls[media.id].thumbUrl} alt="" loading="lazy" />
                      )}
                    </span>
                  </td>
                  <td>
                    <button type="button" className={styles.linkButton} onClick={() => setSelected(media)}>
                      {media.title || media.originalName}
                    </button>
                  </td>
                  <td>{media.bundledSrc ? t("mediaBundled") : (media.mimeType ?? media.kind)}</td>
                  <td dir="ltr">{media.width && media.height ? `${media.width}×${media.height}` : "—"}</td>
                  <td dir="ltr">{formatBytes(media.sizeBytes)}</td>
                  <td>{formatDateTime(locale, media.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        pages={pages}
        onPage={setPage}
        labels={{ previous: t("previous"), next: t("next"), pageOf: t("pageOf", { page, pages }) }}
      />

      {selected && (
        <MediaDetails
          key={selected.id}
          media={selected}
          url={urls[selected.id]?.url ?? null}
          onClose={() => setSelected(null)}
          onSelect={onSelect}
          onChanged={(updated) => {
            setSelected(updated);
            reload();
          }}
          onDeleted={() => {
            setSelected(null);
            reload();
          }}
          canDelete={isAdmin}
          confirm={confirm}
        />
      )}
    </div>
  );
}

function MediaDetails({
  media,
  url,
  onClose,
  onSelect,
  onChanged,
  onDeleted,
  canDelete,
  confirm,
}: {
  media: MediaRecord;
  url: string | null;
  onClose: () => void;
  onSelect?: (media: MediaRecord) => void;
  onChanged: (media: MediaRecord) => void;
  onDeleted: () => void;
  canDelete: boolean;
  confirm: ReturnType<typeof useAdmin>["confirm"];
}) {
  const { t, locale, toast } = useAdmin();
  const store = useStore();
  const [title, setTitle] = useState(media.title ?? "");
  const [alt, setAlt] = useState(media.alt);
  const [usage, setUsage] = useState<MediaUsage[] | null>(null);
  const [busy, setBusy] = useState(false);

  // Mounted per file (keyed by id), so the fields start from that file's values
  useEffect(() => {
    let alive = true;
    store
      .mediaUsage(media.id)
      .then((list) => alive && setUsage(list))
      .catch(() => alive && setUsage([]));
    return () => {
      alive = false;
    };
  }, [media.id, store]);

  const usedByPublished = usage?.some((u) => u.inPublished) ?? false;

  const save = async () => {
    setBusy(true);
    try {
      onChanged(await store.updateMedia(media.id, { title: title || null, alt }));
      toast(t("saved"));
    } catch (e) {
      toast(e instanceof Error ? e.message : t("errorGeneric"), "danger");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!(await confirm({ message: t("mediaDeleteConfirm"), confirmLabel: t("delete"), danger: true }))) return;
    try {
      await store.deleteMedia(media.id);
      toast(t("deleted"));
      onDeleted();
    } catch (e) {
      toast(e instanceof CmsError || e instanceof Error ? e.message : t("errorGeneric"), "danger");
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={t("mediaDetails")}
      size="lg"
      closeLabel={t("close")}
      footer={
        <>
          {canDelete && (
            <Button variant="danger" icon="trash" onClick={remove} disabled={usedByPublished} title={usedByPublished ? t("mediaDeleteBlocked") : undefined}>
              {t("delete")}
            </Button>
          )}
          <Button onClick={save} busy={busy} icon="check">
            {t("save")}
          </Button>
          {onSelect && (
            <Button variant="primary" icon="check" onClick={() => onSelect({ ...media, title: title || null, alt })}>
              {t("mediaSelect")}
            </Button>
          )}
        </>
      }
    >
      <div className={styles.details}>
        <div className={styles.detailsPreview}>
          {url ? (
            media.kind === "video" ? (
              <video src={url} controls preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- library preview
              <img src={url} alt="" />
            )
          ) : (
            <AdminIcon name={media.kind === "video" ? "video" : "image"} size={40} />
          )}
        </div>
        <div className={styles.detailsSide}>
          <dl className={styles.meta}>
            <div>
              <dt>{t("mediaType")}</dt>
              <dd>{media.bundledSrc ? t("mediaBundled") : `${t("mediaUploadedFile")} · ${media.mimeType ?? media.kind}`}</dd>
            </div>
            <div>
              <dt>{t("mediaDimensions")}</dt>
              <dd dir="ltr">{media.width && media.height ? `${media.width} × ${media.height}` : "—"}</dd>
            </div>
            <div>
              <dt>{t("mediaSize")}</dt>
              <dd dir="ltr">{formatBytes(media.sizeBytes)}</dd>
            </div>
            <div>
              <dt>{t("mediaAdded")}</dt>
              <dd>{formatDateTime(locale, media.createdAt)}</dd>
            </div>
          </dl>
          {!media.bundledSrc && (
            <Badge tone={media.isPublic ? "success" : "neutral"} icon={media.isPublic ? "globe" : "lock"}>
              {media.isPublic ? t("mediaPublic") : t("mediaPrivate")}
            </Badge>
          )}
          <label className={styles.metaLabel}>
            {t("mediaTitleField")}
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </label>
          <fieldset className={styles.metaGroup}>
            <legend>{t("mediaAltDefault")}</legend>
            <TextInput lang="en" dir="ltr" aria-label={`${t("mediaAltDefault")} — ${t("english")}`} value={alt.en} onChange={(e) => setAlt({ ...alt, en: e.target.value })} />
            <TextInput lang="ar" dir="rtl" aria-label={`${t("mediaAltDefault")} — ${t("arabic")}`} value={alt.ar} onChange={(e) => setAlt({ ...alt, ar: e.target.value })} />
            <p className={styles.help}>{t("mediaAltHelp")}</p>
          </fieldset>
          <div>
            <p className={styles.metaLabel}>{t("mediaUsage")}</p>
            {!usage ? (
              <Skeleton lines={2} />
            ) : usage.length === 0 ? (
              <p className={styles.help}>{t("mediaUnused")}</p>
            ) : (
              <ul className={styles.usage}>
                {usage.map((u) => (
                  <li key={`${u.table}-${u.recordId}`}>
                    <code>{u.label}</code>
                    {u.inPublished && <Badge tone="success">{t("mediaUsedPublished")}</Badge>}
                    {u.inDraft && <Badge tone="warning">{t("mediaUsedDraft")}</Badge>}
                  </li>
                ))}
              </ul>
            )}
            {usedByPublished && <p className={styles.help}>{t("mediaDeleteBlocked")}</p>}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
