"use client";

import { useEffect, useRef, useState } from "react";
import type { CatalogEntry, CatalogKey } from "@/lib/cms/model";
import { PREVIEW_PATH, PREVIEW_READY, PREVIEW_UPDATE, type PreviewMessage, type PreviewTarget } from "@/lib/cms/preview";
import type { Json } from "@/lib/cms/schema";
import type { CmsStore } from "@/lib/cms/store/types";
import type { Locale } from "@/lib/i18n";
import { useAdmin, useStore } from "../AdminProvider";
import { Tabs } from "../ui";
import styles from "./preview.module.css";

type Device = "desktop" | "phone";
/** Rendered at a real screen size, then scaled to fit the pane. */
const SCREEN: Record<Device, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  phone: { width: 390, height: 844 },
};

/** Uploaded files are private until published: show them through short-lived signed URLs. */
async function withSignedMedia<T>(value: T, store: CmsStore, cache: Map<string, string>): Promise<T> {
  const ids = new Set<string>();
  const collect = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(collect);
    if (!node || typeof node !== "object") return;
    const object = node as Json;
    if (typeof object.assetId === "string" && typeof object.src === "string" && object.src.startsWith("/media/cms-")) {
      if (!cache.has(object.assetId)) ids.add(object.assetId);
    }
    Object.values(object).forEach(collect);
  };
  collect(value);
  if (ids.size) {
    const records = (await Promise.all([...ids].map((id) => store.getMedia(id)))).filter((r) => r !== null);
    const urls = await store.mediaUrls(records);
    for (const [id, entry] of Object.entries(urls)) cache.set(id, entry.url);
  }
  const replace = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(replace);
    if (!node || typeof node !== "object") return node;
    const object = Object.fromEntries(Object.entries(node as Json).map(([k, v]) => [k, replace(v)])) as Json;
    if (typeof object.assetId === "string" && cache.has(object.assetId)) object.src = cache.get(object.assetId);
    return object;
  };
  return replace(value) as T;
}

export function PreviewPane({
  target,
  value,
  catalogs,
}: {
  target: PreviewTarget;
  value: Json | null;
  catalogs: Partial<Record<CatalogKey, CatalogEntry[]>>;
}) {
  const { t, locale: adminLocale } = useAdmin();
  const store = useStore();
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const urlCache = useRef(new Map<string, string>());
  const [ready, setReady] = useState(false);
  const [locale, setLocale] = useState<Locale>(adminLocale);
  const [device, setDevice] = useState<Device>("desktop");
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === PREVIEW_READY) {
        setReady(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Send the draft (debounced while typing)
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const [signedValue, signedCatalogs] = await Promise.all([
        withSignedMedia(value, store, urlCache.current),
        withSignedMedia(catalogs, store, urlCache.current),
      ]).catch(() => [value, catalogs] as const);
      if (cancelled) return;
      const message: PreviewMessage = { type: PREVIEW_UPDATE, target, locale, value: signedValue, catalogs: signedCatalogs };
      frame.current?.contentWindow?.postMessage(message, window.location.origin);
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [ready, value, catalogs, target, locale, store]);

  const { width, height } = SCREEN[device];
  const scale = boxWidth ? Math.min(1, boxWidth / width) : 1;

  return (
    <section className={styles.pane} aria-label={t("previewTitle")}>
      <div className={styles.toolbar}>
        <Tabs<Locale>
          label={t("previewLanguage")}
          value={locale}
          onChange={setLocale}
          items={[
            { value: "en", label: "EN" },
            { value: "ar", label: "ع" },
          ]}
        />
        <Tabs<Device>
          label={t("previewTitle")}
          value={device}
          onChange={setDevice}
          items={[
            { value: "desktop", label: t("previewDesktop") },
            { value: "phone", label: t("previewPhone") },
          ]}
        />
      </div>
      <p className={styles.note}>{t("previewNote")}</p>
      <div ref={box} className={styles.viewport} style={{ blockSize: Math.round(height * scale) }}>
        <iframe
          ref={frame}
          src={PREVIEW_PATH}
          title={t("previewTitle")}
          className={styles.frame}
          style={{
            inlineSize: width,
            blockSize: height,
            scale: String(scale),
            insetInlineStart: Math.max(0, (boxWidth - width * scale) / 2),
          }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </section>
  );
}
