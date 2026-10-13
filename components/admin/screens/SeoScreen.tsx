"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { pages } from "@/lib/cms/registry";
import type { Label } from "@/lib/cms/schema";
import { statusOf, type DocumentRecord } from "@/lib/cms/store/types";
import { allowIndexing, siteUrl } from "@/lib/site-url";
import { useAdmin, useStore } from "../AdminProvider";
import { Badge, Card, Notice, PageHeader, Skeleton, StatusBadge } from "../ui";
import { defaultDocument } from "../editors/catalog-data";
import styles from "./screens.module.css";

/** Recommended lengths for search results. */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

export function SeoScreen() {
  const { t, tl } = useAdmin();
  const store = useStore();
  const [docs, setDocs] = useState<Map<string, DocumentRecord> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    store
      .listDocuments()
      .then((list) => setDocs(new Map(list.map((d) => [d.key, d]))))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t("errorLoad")));
  }, [store, t]);

  const domainSet = !siteUrl.includes("example.com");
  const statusLabels = { draft: t("statusDraft"), published: t("statusPublished"), changed: t("statusChanged"), new: t("statusNew") };

  return (
    <div className={styles.stack}>
      <PageHeader title={t("seoTitle")} description={t("seoIntro")} />

      <div className={styles.columns}>
        <Card title={t("seoIndexing")}>
          <Notice tone={allowIndexing ? "success" : "warning"}>{allowIndexing ? t("seoIndexingOn") : t("seoIndexingOff")}</Notice>
        </Card>
        <Card title={t("seoDomain")}>
          {domainSet ? (
            <p dir="ltr" className={styles.mono}>
              {siteUrl}
            </p>
          ) : (
            <Notice tone="warning">{t("seoDomainMissing")}</Notice>
          )}
        </Card>
      </div>

      {error && <Notice tone="danger">{error}</Notice>}
      {!docs && !error && <Skeleton lines={8} />}
      {docs && (
        <ul className={styles.seoList}>
          {pages.map((page) => {
            const doc = docs.get(page.seo);
            const value = (doc?.draft ?? defaultDocument(page.seo)) as { title?: Label; description?: Label; noindex?: boolean; shareImage?: unknown };
            return (
              <li key={page.key}>
                <Card
                  title={tl(page.label)}
                  actions={
                    <>
                      <StatusBadge status={doc ? statusOf(doc.draft, doc.published) : "new"} labels={statusLabels} />
                      <Link href={`/admin/edit/?doc=${page.seo}`} className={styles.inlineLink}>
                        {t("edit")}
                      </Link>
                    </>
                  }
                >
                  <div className={styles.seoGrid}>
                    {(["en", "ar"] as const).map((lang) => {
                      const title = value.title?.[lang] ?? "";
                      const description = value.description?.[lang] ?? "";
                      return (
                        <div key={lang} className={styles.serp} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
                          <span className={styles.serpUrl} dir="ltr">
                            {siteUrl.replace(/^https?:\/\//, "")}/{lang}/{page.path}
                          </span>
                          <span className={styles.serpTitle}>{title || "—"}</span>
                          <span className={styles.serpDescription}>{description || "—"}</span>
                          <span className={styles.serpCounts}>
                            <span className={title.length > TITLE_MAX ? styles.over : undefined}>
                              {t("seoTitleLength", { count: title.length })}
                            </span>
                            <span className={description.length > DESCRIPTION_MAX ? styles.over : undefined}>
                              {t("seoDescriptionLength", { count: description.length })}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.badgeRow}>
                    {value.noindex && (
                      <Badge tone="warning" icon="eyeOff">
                        {t("seoHidden")}
                      </Badge>
                    )}
                    {Boolean(value.shareImage) && (
                      <Badge tone="info" icon="image">
                        {t("seoCustomImage")}
                      </Badge>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
