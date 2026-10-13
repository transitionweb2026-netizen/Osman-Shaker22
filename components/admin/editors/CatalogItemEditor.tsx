"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CatalogKey } from "@/lib/cms/model";
import { previewCatalogs, type PreviewTarget } from "@/lib/cms/preview";
import { catalogs as catalogDefs } from "@/lib/cms/registry";
import { displayText, L, type Json } from "@/lib/cms/schema";
import { statusOf, type CatalogRecord } from "@/lib/cms/store/types";
import { useAdmin, useStore } from "../AdminProvider";
import { Button, Checkbox, EmptyState, FieldWrap, Select, Skeleton, TextArea } from "../ui";
import { useAsync } from "../useAsync";
import { catalogRules, findReferences, loadCatalogs, referencedCatalogs, toEntries } from "./catalog-data";
import { EditorFrame } from "./EditorFrame";
import styles from "./editor.module.css";

type Extra = { parentId: string | null; consentConfirmed: boolean; verificationNote: string };
type Loaded = { record: CatalogRecord | null; catalogs: Partial<Record<CatalogKey, CatalogRecord[]>> };

/** Editor for one catalog entry (`/admin/videos/?id=…`). */
export function CatalogItemEditor({ catalog, id, listHref }: { catalog: CatalogKey; id: string; listHref: string }) {
  const { t, tl, navigate } = useAdmin();
  const store = useStore();

  const load = useCallback(async (): Promise<Loaded> => {
    const def = catalogDefs[catalog];
    // Its own catalog (preview, children), its parents and anything it references
    const needed = [
      ...new Set<CatalogKey>([
        ...referencedCatalogs(def.fields),
        ...previewCatalogs({ kind: "catalog", catalog, slug: "" }),
        ...(def.parent ? [def.parent] : []),
      ]),
    ];
    const [record, catalogs] = await Promise.all([store.getCatalogItem(catalog, id), loadCatalogs(store, needed)]);
    return { record, catalogs };
  }, [store, catalog, id]);

  const { data, error, version, reload } = useAsync(load);

  if (error && !data) {
    return (
      <EmptyState icon="warning" title={t("errorLoad")} action={<Button onClick={reload}>{t("retry")}</Button>}>
        {error}
      </EmptyState>
    );
  }
  if (!data) return <Skeleton lines={8} />;
  if (!data.record) {
    return (
      <EmptyState
        icon="warning"
        title={t("notFound")}
        action={<Button onClick={() => navigate(listHref)}>{t("backTo", { name: tl(catalogDefs[catalog].label) })}</Button>}
      />
    );
  }
  return <CatalogItemForm key={version} catalog={catalog} initial={data.record} catalogs={data.catalogs} listHref={listHref} onReload={reload} />;
}

