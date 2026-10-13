"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { formatDateTime, relativeTime } from "@/lib/cms/admin-i18n";
import { isDocumentKey, type CatalogKey } from "@/lib/cms/model";
import { catalogKeys, catalogs, documents, tableToCatalog } from "@/lib/cms/registry";
import { blocksPublish, validate, type Issue } from "@/lib/cms/schema";
import type { CatalogRecord, ContentStatusRow } from "@/lib/cms/store/types";
import { AdminIcon } from "../AdminIcon";
import { useAdmin, useStore } from "../AdminProvider";
import { Button, Card, Notice, PageHeader, Skeleton, StatusBadge } from "../ui";
import { useAsync } from "../useAsync";
import { catalogRules } from "../editors/catalog-data";
import { buildIsCurrent, fetchBuildInfo, recordHref, recordName, type BuildInfo } from "./records";
import styles from "./screens.module.css";

type State = { pending: ContentStatusRow[]; version: string | null; build: BuildInfo | null };

export function PublishingScreen() {
  const { t, tl, locale, toast, confirm } = useAdmin();
  const store = useStore();
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState<ContentStatusRow[]>([]);

  const fetchState = useCallback(async (): Promise<State> => {
    const [status, version, build] = await Promise.all([store.contentStatus(), store.contentVersion(), fetchBuildInfo()]);
    return { pending: status.filter((row) => row.status !== "published"), version, build };
  }, [store]);

  const { data: state, error, reload: load } = useAsync(fetchState);

  /** Publishes every listed record that passes the same checks as its editor. */
  const publishAll = async () => {
    if (!state?.pending.length) return;
    if (!(await confirm({ message: t("pubPublishAllConfirm", { count: state.pending.length }), confirmLabel: t("publish") }))) return;
    setBusy(true);
    const skipped: ContentStatusRow[] = [];
    let published = 0;
    try {
      const lists = await Promise.all(catalogKeys.map((key) => store.listAll(key)));
      const byCatalog = Object.fromEntries(catalogKeys.map((key, i) => [key, lists[i]])) as Record<CatalogKey, CatalogRecord[]>;
      const slugs = Object.fromEntries(catalogKeys.map((key) => [key, new Set(byCatalog[key].map((r) => r.slug))]));
      for (const row of state.pending) {
        let issues: Issue[];
        if (row.table === "cms_documents") {
          if (!isDocumentKey(row.label)) continue;
          const doc = await store.getDocument(row.label);
          if (!doc) continue;
          issues = validate(documents[row.label].fields, doc.draft, { catalogs: slugs });
        } else {
          const catalog = tableToCatalog[row.table];
          const record = byCatalog[catalog]?.find((r) => r.id === row.recordId);
          if (!catalog || !record) continue;
          issues = [
            ...validate(catalogs[catalog].fields, record.draft, { catalogs: slugs }),
            ...catalogRules(catalog, record.draft, { consentConfirmed: record.consentConfirmed }),
          ];
          if (catalogs[catalog].parent && !record.parentId) issues.push({ path: "parent", severity: "invalid", message: { en: "", ar: "" } });
        }
        if (blocksPublish(issues)) {
          skipped.push(row);
          continue;
        }
        try {
          await store.publish(row.table, row.recordId);
          published++;
        } catch {
          skipped.push(row);
        }
      }
      toast(`${t("published")} (${published})`, skipped.length ? "warning" : "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : t("errorGeneric"), "danger");
    } finally {
      setBlocked(skipped);
      setBusy(false);
      load();
    }
  };

  if (error && !state) return <Notice tone="danger">{error}</Notice>;
  if (!state) return <Skeleton lines={8} />;

  const current = buildIsCurrent(state.build, state.version);
  const statusLabels = { draft: t("statusDraft"), published: t("statusPublished"), changed: t("statusChanged"), new: t("statusNew") };

  return (
    <div className={styles.stack}>
      <PageHeader title={t("pubTitle")} description={t("pubIntro")} />

      <div className={styles.columns}>
        <Card
          title={t("pubLive")}
          actions={
            <Button size="sm" variant="ghost" icon="refresh" onClick={load}>
              {t("retry")}
            </Button>
          }
        >
          {state.build ? (
            <dl className={styles.facts}>
              <div>
                <dt>{t("pubBuiltAt")}</dt>
                <dd>{formatDateTime(locale, state.build.builtAt)}</dd>
              </div>
              <div>
                <dt>{t("pubDatabase")}</dt>
                <dd>
                  {state.build.cmsContent && state.build.contentVersion
                    ? t("pubLiveVersion", { time: formatDateTime(locale, state.build.contentVersion) })
                    : t("pubLiveNoCms")}
                </dd>
              </div>
            </dl>
          ) : (
            <Notice tone="neutral">{t("pubLiveUnreachable")}</Notice>
          )}
        </Card>
        <Card title={t("pubDatabase")}>
          <p className={styles.muted}>{t("pubLastChange", { time: relativeTime(locale, state.version) })}</p>
          {current !== null && (
            <Notice tone={current ? "success" : "warning"}>{current ? t("pubUpToDate") : t("pubBehind")}</Notice>
          )}
        </Card>
      </div>

      <Card
        title={t("pubPending")}
        actions={
          state.pending.length > 0 && (
            <Button variant="primary" icon="publish" onClick={publishAll} busy={busy}>
              {t("pubPublishAll")}
            </Button>
          )
        }
      >
        {blocked.length > 0 && <Notice tone="warning">{t("pubSkipped", { count: blocked.length })}</Notice>}
        {state.pending.length === 0 ? (
          <p className={styles.muted}>{t("pubPendingEmpty")}</p>
        ) : (
          <ul className={styles.recent}>
            {state.pending.map((row) => (
              <li key={`${row.table}-${row.recordId}`}>
                <Link href={recordHref(row.table, row.recordId, row.label)} className={styles.recentLink}>
                  {recordName(row.table, row.label, tl)}
                </Link>
                <StatusBadge status={row.status} labels={statusLabels} />
                {blocked.some((b) => b.recordId === row.recordId) && <AdminIcon name="warning" size={16} />}
                <span className={styles.muted}>{relativeTime(locale, row.updatedAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title={t("pubSteps")}>
        <ol className={styles.steps}>
          <li>
            <p>{t("pubStep1")}</p>
            <pre className={styles.code} dir="ltr">
              npm run cms:sync{"\n"}npm run build
            </pre>
          </li>
          <li>
            <p>{t("pubStep2")}</p>
          </li>
          <li>
            <p>{t("pubStep3")}</p>
          </li>
        </ol>
        <Notice tone="info">{t("pubAutomation")}</Notice>
      </Card>
    </div>
  );
}
