"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { PageLayout } from "@/content/types";
import type { DocumentKey } from "@/lib/cms/model";
import { catalogs, documents, pages, type PageDef } from "@/lib/cms/registry";
import { statusOf, type DocumentRecord } from "@/lib/cms/store/types";
import { normalizeLayout } from "@/lib/layout";
import { AdminIcon } from "../AdminIcon";
import { useAdmin, useStore } from "../AdminProvider";
import { Badge, ButtonLink, Card, EmptyState, Notice, PageHeader, Skeleton, StatusBadge } from "../ui";
import { defaultDocument } from "../editors/catalog-data";
import styles from "./screens.module.css";

export function PagesScreen() {
  const params = useSearchParams();
  const key = params.get("page");
  const page = pages.find((p) => p.key === key);
  const { t } = useAdmin();
  const store = useStore();
  const [docs, setDocs] = useState<Map<string, DocumentRecord> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    store
      .listDocuments()
      .then((list) => setDocs(new Map(list.map((d) => [d.key, d]))))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t("errorLoad")));
  }, [store, t]);

  if (key && !page) return <EmptyState icon="warning" title={t("notFound")} />;
  if (error) return <Notice tone="danger">{error}</Notice>;
  if (!docs) return <Skeleton lines={8} />;
  return page ? <PageDetail page={page} docs={docs} /> : <PageList docs={docs} />;
}

function PageList({ docs }: { docs: Map<string, DocumentRecord> }) {
  const { t, tl } = useAdmin();
  return (
    <div className={styles.stack}>
      <PageHeader title={t("pagesTitle")} description={t("pagesIntro")} />
      <ul className={styles.cards}>
        {pages.map((page) => {
          const keys = [page.seo, ...(page.layout ? [page.layout] : []), ...page.sections.flatMap((s) => s.documents)];
          const changed = keys.filter((k) => {
            const doc = docs.get(k);
            return !doc || statusOf(doc.draft, doc.published) !== "published";
          }).length;
          return (
            <li key={page.key}>
              <Link href={`/admin/pages/?page=${page.key}`} className={styles.pageCard}>
                <span className={styles.pageCardIcon}>
                  <AdminIcon name={page.key === "home" ? "home" : "pages"} size={20} />
                </span>
                <span className={styles.pageCardTitle}>{tl(page.label)}</span>
                <span className={styles.muted} dir="ltr">
                  /{page.path}
                </span>
                <span className={styles.pageCardMeta}>
                  {t("pageSections")}: {page.sections.length}
                  {changed > 0 && <Badge tone="info">{t("dashPending")}: {changed}</Badge>}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PageDetail({ page, docs }: { page: PageDef; docs: Map<string, DocumentRecord> }) {
  const { t, tl, locale } = useAdmin();
  const statusLabels = { draft: t("statusDraft"), published: t("statusPublished"), changed: t("statusChanged"), new: t("statusNew") };
  const status = (key: DocumentKey) => {
    const doc = docs.get(key);
    return doc ? statusOf(doc.draft, doc.published) : "new";
  };

  // Sections in the order of the layout draft (fixed sections such as the hero stay first)
  const layoutValue = page.layout ? (docs.get(page.layout)?.draft ?? defaultDocument(page.layout)) : null;
  const layoutIds = page.sections.filter((s) => s.id).map((s) => s.id as string);
  const layout = layoutValue ? normalizeLayout<string>(layoutValue as PageLayout<string>, layoutIds) : null;
  const ordered = layout
    ? [
        ...page.sections.filter((s) => !s.id),
        ...layout.sections.flatMap((entry) => page.sections.filter((s) => s.id === entry.id)),
      ]
    : page.sections;
  const hidden = new Set(layout?.sections.filter((s) => s.hidden).map((s) => s.id) ?? []);

  const docLink = (key: DocumentKey, shared: boolean) => (
    <li key={key} className={styles.docRow}>
      <Link href={`/admin/edit/?doc=${key}`} className={styles.docLink}>
        <AdminIcon name="edit" size={16} />
        {tl(documents[key].label)}
      </Link>
      {shared && <Badge tone="neutral">{t("sharedTag")}</Badge>}
      <StatusBadge status={status(key)} labels={statusLabels} />
    </li>
  );

  return (
    <div className={styles.stack}>
      <PageHeader
        eyebrow={
          <Link href="/admin/pages/" className={styles.crumb}>
            {t("pagesTitle")}
          </Link>
        }
        title={tl(page.label)}
        description={t("pageLayoutHelp")}
        actions={
          <>
            <ButtonLink href={`/${locale}/${page.path}`} external icon="eye">
              {t("viewPage")}
            </ButtonLink>
            {page.layout && (
              <ButtonLink href={`/admin/edit/?doc=${page.layout}`} variant="primary" icon="list">
                {tl(documents[page.layout].label)}
              </ButtonLink>
            )}
          </>
        }
      />

      <Card title={t("pageSeo")}>
        <ul className={styles.docList}>{docLink(page.seo, false)}</ul>
      </Card>

      <Card title={t("pageSections")}>
        <ol className={styles.sections}>
          {ordered.map((section, index) => (
            <li key={section.id ?? `fixed-${index}`} className={styles.section} data-hidden={section.id && hidden.has(section.id) ? "" : undefined}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionIndex}>{index + 1}</span>
                <span className={styles.sectionTitle}>{tl(section.label)}</span>
                {!section.id && <Badge tone="neutral">{t("fixed")}</Badge>}
                {section.id && hidden.has(section.id) && (
                  <Badge tone="warning" icon="eyeOff">
                    {t("hidden")}
                  </Badge>
                )}
              </div>
              <ul className={styles.docList}>
                {section.documents.map((key) => docLink(key, key.startsWith("shared.")))}
                {section.catalogs?.map((catalog) => (
                  <li key={catalog} className={styles.docRow}>
                    <Link href={catalogs[catalog].path} className={styles.docLink}>
                      <AdminIcon name="list" size={16} />
                      {t("catalogLink", { name: tl(catalogs[catalog].label) })}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
