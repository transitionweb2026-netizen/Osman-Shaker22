"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { documents, settingsGroups } from "@/lib/cms/registry";
import { statusOf, type DocumentRecord } from "@/lib/cms/store/types";
import { AdminIcon } from "../AdminIcon";
import { useAdmin, useStore } from "../AdminProvider";
import { Badge, Card, Notice, PageHeader, Skeleton, StatusBadge } from "../ui";
import styles from "./screens.module.css";

export function SettingsScreen() {
  const { t, tl, isAdmin } = useAdmin();
  const store = useStore();
  const [docs, setDocs] = useState<Map<string, DocumentRecord> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    store
      .listDocuments()
      .then((list) => setDocs(new Map(list.map((d) => [d.key, d]))))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t("errorLoad")));
  }, [store, t]);

  const statusLabels = { draft: t("statusDraft"), published: t("statusPublished"), changed: t("statusChanged"), new: t("statusNew") };

  return (
    <div className={styles.stack}>
      <PageHeader title={t("settingsTitle")} description={t("settingsIntro")} />
      {!isAdmin && <Notice tone="info" icon="lock">{t("readOnlyNotice")}</Notice>}
      {error && <Notice tone="danger">{error}</Notice>}
      {!docs && !error && <Skeleton lines={6} />}
      {docs &&
        settingsGroups.map((group) => (
          <Card key={group.label.en} title={tl(group.label)}>
            <ul className={styles.settingList}>
              {group.documents.map((key) => {
                const def = documents[key];
                const doc = docs.get(key);
                return (
                  <li key={key}>
                    <Link href={`/admin/edit/?doc=${key}`} className={styles.setting}>
                      <span className={styles.settingText}>
                        <span className={styles.settingTitle}>{tl(def.label)}</span>
                        {def.description && <span className={styles.muted}>{tl(def.description)}</span>}
                      </span>
                      <span className={styles.settingBadges}>
                        {def.adminOnly && !isAdmin && (
                          <Badge tone="neutral" icon="lock">
                            {t("roleAdmin")}
                          </Badge>
                        )}
                        <StatusBadge status={doc ? statusOf(doc.draft, doc.published) : "new"} labels={statusLabels} />
                        <AdminIcon name="chevron" size={16} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
    </div>
  );
}
