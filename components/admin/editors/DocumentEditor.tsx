"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CatalogKey, DocumentKey } from "@/lib/cms/model";
import { previewCatalogs, type PreviewTarget } from "@/lib/cms/preview";
import { documents, pageOfDocument } from "@/lib/cms/registry";
import type { Json } from "@/lib/cms/schema";
import { statusOf, type CatalogRecord, type DocumentRecord } from "@/lib/cms/store/types";
import { useAdmin, useStore } from "../AdminProvider";
import { Button, EmptyState, Skeleton } from "../ui";
import { useAsync } from "../useAsync";
import { defaultDocument, loadCatalogs, referencedCatalogs, toEntries } from "./catalog-data";
import { EditorFrame } from "./EditorFrame";

const TABLE = "cms_documents";

type Loaded = { record: DocumentRecord | null; catalogs: Partial<Record<CatalogKey, CatalogRecord[]>> };

/** Editor for one page section or site setting (`?doc=home.hero`). */
export function DocumentEditor({ docKey }: { docKey: DocumentKey }) {
  const { t } = useAdmin();
  const store = useStore();

  const load = useCallback(async (): Promise<Loaded> => {
    const target: PreviewTarget = { kind: "document", key: docKey };
    const needed = [...new Set([...referencedCatalogs(documents[docKey].fields), ...previewCatalogs(target)])];
    const [record, catalogs] = await Promise.all([store.getDocument(docKey), loadCatalogs(store, needed)]);
    return { record, catalogs };
  }, [store, docKey]);

  const { data, error, version, reload } = useAsync(load);

  if (error && !data) {
    return (
      <EmptyState icon="warning" title={t("errorLoad")} action={<Button onClick={reload}>{t("retry")}</Button>}>
        {error}
      </EmptyState>
    );
  }
  if (!data) return <Skeleton lines={8} />;
  // A reload (after discarding changes) starts the form again from the stored draft
  return <DocumentForm key={version} docKey={docKey} loaded={data} onReload={reload} />;
}

function DocumentForm({ docKey, loaded, onReload }: { docKey: DocumentKey; loaded: Loaded; onReload: () => void }) {
  const { t, tl, isAdmin, setDirty } = useAdmin();
  const store = useStore();
  const def = documents[docKey];
  const page = pageOfDocument(docKey);
  const readOnly = Boolean(def.adminOnly) && !isAdmin;

  const [record, setRecord] = useState(loaded.record);
  const [value, setValue] = useState<Json>(() => loaded.record?.draft ?? defaultDocument(docKey));
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(value));
  const recordRef = useRef(loaded.record);

  const applyRecord = (next: DocumentRecord | null) => {
    recordRef.current = next;
    setRecord(next);
  };

  const dirty = JSON.stringify(value) !== savedJson;
  useEffect(() => {
    setDirty(dirty);
  }, [dirty, setDirty]);
  useEffect(() => () => setDirty(false), [setDirty]);

  const target: PreviewTarget = useMemo(() => ({ kind: "document", key: docKey }), [docKey]);
  const previewEntries = useMemo(() => toEntries(loaded.catalogs), [loaded.catalogs]);

  const back = page
    ? { href: `/admin/pages/?page=${page.key}`, label: t("backTo", { name: tl(page.label) }) }
    : { href: "/admin/settings/", label: t("backTo", { name: t("navSettings") }) };

  const requireRecord = () => {
    const current = recordRef.current;
    if (!current) throw new Error(t("errorGeneric"));
    return current;
  };

  return (
    <EditorFrame
      title={tl(def.label)}
      description={def.description ? tl(def.description) : undefined}
      back={back}
      status={record ? statusOf(record.draft, record.published) : "new"}
      updatedAt={record?.updatedAt}
      publishedAt={record?.publishedAt}
      recordId={record?.id ?? null}
      fields={def.fields}
      value={value}
      onChange={setValue}
      dirty={dirty}
      readOnly={readOnly}
      catalogs={loaded.catalogs}
      onSave={async () => {
        applyRecord(await store.saveDocumentDraft(docKey, value));
        setSavedJson(JSON.stringify(value));
      }}
      onPublish={async () => {
        await store.publish(TABLE, requireRecord().id);
        applyRecord(await store.getDocument(docKey));
      }}
      onRevert={async () => {
        await store.revertToPublished(TABLE, requireRecord().id);
        setDirty(false);
        onReload();
      }}
      onRestore={(draft) => setValue(structuredClone(draft))}
      preview={{ target, value, catalogs: previewEntries }}
    />
  );
}
