"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { relativeTime } from "@/lib/cms/admin-i18n";
import type { CatalogKey } from "@/lib/cms/model";
import { catalogs as catalogDefs } from "@/lib/cms/registry";
import { displayText } from "@/lib/cms/schema";
import { catalogSearchText, matchesSearch } from "@/lib/cms/store/search";
import { statusOf, type CatalogRecord } from "@/lib/cms/store/types";
import { HOME_REVIEW_COUNT, HOME_VIDEO_COUNT } from "@/lib/resolve";
import { AdminIcon } from "../AdminIcon";
import { useAdmin, useStore } from "../AdminProvider";
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  FieldWrap,
  IconButton,
  Notice,
  PageHeader,
  Pagination,
  SearchInput,
  Select,
  Skeleton,
  StatusBadge,
  TextInput,
} from "../ui";
import { useAsync } from "../useAsync";
import { findReferences, SLUG_PATTERN } from "./catalog-data";
import styles from "./catalog.module.css";

const PAGE_SIZE = 25;

/** How many of the first entries the homepage features. */
const homepageCount: Partial<Record<CatalogKey, number>> = { videos: HOME_VIDEO_COUNT, reviews: HOME_REVIEW_COUNT };

export function CatalogManager({
  catalog,
  itemHref,
  tabs,
}: {
  catalog: CatalogKey;
  /** Link to an entry's editor. */
  itemHref: (id: string) => string;
  /** Switch between related catalogs (services ↔ groups). */
  tabs?: React.ReactNode;
}) {
  const { t, tl, locale, isAdmin, toast, confirm, navigate } = useAdmin();
  const store = useStore();
  const def = catalogDefs[catalog];
  const parentDef = def.parent ? catalogDefs[def.parent] : null;
  const [search, setSearchValue] = useState("");
  const [parentFilter, setParentFilterValue] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const setSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };
  const setParentFilter = (value: string) => {
    setParentFilterValue(value);
    setPage(1);
  };

  const load = useCallback(async () => {
    const parentKey = catalogDefs[catalog].parent;
    const childKeys = (Object.keys(catalogDefs) as CatalogKey[]).filter((key) => catalogDefs[key].parent === catalog);
    const [items, parents, childLists] = await Promise.all([
      store.listAll(catalog),
      parentKey ? store.listAll(parentKey) : Promise.resolve([]),
      Promise.all(childKeys.map((key) => store.listAll(key))),
    ]);
    return { items, parents, children: childLists.flat() };
  }, [store, catalog]);

  const { data, error, reload, mutate } = useAsync(load);
  const items = data?.items ?? null;
  const parents = data?.parents ?? [];
  const children = data?.children ?? [];

  const title = (record: CatalogRecord) => displayText(def.itemTitle(record.draft), locale) || record.slug;
  const parentName = (id: string | null) => {
    const parent = parents.find((p) => p.id === id);
    return parent && parentDef ? displayText(parentDef.itemTitle(parent.draft), locale) || parent.slug : "—";
  };

  const filtered = useMemo(
    () =>
      (items ?? []).filter(
        (item) =>
          (!parentFilter || item.parentId === parentFilter) && (!search.trim() || matchesSearch(catalogSearchText(catalog, item), search)),
      ),
    [items, parentFilter, search, catalog],
  );
  const published = useMemo(() => (items ?? []).filter((item) => item.published), [items]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const canReorder = !search.trim();

  /** Swaps an entry with its neighbour among the visible (same parent) entries, then saves the full order. */
  const move = async (record: CatalogRecord, direction: -1 | 1) => {
    if (!items || !data) return;
    const index = filtered.indexOf(record);
    const neighbour = filtered[index + direction];
    if (!neighbour) return;
    const order = [...items];
    const a = order.indexOf(record);
    const b = order.indexOf(neighbour);
    [order[a], order[b]] = [order[b], order[a]];
    mutate({ ...data, items: order });
    setSavingOrder(true);
    try {
      await store.reorder(
        catalog,
        order.map((item) => item.id),
      );
      toast(t("orderSaved"));
    } catch (e) {
      toast(e instanceof Error ? e.message : t("errorGeneric"), "danger");
      reload();
    } finally {
      setSavingOrder(false);
    }
  };

  const remove = async (record: CatalogRecord) => {
    const childCount = children.filter((child) => child.parentId === record.id).length;
    if (childCount) {
      toast(t("deleteHasChildren", { count: childCount }), "danger");
      return;
    }
    const references = findReferences(await store.listDocuments(), catalog, record.slug);
    const detail = [
      record.published ? t("deletePublishedWarning") : "",
      references.length ? t("referencedBy", { list: references.map(tl).join(locale === "ar" ? "، " : ", ") }) : "",
    ]
      .filter(Boolean)
      .join(" ");
    if (!(await confirm({ message: t("deleteConfirm", { name: title(record) }), detail: detail || undefined, confirmLabel: t("delete"), danger: true }))) {
      return;
    }
    try {
      await store.deleteCatalogItem(catalog, record.id);
      toast(t("deleted"));
      reload();
    } catch (e) {
      toast(e instanceof Error ? e.message : t("errorGeneric"), "danger");
    }
  };

  const statusLabels = { draft: t("statusDraft"), published: t("statusPublished"), changed: t("statusChanged"), new: t("statusNew") };
  const featured = homepageCount[catalog];

  return (
    <div className={styles.manager}>
      <PageHeader
        title={tl(def.label)}
        description={def.description ? tl(def.description) : undefined}
        actions={
          <Button variant="primary" icon="plus" onClick={() => setCreating(true)} disabled={Boolean(parentDef && !parents.length)}>
            {t("newItem", { name: tl(def.singular) })}
          </Button>
        }
      />
      {tabs}
      {catalog === "reviews" && <Notice tone="warning">{t("reviewPolicy")}</Notice>}
      {def.orderHelp && (
        <p className={styles.orderHelp}>
          <AdminIcon name="info" size={16} />
          {tl(def.orderHelp)}
        </p>
      )}

      <div className={styles.filters}>
        <SearchInput value={search} onChange={setSearch} placeholder={t("searchPlaceholder")} label={t("search")} />
        {parentDef && (
          <Select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} aria-label={t("parent")}>
            <option value="">{`${t("all")} — ${tl(parentDef.label)}`}</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parentName(parent.id)}
              </option>
            ))}
          </Select>
        )}
        <span className={styles.count}>{t("results", { count: filtered.length })}</span>
      </div>

      {error && (
        <EmptyState icon="warning" title={t("errorLoad")} action={<Button onClick={reload}>{t("retry")}</Button>}>
          {error}
        </EmptyState>
      )}
      {!items && !error && <Skeleton lines={6} />}
      {items && filtered.length === 0 && <EmptyState icon="list" title={search ? t("noResults") : t("emptyCatalog")} />}

      {visible.length > 0 && (
        <ol className={styles.list} aria-busy={savingOrder || undefined}>
          {visible.map((record) => {
            const indexInFiltered = filtered.indexOf(record);
            const status = statusOf(record.draft, record.published);
            const isPlaceholder = record.draft.isPlaceholder === true;
            // The homepage shows the first published entries
            const homeRank = published.indexOf(record);
            return (
              <li key={record.id} className={styles.row}>
                <span className={styles.position} aria-label={`${t("order")} ${indexInFiltered + 1}`}>
                  {indexInFiltered + 1}
                </span>
                <div className={styles.main}>
                  <Link href={itemHref(record.id)} className={styles.title}>
                    {title(record)}
                  </Link>
                  <div className={styles.meta}>
                    <code dir="ltr">{record.slug}</code>
                    {parentDef && <span>{parentName(record.parentId)}</span>}
                    <span>{t("lastSaved", { time: relativeTime(locale, record.updatedAt) })}</span>
                  </div>
                </div>
                <div className={styles.badges}>
                  <StatusBadge status={status} labels={statusLabels} />
                  {isPlaceholder && <Badge tone="warning">{t("placeholderBadge")}</Badge>}
                  {featured !== undefined && homeRank >= 0 && homeRank < featured && (
                    <Badge tone="accent" icon="home">
                      {t("onHomepage")}
                    </Badge>
                  )}
                </div>
                <div className={styles.controls}>
                  {canReorder && (
                    <>
                      <IconButton label={t("moveUp")} icon="up" onClick={() => move(record, -1)} disabled={indexInFiltered === 0 || savingOrder} />
                      <IconButton
                        label={t("moveDown")}
                        icon="down"
                        onClick={() => move(record, 1)}
                        disabled={indexInFiltered === filtered.length - 1 || savingOrder}
                      />
                    </>
                  )}
                  <IconButton label={t("edit")} icon="edit" onClick={() => navigate(itemHref(record.id))} />
                  {isAdmin && <IconButton label={t("delete")} icon="trash" onClick={() => remove(record)} />}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <Pagination
        page={page}
        pages={pages}
        onPage={setPage}
        labels={{ previous: t("previous"), next: t("next"), pageOf: t("pageOf", { page, pages }) }}
      />

      {creating && (
        <CreateDialog
          catalog={catalog}
          existing={items ?? []}
          parents={parents}
          parentName={parentName}
          defaultParent={parentFilter || parents[0]?.id || ""}
          onClose={() => setCreating(false)}
          onCreated={(record) => {
            setCreating(false);
            navigate(itemHref(record.id));
          }}
        />
      )}
    </div>
  );
}

function CreateDialog({
  catalog,
  existing,
  parents,
  parentName,
  defaultParent,
  onClose,
  onCreated,
}: {
  catalog: CatalogKey;
  existing: CatalogRecord[];
  parents: CatalogRecord[];
  parentName: (id: string | null) => string;
  defaultParent: string;
  onClose: () => void;
  onCreated: (record: CatalogRecord) => void;
}) {
  const { t, tl, toast } = useAdmin();
  const store = useStore();
  const def = catalogDefs[catalog];
  const base = def.singular.en.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const suggestion = (() => {
    for (let n = existing.length + 1; ; n++) if (!existing.some((e) => e.slug === `${base}-${n}`)) return `${base}-${n}`;
  })();
  const [slug, setSlug] = useState(suggestion);
  const [parentId, setParentId] = useState(defaultParent);
  const [busy, setBusy] = useState(false);
  const taken = existing.some((e) => e.slug === slug);
  const invalid = !SLUG_PATTERN.test(slug);
  const error = invalid ? t("slugInvalid") : taken ? t("slugTaken") : null;

  const create = async () => {
    if (error || (def.parent && !parentId)) return;
    setBusy(true);
    try {
      onCreated(await store.createCatalogItem(catalog, { slug, parentId: def.parent ? parentId : null, draft: def.newItem() }));
    } catch (e) {
      toast(e instanceof Error ? e.message : t("errorGeneric"), "danger");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={t("newItem", { name: tl(def.singular) })}
      size="sm"
      closeLabel={t("close")}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" icon="plus" onClick={create} busy={busy} disabled={Boolean(error) || Boolean(def.parent && !parentId)}>
            {t("create")}
          </Button>
        </>
      }
    >
      <form
        className={styles.createForm}
        onSubmit={(event) => {
          event.preventDefault();
          create();
        }}
      >
        <FieldWrap label={t("slug")} htmlFor="cms-new-slug" help={t("slugHelp")} error={slug ? error : null} required>
          <TextInput
            id="cms-new-slug"
            dir="ltr"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
            invalid={Boolean(error)}
            autoComplete="off"
            spellCheck={false}
            maxLength={80}
          />
        </FieldWrap>
        {def.parent && (
          <FieldWrap label={t("parent")} htmlFor="cms-new-parent" required>
            <Select id="cms-new-parent" value={parentId} onChange={(e) => setParentId(e.target.value)}>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parentName(parent.id)}
                </option>
              ))}
            </Select>
          </FieldWrap>
        )}
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}
