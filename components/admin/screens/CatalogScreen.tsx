"use client";

import { useSearchParams } from "next/navigation";
import type { CatalogKey } from "@/lib/cms/model";
import { catalogs } from "@/lib/cms/registry";
import { useAdmin } from "../AdminProvider";
import { CatalogItemEditor } from "../editors/CatalogItemEditor";
import { CatalogManager } from "../editors/CatalogManager";
import { Tabs } from "../ui";
import { catalogItemHref } from "./records";

/**
 * A catalog list and its entry editor on one static route:
 * `/admin/services/`, `/admin/services/?tab=groups`, `/admin/services/?id=…`.
 */
export function CatalogScreen({ primary, secondary }: { primary: CatalogKey; secondary?: { catalog: CatalogKey; tab: string } }) {
  const { tl, navigate, t } = useAdmin();
  const params = useSearchParams();
  const tab = params.get("tab");
  const id = params.get("id");
  const catalog = secondary && tab === secondary.tab ? secondary.catalog : primary;
  const listHref = catalogs[catalog].path;

  if (id) return <CatalogItemEditor key={id} catalog={catalog} id={id} listHref={listHref} />;

  const tabs = secondary ? (
    <Tabs<CatalogKey>
      label={t("navContent")}
      value={catalog}
      onChange={(next) => navigate(catalogs[next].path)}
      items={[
        { value: primary, label: tl(catalogs[primary].label) },
        { value: secondary.catalog, label: tl(catalogs[secondary.catalog].label) },
      ]}
    />
  ) : undefined;

  return <CatalogManager key={catalog} catalog={catalog} itemHref={(itemId) => catalogItemHref(catalog, itemId)} tabs={tabs} />;
}
