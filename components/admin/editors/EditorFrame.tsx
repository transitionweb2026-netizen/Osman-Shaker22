"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { relativeTime } from "@/lib/cms/admin-i18n";
import type { CatalogEntry, CatalogKey } from "@/lib/cms/model";
import { hasPreview, type PreviewTarget } from "@/lib/cms/preview";
import { blocksPublish, blocksSave, validate, type Field, type Issue, type Json, type Label } from "@/lib/cms/schema";
import type { CatalogRecord, MediaRecord, RecordStatus } from "@/lib/cms/store/types";
import { cx } from "@/lib/cx";
import { AdminIcon } from "../AdminIcon";
import { useAdmin, useStore } from "../AdminProvider";
import { FormContext, type FormContextValue, type LanguageView } from "../fields/context";
import { SchemaForm } from "../fields/SchemaForm";
import { MediaLibrary } from "../media/MediaLibrary";
import { PreviewPane } from "../preview/PreviewPane";
import { Badge, Button, Dialog, Notice, StatusBadge, Tabs } from "../ui";
import { RevisionsDialog } from "./RevisionsDialog";
import styles from "./editor.module.css";

type Busy = null | "save" | "publish" | "unpublish" | "revert" | "delete";

export type EditorFrameProps = {
  title: ReactNode;
  description?: ReactNode;
  back?: { href: string; label: string };
  status: RecordStatus | "new";
  updatedAt?: string | null;
  publishedAt?: string | null;
  /** Database id (history); null until the record exists. */
  recordId: string | null;
  fields: Field[];
  value: Json;
  onChange: (value: Json) => void;
  dirty: boolean;
  readOnly: boolean;
  catalogs: Partial<Record<CatalogKey, CatalogRecord[]>>;
  /** Checks outside the schema (e.g. a review's consent). */
  extraIssues?: Issue[];
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  onRevert?: () => Promise<void>;
  onUnpublish?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  onRestore: (draft: Json) => void;
  preview?: { target: PreviewTarget; value: Json | null; catalogs: Partial<Record<CatalogKey, CatalogEntry[]>> };
  /** Controls shown above the fields (parent, consent…). */
  children?: ReactNode;
};

/** Field label path for an issue, e.g. "Primary button › Button text". */
function issueLabel(fields: Field[], path: string, tl: (label: Label) => string): string {
  const parts = path.split(".");
  const names: string[] = [];
  let current: Field[] | undefined = fields;
  for (let i = 0; i < parts.length && current; i++) {
    const part = parts[i];
    if (/^\d+$/.test(part)) {
      names.push(`#${Number(part) + 1}`);
      continue;
    }
    const field: Field | undefined = current.find((f) => f.key === part);
    if (!field) break;
    names.push(tl(field.label));
    current =
      field.type === "group" || field.type === "list"
        ? field.fields
        : field.type === "optional" && (field.field.type === "group" || field.field.type === "list")
          ? field.field.fields
          : undefined;
  }
  if (parts.at(-1) === "en") names.push("EN");
  if (parts.at(-1) === "ar") names.push("AR");
  return names.join(" › ");
}

