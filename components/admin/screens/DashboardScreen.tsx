"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { relativeTime } from "@/lib/cms/admin-i18n";
import { importPayload } from "@/lib/cms/bundled";
import { catalogKeys } from "@/lib/cms/registry";
import type { ContentStatusRow, ImportProgress } from "@/lib/cms/store/types";
import { AdminIcon, type AdminIconName } from "../AdminIcon";
import { useAdmin, useStore } from "../AdminProvider";
import { Button, ButtonLink, Card, Checkbox, Notice, PageHeader, Skeleton, StatusBadge } from "../ui";
import { useAsync } from "../useAsync";
import { buildIsCurrent, fetchBuildInfo, hasPlaceholder, recordHref, recordName, type BuildInfo } from "./records";
import styles from "./screens.module.css";

type Overview = {
  initialized: boolean;
  status: ContentStatusRow[];
  mediaCount: number;
  placeholders: number;
  version: string | null;
  build: BuildInfo | null;
};

export function DashboardScreen() {
  const { t, tl, locale, mode, member, isAdmin } = useAdmin();
  const store = useStore();
  const load = useCallback(async (): Promise<Overview> => {
    const initialized = await store.isInitialized();
    if (!initialized) return { initialized, status: [], mediaCount: 0, placeholders: 0, version: null, build: null };
    const [status, media, docs, lists, version, build] = await Promise.all([
      store.contentStatus(),
      store.listMedia({ page: 1, pageSize: 1 }),
      store.listDocuments(),
      Promise.all(catalogKeys.map((key) => store.listAll(key))),
      store.contentVersion(),
      fetchBuildInfo(),
    ]);
    const placeholders = [...docs, ...lists.flat()].filter((record) => hasPlaceholder(record.draft)).length;
    return { initialized, status, mediaCount: media.total, placeholders, version, build };
  }, [store]);

  const { data, error, reload } = useAsync(load);

  if (error && !data) {
    return (
      <>
        <PageHeader title={t("dashTitle")} />
        <Notice tone="danger">
          {error}{" "}
          <Button size="sm" variant="ghost" onClick={reload}>
            {t("retry")}
          </Button>
        </Notice>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeader title={t("dashTitle")} />
        <Skeleton lines={6} />
      </>
    );
  }

  if (!data.initialized) return <SetupCard onDone={reload} />;

  const documents = data.status.filter((row) => row.table === "cms_documents");
  const entries = data.status.filter((row) => row.table !== "cms_documents");
  const pending = data.status.filter((row) => row.status !== "published");
  const statusLabels = { draft: t("statusDraft"), published: t("statusPublished"), changed: t("statusChanged"), new: t("statusNew") };
  const live = buildIsCurrent(data.build, data.version);

  const stats: { label: string; value: number; detail: string; icon: AdminIconName; href: string }[] = [
    {
      label: t("dashSections"),
      value: documents.length,
      detail: t("dashPublishedCount", { count: documents.filter((d) => d.status !== "draft").length }),
      icon: "pages",
      href: "/admin/pages/",
    },
    {
      label: t("dashCatalogEntries"),
      value: entries.length,
      detail: t("dashDraftCount", { count: entries.filter((e) => e.status === "draft").length }),
      icon: "list",
      href: "/admin/services/",
    },
    { label: t("dashMedia"), value: data.mediaCount, detail: t("navMedia"), icon: "image", href: "/admin/media/" },
    { label: t("dashPending"), value: pending.length, detail: t("navPublishing"), icon: "publish", href: "/admin/publishing/" },
  ];

  const checks: { ok: boolean | null; label: string }[] = [
    { ok: mode === "supabase", label: mode === "supabase" ? t("checkSupabase") : t("checkSupabaseMissing") },
    { ok: true, label: t("checkImported") },
    {
      ok: data.placeholders === 0,
      label: data.placeholders === 0 ? t("checkPlaceholders") : t("checkPlaceholdersCount", { count: data.placeholders }),
    },
    { ok: pending.length === 0, label: pending.length === 0 ? t("checkPending") : t("checkPendingCount", { count: pending.length }) },
    // The local demo never reaches the website, so there is no build to compare with
    ...(mode === "supabase"
      ? [{ ok: live, label: live === null ? t("checkLiveUnknown") : live ? t("checkLive") : t("checkLiveBehind") }]
      : []),
  ];

  return (
    <div className={styles.stack}>
      <PageHeader eyebrow={t("dashWelcome")} title={t("dashTitle")} description={mode === "supabase" ? member?.email : undefined} />

      <ul className={styles.stats}>
        {stats.map((stat) => (
          <li key={stat.label}>
            <Link href={stat.href} className={styles.stat}>
              <span className={styles.statIcon}>
                <AdminIcon name={stat.icon} size={20} />
              </span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statDetail}>{stat.detail}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.columns}>
        <Card title={t("dashChecklist")}>
          <ul className={styles.checklist}>
            {checks.map((check) => (
              <li key={check.label} className={check.ok ? styles.checkOk : check.ok === null ? styles.checkUnknown : styles.checkTodo}>
                <AdminIcon name={check.ok ? "check" : check.ok === null ? "info" : "warning"} size={18} />
                <span>{check.label}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t("dashQuick")}>
          <div className={styles.quick}>
            <ButtonLink href="/admin/pages/?page=home" icon="home">
              {t("dashEditHome")}
            </ButtonLink>
            <ButtonLink href="/admin/media/" icon="upload">
              {t("dashUpload")}
            </ButtonLink>
            <ButtonLink href="/admin/articles/" icon="article">
              {t("dashNewArticle")}
            </ButtonLink>
            <ButtonLink href="/admin/services/" icon="services">
              {t("dashServices")}
            </ButtonLink>
            <ButtonLink href="/admin/edit/?doc=settings.contact" icon="settings">
              {t("dashContact")}
            </ButtonLink>
          </div>
          {!isAdmin && <p className={styles.muted}>{t("adminOnly")}</p>}
        </Card>
      </div>

      <Card title={t("dashRecent")}>
        {data.status.length === 0 ? (
          <p className={styles.muted}>{t("dashNoRecent")}</p>
        ) : (
          <ul className={styles.recent}>
            {data.status.slice(0, 8).map((row) => (
              <li key={`${row.table}-${row.recordId}`}>
                <Link href={recordHref(row.table, row.recordId, row.label)} className={styles.recentLink}>
                  {recordName(row.table, row.label, tl)}
                </Link>
                <StatusBadge status={row.status} labels={statusLabels} />
                <span className={styles.muted}>{relativeTime(locale, row.updatedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/** First run against an empty database: copy the website's current content into it. */
function SetupCard({ onDone }: { onDone: () => void }) {
  const { t, isAdmin, toast } = useAdmin();
  const store = useStore();
  const [publish, setPublish] = useState(true);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    try {
      await store.importContent(importPayload(), { publish }, setProgress);
      toast(t("importDone"));
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorGeneric"));
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className={styles.stack}>
      <PageHeader title={t("setupTitle")} description={t("setupIntro")} />
      <Card>
        {isAdmin ? (
          <div className={styles.setup}>
            <Checkbox checked={publish} onChange={setPublish} label={t("importPublish")} disabled={Boolean(progress)} />
            {progress && (
              <div className={styles.progress}>
                <progress max={progress.total} value={progress.done} aria-label={t("importStart")} />
                <span>{t("importing", { label: progress.label })}</span>
              </div>
            )}
            {error && <Notice tone="danger">{error}</Notice>}
            <div>
              <Button variant="primary" icon="upload" onClick={run} busy={Boolean(progress)}>
                {t("importStart")}
              </Button>
            </div>
          </div>
        ) : (
          <Notice tone="info">{t("importAdminOnly")}</Notice>
        )}
      </Card>
    </div>
  );
}
