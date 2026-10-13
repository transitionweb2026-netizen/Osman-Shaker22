"use client";

import { useEffect, useState } from "react";
import { formatDateTime, relativeTime } from "@/lib/cms/admin-i18n";
import type { Json } from "@/lib/cms/schema";
import type { Revision } from "@/lib/cms/store/types";
import { statusOf } from "@/lib/cms/store/types";
import { useAdmin, useStore } from "../AdminProvider";
import { Badge, Button, Dialog, EmptyState, Notice, Skeleton } from "../ui";
import styles from "./editor.module.css";

/** Earlier versions of a record (written by a database trigger on every change). */
export function RevisionsDialog({
  recordId,
  onClose,
  onRestore,
  readOnly,
}: {
  recordId: string;
  onClose: () => void;
  onRestore: (draft: Json) => void;
  readOnly: boolean;
}) {
  const { t, locale } = useAdmin();
  const store = useStore();
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    store
      .revisions(recordId)
      .then(setRevisions)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : t("errorLoad")));
  }, [recordId, store, t]);

  const statusLabels = { draft: t("statusDraft"), published: t("statusPublished"), changed: t("statusChanged") };

  return (
    <Dialog open onClose={onClose} title={t("historyTitle")} description={t("historyIntro")} size="lg" closeLabel={t("close")}>
      {error && <Notice tone="danger">{error}</Notice>}
      {!revisions && !error && <Skeleton lines={4} />}
      {revisions && revisions.length === 0 && <EmptyState icon="history" title={t("historyEmpty")} />}
      {revisions && revisions.length > 0 && (
        <ol className={styles.revisions}>
          {revisions.map((revision) => {
            const draft = revision.draft;
            return (
              <li key={revision.id} className={styles.revision}>
                <div className={styles.revisionHead}>
                  <div>
                    <p className={styles.revisionTime}>
                      {revision.action === "delete"
                        ? t("historyDeleted", { time: formatDateTime(locale, revision.createdAt) })
                        : t("historyDraftOf", { time: formatDateTime(locale, revision.createdAt) })}
                    </p>
                    <p className={styles.revisionAgo}>{relativeTime(locale, revision.createdAt)}</p>
                  </div>
                  {draft && <Badge tone="neutral">{statusLabels[statusOf(draft, revision.published)]}</Badge>}
                  <div className={styles.revisionActions}>
                    {draft && (
                      <Button size="sm" variant="ghost" onClick={() => setOpen(open === revision.id ? null : revision.id)} aria-expanded={open === revision.id}>
                        {open === revision.id ? t("hide") : t("show")}
                      </Button>
                    )}
                    {draft && !readOnly && (
                      <Button size="sm" icon="refresh" onClick={() => onRestore(draft)}>
                        {t("historyRestore")}
                      </Button>
                    )}
                  </div>
                </div>
                {open === revision.id && draft && <pre className={styles.revisionBody}>{JSON.stringify(draft, null, 2)}</pre>}
              </li>
            );
          })}
        </ol>
      )}
    </Dialog>
  );
}
