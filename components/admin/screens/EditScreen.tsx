"use client";

import { useSearchParams } from "next/navigation";
import { isDocumentKey } from "@/lib/cms/model";
import { useAdmin } from "../AdminProvider";
import { DocumentEditor } from "../editors/DocumentEditor";
import { ButtonLink, EmptyState } from "../ui";

/** `/admin/edit/?doc=<key>` */
export function EditScreen() {
  const { t } = useAdmin();
  const key = useSearchParams().get("doc") ?? "";
  if (!isDocumentKey(key)) {
    return (
      <EmptyState
        icon="warning"
        title={t("notFound")}
        action={
          <ButtonLink href="/admin/pages/" icon="pages">
            {t("backTo", { name: t("navPages") })}
          </ButtonLink>
        }
      />
    );
  }
  // Keyed so switching documents starts a fresh editor
  return <DocumentEditor key={key} docKey={key} />;
}