export function EditorFrame(props: EditorFrameProps) {
  const {
    title,
    description,
    back,
    status,
    updatedAt,
    publishedAt,
    recordId,
    fields,
    value,
    onChange,
    dirty,
    readOnly,
    catalogs,
    extraIssues,
    preview,
    children,
  } = props;
  const { t, tl, locale, toast, confirm } = useAdmin();
  const store = useStore();
  const [busy, setBusy] = useState<Busy>(null);
  const [view, setView] = useState<LanguageView>("both");
  const [showPreview, setShowPreview] = useState(false);
  const [showIssues, setShowIssues] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [picker, setPicker] = useState<{ kind: "image" | "video"; resolve: (media: MediaRecord | null) => void } | null>(null);
  const urlCache = useRef(new Map<string, string | null>());

  const slugs = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(catalogs).map(([key, records]) => [key, new Set((records ?? []).map((r) => r.slug))]),
      ) as Partial<Record<CatalogKey, Set<string>>>,
    [catalogs],
  );
  const issues = useMemo(() => [...validate(fields, value, { catalogs: slugs }), ...(extraIssues ?? [])], [fields, value, slugs, extraIssues]);
  const invalid = issues.filter((i) => i.severity === "invalid");
  const incomplete = issues.filter((i) => i.severity === "incomplete");
  const warnings = issues.filter((i) => i.severity === "warning");

  const pickMedia = useCallback(
    (kind: "image" | "video") => new Promise<MediaRecord | null>((resolve) => setPicker({ kind, resolve })),
    [],
  );
  const closePicker = (media: MediaRecord | null) => {
    picker?.resolve(media);
    setPicker(null);
  };

  const mediaUrl = useCallback(
    async (assetId: string) => {
      if (urlCache.current.has(assetId)) return urlCache.current.get(assetId) ?? null;
      const record = await store.getMedia(assetId).catch(() => null);
      const url = record ? ((await store.mediaUrls([record]))[record.id]?.url ?? null) : null;
      urlCache.current.set(assetId, url);
      return url;
    },
    [store],
  );

  const form: FormContextValue = useMemo(
    () => ({ issues, view, readOnly, catalogs, pickMedia, mediaUrl }),
    [issues, view, readOnly, catalogs, pickMedia, mediaUrl],
  );

  const run = async (kind: Exclude<Busy, null>, action: () => Promise<void>, success: string) => {
    setBusy(kind);
    try {
      await action();
      toast(success);
      return true;
    } catch (error) {
      toast(error instanceof Error ? error.message : t("errorGeneric"), "danger");
      return false;
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (blocksSave(issues)) {
      setShowIssues(true);
      toast(t("issuesInvalid"), "danger");
      return false;
    }
    return run("save", props.onSave, t("saved"));
  };

  const publish = async () => {
    if (blocksSave(issues) || blocksPublish(issues)) {
      setShowIssues(true);
      toast(invalid.length ? t("issuesInvalid") : t("issuesIncomplete", { count: incomplete.length }), "danger");
      return;
    }
    if ((dirty || status === "new") && !(await save())) return;
    await run("publish", props.onPublish, t("published"));
  };

  const revert = async () => {
    if (!props.onRevert) return;
    if (!(await confirm({ message: t("revertConfirm"), confirmLabel: t("revert"), danger: true }))) return;
    await run("revert", props.onRevert, t("reverted"));
  };

  const unpublish = async () => {
    if (!props.onUnpublish) return;
    if (!(await confirm({ message: `${t("unpublish")}?`, detail: t("deletePublishedWarning"), confirmLabel: t("unpublish"), danger: true }))) return;
    await run("unpublish", props.onUnpublish, t("unpublished"));
  };

  // The owner confirms, reports and navigates away
  const remove = async () => {
    if (!props.onDelete) return;
    setBusy("delete");
    try {
      await props.onDelete();
    } catch (error) {
      toast(error instanceof Error ? error.message : t("errorGeneric"), "danger");
    } finally {
      setBusy(null);
    }
  };

  // Ctrl/⌘+S saves the draft
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    if (readOnly) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [readOnly]);

  const statusLabels = { draft: t("statusDraft"), published: t("statusPublished"), changed: t("statusChanged"), new: t("statusNew") };
  const previewAvailable = preview && hasPreview(preview.target);

  return (
    <FormContext.Provider value={form}>
      <div className={cx(styles.editor, showPreview && previewAvailable && styles.withPreview)}>
        <header className={styles.header}>
          {back && (
            <Link href={back.href} className={styles.back}>
              <AdminIcon name="chevron" size={16} className={styles.backIcon} />
              {back.label}
            </Link>
          )}
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.badges}>
              <StatusBadge status={status} labels={statusLabels} />
              {dirty && <Badge tone="accent">{t("unsavedBadge")}</Badge>}
            </div>
          </div>
          {description && <p className={styles.description}>{description}</p>}
          <p className={styles.times}>
            {updatedAt && <span>{t("lastSaved", { time: relativeTime(locale, updatedAt) })}</span>}
            <span>{publishedAt ? t("lastPublished", { time: relativeTime(locale, publishedAt) }) : t("neverPublished")}</span>
          </p>
        </header>

        <div className={styles.toolbar} role="toolbar" aria-label={t("edit")}>
          <Tabs<LanguageView>
            label={t("language")}
            value={view}
            onChange={setView}
            items={[
              { value: "both", label: t("bothLanguages") },
              { value: "en", label: t("english") },
              { value: "ar", label: t("arabic") },
            ]}
          />
          <div className={styles.actions}>
            {recordId && (
              <Button variant="ghost" icon="history" onClick={() => setHistoryOpen(true)}>
                {t("history")}
              </Button>
            )}
            {previewAvailable && (
              <Button variant="ghost" icon={showPreview ? "eyeOff" : "eye"} onClick={() => setShowPreview((v) => !v)} aria-pressed={showPreview}>
                {showPreview ? t("hidePreview") : t("preview")}
              </Button>
            )}
            {!readOnly && (
              <>
                {props.onDelete && (
                  <Button variant="ghost" icon="trash" onClick={remove} busy={busy === "delete"}>
                    {t("delete")}
                  </Button>
                )}
                {props.onUnpublish && status !== "draft" && status !== "new" && (
                  <Button variant="ghost" icon="eyeOff" onClick={unpublish} busy={busy === "unpublish"}>
                    {t("unpublish")}
                  </Button>
                )}
                {props.onRevert && status === "changed" && (
                  <Button variant="ghost" icon="refresh" onClick={revert} busy={busy === "revert"}>
                    {t("revert")}
                  </Button>
                )}
                <Button icon="check" onClick={save} busy={busy === "save"} disabled={!dirty && status !== "new"}>
                  {busy === "save" ? t("saving") : t("save")}
                </Button>
                <Button
                  variant="primary"
                  icon="publish"
                  onClick={publish}
                  busy={busy === "publish"}
                  disabled={!dirty && status === "published"}
                >
                  {busy === "publish" ? t("publishing") : t("publish")}
                </Button>
              </>
            )}
          </div>
        </div>

        {readOnly && <Notice tone="info" icon="lock">{t("readOnlyNotice")}</Notice>}

        {(invalid.length > 0 || incomplete.length > 0 || warnings.length > 0) && (
          <div className={cx(styles.issues, invalid.length ? styles.issuesInvalid : incomplete.length ? styles.issuesIncomplete : styles.issuesWarning)}>
            <div className={styles.issuesHead}>
              <AdminIcon name={invalid.length || incomplete.length ? "warning" : "info"} size={18} />
              <p>
                {invalid.length > 0 && <strong>{t("issuesInvalid")} </strong>}
                {incomplete.length > 0 && <span>{t("issuesIncomplete", { count: incomplete.length })} </span>}
                {warnings.length > 0 && <span className={styles.issuesNote}>{t("issuesWarnings", { count: warnings.length })}</span>}
              </p>
              <Button size="sm" variant="ghost" onClick={() => setShowIssues((v) => !v)} aria-expanded={showIssues}>
                {showIssues ? t("hide") : t("showIssues")}
              </Button>
            </div>
            {showIssues && (
              <ul className={styles.issueList}>
                {[...invalid, ...incomplete, ...warnings].map((issue, index) => {
                  const where = issueLabel(fields, issue.path, tl);
                  return (
                    <li key={`${issue.path}-${index}`} className={styles[`issue-${issue.severity}`]}>
                      {where && <span className={styles.issuePath}>{where}</span>}
                      <span>{tl(issue.message)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        <div className={styles.body}>
          <div className={styles.formColumn}>
            {children}
            <fieldset className={styles.fieldset} disabled={readOnly}>
              <SchemaForm fields={fields} value={value} onChange={onChange} />
            </fieldset>
          </div>
          {showPreview && previewAvailable && preview && (
            <aside className={styles.previewColumn}>
              <PreviewPane target={preview.target} value={preview.value} catalogs={preview.catalogs} />
            </aside>
          )}
        </div>
      </div>

      <Dialog
        open={Boolean(picker)}
        onClose={() => closePicker(null)}
        title={t("mediaPick")}
        size="xl"
        closeLabel={t("close")}
      >
        {picker && <MediaLibrary accept={picker.kind} onSelect={(media) => closePicker(media)} />}
      </Dialog>

      {historyOpen && recordId && (
        <RevisionsDialog
          recordId={recordId}
          onClose={() => setHistoryOpen(false)}
          onRestore={(draft) => {
            props.onRestore(draft);
            setHistoryOpen(false);
            toast(t("historyRestored"), "info");
          }}
          readOnly={readOnly}
        />
      )}
    </FormContext.Provider>
  );
}