function CatalogItemForm({
  catalog,
  initial,
  catalogs,
  listHref,
  onReload,
}: {
  catalog: CatalogKey;
  initial: CatalogRecord;
  catalogs: Partial<Record<CatalogKey, CatalogRecord[]>>;
  listHref: string;
  onReload: () => void;
}) {
  const { t, tl, locale, isAdmin, setDirty, confirm, toast, navigate } = useAdmin();
  const store = useStore();
  const def = catalogDefs[catalog];
  const [record, setRecord] = useState(initial);
  const [value, setValue] = useState<Json>(initial.draft);
  const [extra, setExtra] = useState<Extra>({
    parentId: initial.parentId,
    consentConfirmed: Boolean(initial.consentConfirmed),
    verificationNote: initial.verificationNote ?? "",
  });
  const snapshot = (draft: Json, e: Extra) => JSON.stringify({ draft, e });
  const [savedJson, setSavedJson] = useState(() => snapshot(value, extra));
  const recordRef = useRef(initial);

  const applyRecord = (next: CatalogRecord | null) => {
    if (!next) return;
    recordRef.current = next;
    setRecord(next);
  };

  const dirty = snapshot(value, extra) !== savedJson;
  useEffect(() => {
    setDirty(dirty);
  }, [dirty, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);

  const extraIssues = useMemo(() => {
    const issues = catalogRules(catalog, value, extra);
    if (def.parent && !extra.parentId) {
      issues.unshift({ path: "parent", severity: "invalid", message: L("Choose where it belongs.", "اختر القسم الذي يتبعه.") });
    }
    return issues;
  }, [catalog, def.parent, value, extra]);

  const target: PreviewTarget = useMemo(() => ({ kind: "catalog", catalog, slug: initial.slug }), [catalog, initial.slug]);

  // The catalog as the site would show it, with this entry's current edits
  const previewEntries = useMemo(() => {
    const lists = { ...catalogs };
    lists[catalog] = (lists[catalog] ?? []).map((r) => (r.id === initial.id ? { ...r, draft: value, parentId: extra.parentId } : r));
    return toEntries(lists);
  }, [catalogs, catalog, initial.id, value, extra.parentId]);

  const parentDef = def.parent ? catalogDefs[def.parent] : null;
  const parents = def.parent ? (catalogs[def.parent] ?? []) : [];
  const itemTitle = displayText(def.itemTitle(value), locale) || record.slug;

  const remove = async () => {
    const children = (Object.keys(catalogDefs) as CatalogKey[])
      .filter((key) => catalogDefs[key].parent === catalog)
      .reduce((count, key) => count + (catalogs[key]?.filter((r) => r.parentId === record.id).length ?? 0), 0);
    if (children > 0) {
      toast(t("deleteHasChildren", { count: children }), "danger");
      return;
    }
    const references = findReferences(await store.listDocuments(), catalog, record.slug);
    const detail = [
      record.published ? t("deletePublishedWarning") : "",
      references.length ? t("referencedBy", { list: references.map(tl).join(locale === "ar" ? "، " : ", ") }) : "",
    ]
      .filter(Boolean)
      .join(" ");
    if (!(await confirm({ message: t("deleteConfirm", { name: itemTitle }), detail: detail || undefined, confirmLabel: t("delete"), danger: true }))) {
      return;
    }
    await store.deleteCatalogItem(catalog, record.id);
    setDirty(false);
    toast(t("deleted"));
    navigate(listHref);
  };

  return (
    <EditorFrame
      title={itemTitle}
      description={`${tl(def.singular)} · ${record.slug}`}
      back={{ href: listHref, label: t("backTo", { name: tl(def.label) }) }}
      status={statusOf(record.draft, record.published)}
      updatedAt={record.updatedAt}
      publishedAt={record.publishedAt}
      recordId={record.id}
      fields={def.fields}
      value={value}
      onChange={setValue}
      dirty={dirty}
      readOnly={false}
      catalogs={catalogs}
      extraIssues={extraIssues}
      onSave={async () => {
        applyRecord(
          await store.saveCatalogDraft(catalog, record.id, value, {
            ...(def.parent ? { parentId: extra.parentId } : {}),
            ...(catalog === "reviews" ? { consentConfirmed: extra.consentConfirmed } : {}),
            ...(catalog === "reviews" && isAdmin ? { verificationNote: extra.verificationNote || null } : {}),
          }),
        );
        setSavedJson(snapshot(value, extra));
      }}
      onPublish={async () => {
        await store.publish(def.table, recordRef.current.id);
        applyRecord(await store.getCatalogItem(catalog, recordRef.current.id));
      }}
      onUnpublish={async () => {
        await store.unpublish(def.table, recordRef.current.id);
        applyRecord(await store.getCatalogItem(catalog, recordRef.current.id));
      }}
      onRevert={async () => {
        await store.revertToPublished(def.table, recordRef.current.id);
        setDirty(false);
        onReload();
      }}
      onDelete={isAdmin ? remove : undefined}
      onRestore={(draft) => setValue(structuredClone(draft))}
      preview={{ target, value: null, catalogs: previewEntries }}
    >
      {(parentDef || catalog === "reviews") && (
        <div className={styles.extras}>
          {parentDef && (
            <FieldWrap label={t("parent")} htmlFor="cms-parent" required>
              <Select id="cms-parent" value={extra.parentId ?? ""} onChange={(e) => setExtra({ ...extra, parentId: e.target.value || null })}>
                {!extra.parentId && <option value="">{t("fieldReferenceChoose")}</option>}
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {displayText(parentDef.itemTitle(p.draft), locale) || p.slug}
                  </option>
                ))}
              </Select>
            </FieldWrap>
          )}
          {catalog === "reviews" && (
            <>
              <div className={styles.extrasWide}>
                <Checkbox
                  checked={extra.consentConfirmed}
                  onChange={(consentConfirmed) => setExtra({ ...extra, consentConfirmed })}
                  label={t("consent")}
                />
              </div>
              <div className={styles.extrasWide}>
                <FieldWrap label={t("verificationNote")} htmlFor="cms-verification" help={isAdmin ? undefined : t("adminOnly")}>
                  <TextArea
                    id="cms-verification"
                    rows={2}
                    maxLength={500}
                    value={extra.verificationNote}
                    readOnly={!isAdmin}
                    onChange={(e) => setExtra({ ...extra, verificationNote: e.target.value })}
                  />
                </FieldWrap>
              </div>
            </>
          )}
        </div>
      )}
    </EditorFrame>
  );
}
