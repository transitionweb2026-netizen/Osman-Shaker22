"use client";

import { useAdmin } from "../AdminProvider";
import { MediaLibrary } from "../media/MediaLibrary";
import { PageHeader } from "../ui";
import styles from "./screens.module.css";

export function MediaScreen() {
  const { t } = useAdmin();
  return (
    <div className={styles.stack}>
      <PageHeader title={t("mediaTitle")} description={t("mediaIntro")} />
      <MediaLibrary />
    </div>
  );
}
