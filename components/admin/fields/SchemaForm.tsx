"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { bundledUrls } from "@/lib/cms/bundled";
import { catalogs as catalogDefs } from "@/lib/cms/registry";
import {
  displayText,
  emptyValue,
  issuesAt,
  youtubeId,
  type Field,
  type Issue,
  type Json,
  type Label,
} from "@/lib/cms/schema";
import { statusOf } from "@/lib/cms/store/types";
import { cx } from "@/lib/cx";
import { normalizeLayout } from "@/lib/layout";
import type { RouteKey } from "@/lib/routes";
import { AdminIcon } from "../AdminIcon";
import { useAdmin } from "../AdminProvider";
import { Badge, Button, IconButton, Select, Switch, TextArea, TextInput } from "../ui";
import { routeLabels, useForm } from "./context";
import styles from "./fields.module.css";

type EditorProps<F extends Field = Field> = {
  field: F;
  value: unknown;
  onChange: (value: unknown) => void;
  path: string;
};

const join = (base: string, key: string | number) => (base ? `${base}.${key}` : String(key));
const isObject = (v: unknown): v is Json => Boolean(v) && typeof v === "object" && !Array.isArray(v);

/** Renders every field of an object; unknown properties of `value` are kept. */
export function SchemaForm({ fields, value, onChange, path = "" }: { fields: Field[]; value: Json; onChange: (value: Json) => void; path?: string }) {
  return (
    <div className={styles.form}>
      {fields.map((field) => (
        <FieldEditor
          key={field.key}
          field={field}
          value={value?.[field.key]}
          path={join(path, field.key)}
          onChange={(next) => onChange({ ...value, [field.key]: next })}
        />
      ))}
    </div>
  );
}

export function FieldEditor(props: EditorProps) {
  const { field } = props;
  switch (field.type) {
    case "text":
      return <TextEditor {...(props as EditorProps<typeof field>)} />;
    case "lines":
      return <LinesEditor {...(props as EditorProps<typeof field>)} />;
    case "number":
      return <NumberEditor {...(props as EditorProps<typeof field>)} />;
    case "boolean":
      return <BooleanEditor {...(props as EditorProps<typeof field>)} />;
    case "select":
      return <SelectEditor {...(props as EditorProps<typeof field>)} />;
    case "image":
      return <ImageEditor {...(props as EditorProps<typeof field>)} />;
    case "video":
      return <VideoEditor {...(props as EditorProps<typeof field>)} />;
    case "cta":
      return <CtaEditor {...(props as EditorProps<typeof field>)} />;
    case "route":
      return <RouteEditor {...(props as EditorProps<typeof field>)} />;
    case "phone":
      return <PhoneEditor {...(props as EditorProps<typeof field>)} />;
    case "rating":
      return <RatingEditor {...(props as EditorProps<typeof field>)} />;
    case "group":
      return <GroupEditor {...(props as EditorProps<typeof field>)} />;
    case "optional":
      return <OptionalEditor {...(props as EditorProps<typeof field>)} />;
    case "list":
      return <ListEditor {...(props as EditorProps<typeof field>)} />;
    case "blocks":
      return <BlocksEditor {...(props as EditorProps<typeof field>)} />;
    case "references":
      return <ReferencesEditor {...(props as EditorProps<typeof field>)} />;
    case "reference":
      return <ReferenceEditor {...(props as EditorProps<typeof field>)} />;
    case "layout":
      return <LayoutEditor {...(props as EditorProps<typeof field>)} />;
    case "placeholder":
      return <PlaceholderEditor {...(props as EditorProps<typeof field>)} />;
  }
}

// ---- shared pieces ------------------------------------------------------------------

function IssueList({ issues }: { issues: Issue[] }) {
  const { tl } = useAdmin();
  if (!issues.length) return null;
  return (
    <ul className={styles.issues}>
      {issues.map((issue, index) => (
        <li key={index} className={cx(styles.issue, styles[issue.severity])}>
          <AdminIcon name="warning" size={14} />
          {tl(issue.message)}
        </li>
      ))}
    </ul>
  );
}

function FieldShell({
  label,
  help,
  required,
  path,
  children,
  htmlFor,
  aside,
  ownIssuesOnly = true,
}: {
  label: Label;
  help?: Label;
  required?: boolean;
  path: string;
  children: ReactNode;
  htmlFor?: string;
  aside?: ReactNode;
  /** Show only issues for exactly this path (child editors show their own). */
  ownIssuesOnly?: boolean;
}) {
  const { tl, t } = useAdmin();
  const { issues } = useForm();
  const shown = ownIssuesOnly ? issues.filter((i) => i.path === path) : issuesAt(issues, path);
  return (
    <div className={styles.field}>
      <div className={styles.fieldTop}>
        {htmlFor ? (
          <label className={styles.label} htmlFor={htmlFor}>
            {tl(label)}
            {required && <span className={styles.required} title={t("required")}>*</span>}
          </label>
        ) : (
          <span className={styles.label}>
            {tl(label)}
            {required && <span className={styles.required} title={t("required")}>*</span>}
          </span>
        )}
        {aside}
      </div>
      {children}
      {help && <p className={styles.help}>{tl(help)}</p>}
      <IssueList issues={shown} />
    </div>
  );
}

// ---- text ---------------------------------------------------------------------------

function TextEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "text" }>>) {
  const { t } = useAdmin();
  const { view, readOnly, issues } = useForm();
  const id = useId();

  if (field.localized === false) {
    const v = typeof value === "string" ? value : "";
    return (
      <FieldShell label={field.label} help={field.help} required={field.required} path={path} htmlFor={id}>
        <TextInput
          id={id}
          value={v}
          dir="ltr"
          maxLength={field.max ? field.max + 50 : undefined}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          invalid={issues.some((i) => i.path === path && i.severity === "invalid")}
          inputMode={field.format === "url" ? "url" : undefined}
          placeholder={field.format === "url" ? "https://" : undefined}
        />
      </FieldShell>
    );
  }

  const v = (isObject(value) ? value : { en: "", ar: "" }) as Label;
  const languages = view === "both" ? (["en", "ar"] as const) : ([view] as const);
  return (
    <FieldShell label={field.label} help={field.help} required={field.required} path={path}>
      <div className={cx(styles.bilingual, view !== "both" && styles.single)}>
        {languages.map((lang) => {
          const langPath = `${path}.${lang}`;
          const langIssues = issues.filter((i) => i.path === langPath);
          const text = v[lang] ?? "";
          const Input = field.multiline ? TextArea : TextInput;
          return (
            <div key={lang} className={styles.langField}>
              <div className={styles.langHeader}>
                <label htmlFor={`${id}-${lang}`} className={styles.langTag}>
                  {lang === "en" ? t("english") : t("arabic")}
                </label>
                {field.max && (
                  <span className={cx(styles.counter, text.length > field.max && styles.over)}>
                    {text.length}/{field.max}
                  </span>
                )}
              </div>
              <Input
                id={`${id}-${lang}`}
                lang={lang}
                dir={lang === "ar" ? "rtl" : "ltr"}
                value={text}
                rows={field.multiline ? 3 : undefined}
                readOnly={readOnly}
                invalid={langIssues.some((i) => i.severity === "invalid")}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...v, [lang]: e.target.value })}
              />
              <IssueList issues={langIssues} />
            </div>
          );
        })}
      </div>
    </FieldShell>
  );
}

function LinesEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "lines" }>>) {
  const { t } = useAdmin();
  const { view, readOnly } = useForm();
  const v = (isObject(value) ? value : { en: [], ar: [] }) as { en: string[]; ar: string[] };
  const languages = view === "both" ? (["en", "ar"] as const) : ([view] as const);
  const update = (lang: "en" | "ar", lines: string[]) => onChange({ ...v, [lang]: lines });
  return (
    <FieldShell label={field.label} help={{ en: t("fieldLinesHelp"), ar: t("fieldLinesHelp") }} required={field.required} path={path}>
      <div className={cx(styles.bilingual, view !== "both" && styles.single)}>
        {languages.map((lang) => (
          <div key={lang} className={styles.langField}>
            <span className={styles.langTag}>{lang === "en" ? t("english") : t("arabic")}</span>
            {(v[lang] ?? []).map((line, index) => (
              <div key={index} className={styles.lineRow}>
                <TextArea
                  aria-label={`${lang === "en" ? t("english") : t("arabic")} ${index + 1}`}
                  lang={lang}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                  rows={3}
                  value={line}
                  readOnly={readOnly}
                  onChange={(e) => update(lang, v[lang].map((l, i) => (i === index ? e.target.value : l)))}
                />
                {!readOnly && (
                  <IconButton label={t("remove")} icon="trash" onClick={() => update(lang, v[lang].filter((_, i) => i !== index))} />
                )}
              </div>
            ))}
            {!readOnly && (
              <Button size="sm" variant="ghost" icon="plus" onClick={() => update(lang, [...(v[lang] ?? []), ""])}>
                {t("fieldAddParagraph")}
              </Button>
            )}
          </div>
        ))}
      </div>
    </FieldShell>
  );
}

function NumberEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "number" }>>) {
  const id = useId();
  const { readOnly } = useForm();
  return (
    <FieldShell label={field.label} help={field.help} required={field.required} path={path} htmlFor={id}>
      <TextInput
        id={id}
        type="number"
        inputMode="numeric"
        min={field.min}
        max={field.max}
        step={field.integer ? 1 : "any"}
        value={typeof value === "number" ? value : ""}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className={styles.narrow}
      />
    </FieldShell>
  );
}

function BooleanEditor({ field, value, onChange }: EditorProps<Extract<Field, { type: "boolean" }>>) {
  const { tl } = useAdmin();
  const { readOnly } = useForm();
  return <Switch checked={value === true} onChange={onChange} label={tl(field.label)} description={tl(field.help)} disabled={readOnly} />;
}

function PlaceholderEditor({ field, value, onChange }: EditorProps<Extract<Field, { type: "placeholder" }>>) {
  const { tl } = useAdmin();
  const { readOnly } = useForm();
  return (
    <div className={cx(styles.placeholderRow, value === true && styles.placeholderOn)}>
      <Switch checked={value === true} onChange={onChange} label={tl(field.label)} description={tl(field.help)} disabled={readOnly} />
    </div>
  );
}

function SelectEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "select" }>>) {
  const id = useId();
  const { tl } = useAdmin();
  const { readOnly } = useForm();
  return (
    <FieldShell label={field.label} help={field.help} path={path} htmlFor={id}>
      <Select id={id} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} disabled={readOnly}>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {tl(option.label)}
          </option>
        ))}
      </Select>
    </FieldShell>
  );
}

function RouteSelect({ id, value, onChange }: { id?: string; value: string; onChange: (route: RouteKey) => void }) {
  const { tl } = useAdmin();
  const { readOnly } = useForm();
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value as RouteKey)} disabled={readOnly}>
      {(Object.keys(routeLabels) as RouteKey[]).map((route) => (
        <option key={route} value={route}>
          {tl(routeLabels[route])}
        </option>
      ))}
    </Select>
  );
}

function RouteEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "route" }>>) {
  const id = useId();
  return (
    <FieldShell label={field.label} help={field.help} path={path} htmlFor={id}>
      <RouteSelect id={id} value={typeof value === "string" ? value : "home"} onChange={onChange} />
    </FieldShell>
  );
}

// ---- images and video -------------------------------------------------------------------

/** Preview URL for an image value: bundled photos directly, uploads via a signed URL. */
function usePreviewUrl(src: string | undefined, assetId: string | undefined): string | null {
  const { mediaUrl } = useForm();
  const [signed, setSigned] = useState<{ id: string; url: string | null } | null>(null);
  const bundled = src && src.startsWith("/media/") && !src.startsWith("/media/cms-") ? bundledUrls(src).url : null;
  const isAbsolute = Boolean(src && /^https?:\/\//.test(src));
  useEffect(() => {
    if (bundled || isAbsolute || !assetId) return;
    let alive = true;
    mediaUrl(assetId).then((url) => alive && setSigned({ id: assetId, url }));
    return () => {
      alive = false;
    };
  }, [assetId, bundled, isAbsolute, mediaUrl]);
  if (bundled) return bundled;
  if (isAbsolute) return src ?? null;
  return signed && signed.id === assetId ? signed.url : null;
}

/** "x% y%" from a click on the image. */
const positionFrom = (event: React.MouseEvent<HTMLElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 100);
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 100);
  return `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
};

const parsePosition = (position: unknown): [number, number] => {
  const match = typeof position === "string" ? position.match(/(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%/) : null;
  return match ? [Number(match[1]), Number(match[2])] : [50, 50];
};

function ImageEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "image" }>>) {
  const { t, tl } = useAdmin();
  const { pickMedia, readOnly, view, issues } = useForm();
  const id = useId();
  const v = isObject(value) && typeof value.src === "string" && value.src ? (value as Json & { src: string; alt?: Label }) : null;
  const url = usePreviewUrl(v?.src, v?.assetId as string | undefined);
  const [focusTarget, setFocusTarget] = useState<"position" | "positionMobile">("position");
  const [x, y] = parsePosition(v?.[focusTarget] ?? v?.position);

  const choose = async () => {
    const media = await pickMedia("image");
    if (!media) return;
    const next: Json = {
      ...(v ?? {}),
      src: media.bundledSrc ?? `/media/cms-${media.id}`,
      assetId: media.id,
      alt: v?.alt && (v.alt.en || v.alt.ar) ? v.alt : media.alt,
      // Bundled photos are temporary stock images; uploads are the real thing
      isPlaceholder: Boolean(media.bundledSrc),
    };
    delete next.credit;
    onChange(next);
  };

  const alt = (v?.alt ?? { en: "", ar: "" }) as Label;
  const languages = view === "both" ? (["en", "ar"] as const) : ([view] as const);

  return (
    <FieldShell label={field.label} help={field.help} required={field.required} path={path}>
      <div className={styles.image}>
        <div className={styles.imagePreview}>
          {v && url ? (
            <button
              type="button"
              className={styles.focusArea}
              onClick={(event) => !readOnly && onChange({ ...v, [focusTarget]: positionFrom(event) })}
              aria-label={t("fieldFocus")}
              disabled={readOnly}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS preview of a library file */}
              <img src={url} alt="" />
              {/* Physical left/top: object-position percentages are measured from the left edge */}
              <span className={styles.focusMarker} style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true" />
            </button>
          ) : (
            <div className={styles.imageEmpty}>
              <AdminIcon name="image" size={28} />
              <span>{v ? t("loading") : t("fieldImageEmpty")}</span>
            </div>
          )}
        </div>
        <div className={styles.imageSide}>
          {!readOnly && (
            <div className={styles.row}>
              <Button size="sm" icon="image" onClick={choose}>
                {v ? t("replace") : t("mediaPick")}
              </Button>
              {v && !field.required && (
                <Button size="sm" variant="ghost" icon="trash" onClick={() => onChange(null)}>
                  {t("remove")}
                </Button>
              )}
            </div>
          )}
          {v && (
            <>
              {v.isPlaceholder === true && <Badge tone="warning">{t("placeholderBadge")}</Badge>}
              <div className={styles.focusControls}>
                <p className={styles.help}>{t("fieldFocusHelp")}</p>
                <Switch
                  checked={focusTarget === "positionMobile" || Boolean(v.positionMobile)}
                  onChange={(on) => {
                    if (on) {
                      setFocusTarget("positionMobile");
                      if (!v.positionMobile) onChange({ ...v, positionMobile: v.position ?? "50% 50%" });
                    } else {
                      setFocusTarget("position");
                      const next = { ...v };
                      delete next.positionMobile;
                      onChange(next);
                    }
                  }}
                  label={t("fieldFocusMobile")}
                  disabled={readOnly}
                />
                <div className={styles.row}>
                  <label className={styles.inline}>
                    ↔
                    <TextInput
                      type="number"
                      min={0}
                      max={100}
                      value={x}
                      readOnly={readOnly}
                      className={styles.tiny}
                      onChange={(e) => onChange({ ...v, [focusTarget]: `${e.target.value}% ${y}%` })}
                      aria-label={`${t("fieldFocus")} (x %)`}
                    />
                  </label>
                  <label className={styles.inline}>
                    ↕
                    <TextInput
                      type="number"
                      min={0}
                      max={100}
                      value={y}
                      readOnly={readOnly}
                      className={styles.tiny}
                      onChange={(e) => onChange({ ...v, [focusTarget]: `${x}% ${e.target.value}%` })}
                      aria-label={`${t("fieldFocus")} (y %)`}
                    />
                  </label>
                </div>
              </div>
              <div className={styles.altFields}>
                <span className={styles.subLabel}>{t("fieldAlt")}</span>
                {languages.map((lang) => (
                  <div key={lang} className={styles.langField}>
                    <label htmlFor={`${id}-alt-${lang}`} className={styles.langTag}>
                      {lang === "en" ? t("english") : t("arabic")}
                    </label>
                    <TextInput
                      id={`${id}-alt-${lang}`}
                      lang={lang}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      value={alt[lang] ?? ""}
                      readOnly={readOnly}
                      onChange={(e) => onChange({ ...v, alt: { ...alt, [lang]: e.target.value } })}
                    />
                  </div>
                ))}
                <IssueList issues={issues.filter((i) => i.path === `${path}.alt`)} />
              </div>
            </>
          )}
        </div>
      </div>
      {v && typeof v.credit === "string" && <p className={styles.help}>{tl({ en: `Source: ${v.credit}`, ar: `المصدر: ${v.credit}` })}</p>}
    </FieldShell>
  );
}

function VideoEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "video" }>>) {
  const { t } = useAdmin();
  const { pickMedia, readOnly } = useForm();
  const id = useId();
  const v = isObject(value) ? value : null;
  const kind = (v?.kind as string) ?? "none";
  const [youtubeInput, setYoutubeInput] = useState(typeof v?.id === "string" ? v.id : "");

  const chooseFile = async () => {
    const media = await pickMedia("video");
    if (!media) return;
    const extension = media.mimeType === "video/webm" ? "webm" : "mp4";
    onChange({ kind: "file", src: `/media/cms-${media.id}.${extension}`, type: media.mimeType ?? "video/mp4", assetId: media.id });
  };

  return (
    <FieldShell label={field.label} help={field.help} path={path}>
      <div className={styles.segmented} role="radiogroup" aria-label={t("fieldCtaAction")}>
        {(["none", "youtube", "file"] as const).map((option) => (
          <label key={option} className={styles.segment}>
            <input
              type="radio"
              name={id}
              checked={kind === option}
              disabled={readOnly}
              onChange={() => {
                if (option === "none") onChange(null);
                else if (option === "youtube") onChange({ kind: "youtube", id: youtubeId(youtubeInput) ?? youtubeInput });
                else chooseFile();
              }}
            />
            <span>{option === "none" ? t("fieldVideoNone") : option === "youtube" ? t("fieldVideoYoutube") : t("fieldVideoFile")}</span>
          </label>
        ))}
      </div>
      {kind === "youtube" && (
        <div className={styles.field}>
          <label className={styles.subLabel} htmlFor={`${id}-yt`}>
            {t("fieldVideoYoutubeLabel")}
          </label>
          <TextInput
            id={`${id}-yt`}
            dir="ltr"
            value={youtubeInput}
            readOnly={readOnly}
            placeholder="https://www.youtube.com/watch?v=…"
            onChange={(e) => {
              setYoutubeInput(e.target.value);
              onChange({ kind: "youtube", id: youtubeId(e.target.value) ?? e.target.value.trim() });
            }}
          />
          {typeof v?.id === "string" && youtubeId(v.id) && <p className={styles.help}>ID: {v.id}</p>}
        </div>
      )}
      {kind === "file" && (
        <div className={styles.row}>
          {!readOnly && (
            <Button size="sm" icon="video" onClick={chooseFile}>
              {t("replace")}
            </Button>
          )}
          <span className={styles.help} dir="ltr">
            {String(v?.src ?? "")}
          </span>
        </div>
      )}
    </FieldShell>
  );
}

// ---- buttons ------------------------------------------------------------------------------

const ctaKinds = ["page", "section", "whatsapp", "phone", "external"] as const;

function CtaEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "cta" }>>) {
  const { t, tl } = useAdmin();
  const { readOnly, issues } = useForm();
  const id = useId();
  const v = (isObject(value) ? value : (emptyValue(field) as Json)) as Json & { action: Json };
  const action = (isObject(v.action) ? v.action : { kind: "page", route: "contact" }) as Json;
  const setAction = (next: Json) => onChange({ ...v, action: next });
  const labelOf: Record<(typeof ctaKinds)[number], string> = {
    page: t("fieldCtaPage"),
    section: t("fieldCtaSection"),
    whatsapp: t("fieldCtaWhatsapp"),
    phone: t("fieldCtaPhone"),
    external: t("fieldCtaExternal"),
  };

  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLegend}>{tl(field.label)}</legend>
      {v.hidden === true && <Badge tone="neutral" icon="eyeOff">{t("hidden")}</Badge>}
      <FieldEditor
        field={{ type: "text", key: "label", label: { en: t("fieldCtaLabel"), ar: t("fieldCtaLabel") }, required: true, max: 60 }}
        value={v.label}
        path={`${path}.label`}
        onChange={(label) => onChange({ ...v, label })}
      />
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`${id}-kind`}>
          {t("fieldCtaAction")}
        </label>
        <Select
          id={`${id}-kind`}
          value={String(action.kind ?? "page")}
          disabled={readOnly}
          onChange={(e) => {
            const kind = e.target.value;
            setAction(
              kind === "page"
                ? { kind, route: "contact" }
                : kind === "section"
                  ? { kind, anchor: "" }
                  : kind === "external"
                    ? { kind, url: "", newTab: true }
                    : { kind },
            );
          }}
        >
          {ctaKinds.map((kind) => (
            <option key={kind} value={kind}>
              {labelOf[kind]}
            </option>
          ))}
        </Select>
      </div>
      {action.kind === "page" && (
        <RouteSelect value={String(action.route ?? "contact")} onChange={(route) => setAction({ ...action, route })} />
      )}
      {action.kind === "section" && (
        <FieldEditor
          field={{ type: "text", key: "anchor", localized: false, format: "anchor", label: { en: t("fieldCtaAnchor"), ar: t("fieldCtaAnchor") } }}
          value={action.anchor}
          path={`${path}.action.anchor`}
          onChange={(anchor) => setAction({ ...action, anchor })}
        />
      )}
      {action.kind === "external" && (
        <>
          <FieldEditor
            field={{ type: "text", key: "url", localized: false, format: "url", label: { en: t("fieldCtaUrl"), ar: t("fieldCtaUrl") } }}
            value={action.url}
            path={`${path}.action.url`}
            onChange={(url) => setAction({ ...action, url })}
          />
          <Switch checked={action.newTab !== false} onChange={(newTab) => setAction({ ...action, newTab })} label={t("fieldCtaNewTab")} disabled={readOnly} />
        </>
      )}
      {(action.kind === "whatsapp" || action.kind === "phone") && <p className={styles.help}>{t("fieldCtaUsesContact")}</p>}
      {action.kind === "whatsapp" && (
        <OptionalEditor
          field={{
            type: "optional",
            key: "message",
            label: { en: t("fieldCtaMessage"), ar: t("fieldCtaMessage") },
            enableLabel: { en: t("fieldCtaMessage"), ar: t("fieldCtaMessage") },
            field: { type: "text", key: "message", label: { en: t("fieldCtaMessage"), ar: t("fieldCtaMessage") }, multiline: true, max: 300 },
          }}
          value={action.message ?? null}
          path={`${path}.action.message`}
          onChange={(message) => {
            const next = { ...action };
            if (message) next.message = message;
            else delete next.message;
            setAction(next);
          }}
        />
      )}
      <OptionalEditor
        field={{
          type: "optional",
          key: "ariaLabel",
          label: { en: t("fieldCtaAria"), ar: t("fieldCtaAria") },
          enableLabel: { en: t("fieldCtaAria"), ar: t("fieldCtaAria") },
          field: { type: "text", key: "ariaLabel", label: { en: t("fieldCtaAria"), ar: t("fieldCtaAria") }, max: 120 },
        }}
        value={v.ariaLabel ?? null}
        path={`${path}.ariaLabel`}
        onChange={(ariaLabel) => {
          const next = { ...v };
          if (ariaLabel) next.ariaLabel = ariaLabel;
          else delete next.ariaLabel;
          onChange(next);
        }}
      />
      <Switch checked={v.hidden === true} onChange={(hidden) => onChange({ ...v, hidden })} label={t("fieldCtaHidden")} disabled={readOnly} />
      <IssueList issues={issues.filter((i) => i.path === `${path}.action` || i.path === `${path}.action.route`)} />
    </fieldset>
  );
}

// ---- contact numbers and ratings -------------------------------------------------------------

function PhoneEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "phone" }>>) {
  const { t, tl } = useAdmin();
  const { readOnly, issues } = useForm();
  const id = useId();
  const v = isObject(value) ? value : null;
  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLegend}>{tl(field.label)}</legend>
      {field.help && <p className={styles.help}>{tl(field.help)}</p>}
      {v ? (
        <>
          <div className={styles.twoColumns}>
            <div className={styles.field}>
              <label className={styles.subLabel} htmlFor={`${id}-e164`}>
                {t("fieldPhoneNumber")}
              </label>
              <TextInput
                id={`${id}-e164`}
                dir="ltr"
                inputMode="tel"
                placeholder="+20…"
                value={String(v.e164 ?? "")}
                readOnly={readOnly}
                invalid={issues.some((i) => i.path === `${path}.e164`)}
                onChange={(e) => onChange({ ...v, e164: e.target.value.replace(/[\s()-]/g, "") })}
              />
              <IssueList issues={issues.filter((i) => i.path === `${path}.e164`)} />
            </div>
            <div className={styles.field}>
              <label className={styles.subLabel} htmlFor={`${id}-display`}>
                {t("fieldPhoneDisplay")}
              </label>
              <TextInput
                id={`${id}-display`}
                dir="ltr"
                value={String(v.display ?? "")}
                readOnly={readOnly}
                onChange={(e) => onChange({ ...v, display: e.target.value })}
              />
              <IssueList issues={issues.filter((i) => i.path === `${path}.display`)} />
            </div>
          </div>
          <Switch
            checked={v.isPlaceholder === true}
            onChange={(isPlaceholder) => onChange({ ...v, isPlaceholder })}
            label={tl({ en: "Temporary placeholder number", ar: "رقم مؤقت" })}
            disabled={readOnly}
          />
          {!readOnly && (
            <Button size="sm" variant="ghost" icon="trash" onClick={() => onChange(null)}>
              {t("fieldPhoneRemove")}
            </Button>
          )}
        </>
      ) : (
        !readOnly && (
          <Button size="sm" icon="plus" onClick={() => onChange({ e164: "", display: "" })}>
            {t("fieldPhoneAdd")}
          </Button>
        )
      )}
    </fieldset>
  );
}

function RatingEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "rating" }>>) {
  const { t } = useAdmin();
  const { readOnly } = useForm();
  const id = useId();
  const current = typeof value === "number" ? value : null;
  return (
    <FieldShell label={field.label} help={field.help} path={path}>
      <div className={styles.segmented} role="radiogroup">
        <label className={styles.segment}>
          <input type="radio" name={id} checked={current === null} disabled={readOnly} onChange={() => onChange(null)} />
          <span>{t("fieldRatingNone")}</span>
        </label>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={styles.segment}>
            <input type="radio" name={id} checked={current === n} disabled={readOnly} onChange={() => onChange(n)} />
            <span aria-label={t("fieldStars", { count: n })}>{"★".repeat(n)}</span>
          </label>
        ))}
      </div>
    </FieldShell>
  );
}

// ---- structure ----------------------------------------------------------------------------

function GroupEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "group" }>>) {
  const { tl } = useAdmin();
  return (
    <fieldset className={styles.group}>
      <legend className={styles.groupLegend}>{tl(field.label)}</legend>
      {field.help && <p className={styles.help}>{tl(field.help)}</p>}
      <SchemaForm fields={field.fields} value={isObject(value) ? value : {}} onChange={onChange} path={path} />
    </fieldset>
  );
}

function OptionalEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "optional" }>>) {
  const { tl } = useAdmin();
  const { readOnly } = useForm();
  const enabled = value !== null && value !== undefined;
  return (
    <div className={styles.optional}>
      <Switch
        checked={enabled}
        onChange={(on) => onChange(on ? emptyValue(field.field) : null)}
        label={tl(field.enableLabel)}
        description={tl(field.help)}
        disabled={readOnly}
      />
      {enabled && <FieldEditor field={field.field} value={value} onChange={onChange} path={path} />}
    </div>
  );
}

function ListEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "list" }>>) {
  const { t, tl, locale } = useAdmin();
  const { readOnly, issues } = useForm();
  const items = Array.isArray(value) ? (value as Json[]) : [];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const move = (index: number, delta: number) => {
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
    setOpenIndex(null);
  };
  const canAdd = !field.fixed && !readOnly && (field.max === undefined || items.length < field.max);

  return (
    <FieldShell label={field.label} help={field.help} path={path} aside={<span className={styles.counter}>{t("fieldItems", { count: items.length })}</span>}>
      {items.length === 0 && <p className={styles.empty}>{t("fieldEmptyList")}</p>}
      <ol className={styles.list}>
        {items.map((item, index) => {
          const title = displayText(field.itemTitle(item), locale) || `#${index + 1}`;
          const itemPath = join(path, index);
          const itemIssues = issuesAt(issues, itemPath).filter((i) => i.severity !== "warning");
          return (
            <li key={String(item.id ?? item.route ?? index)} className={styles.listItem}>
              <details open={openIndex === index || undefined} className={styles.details}>
                <summary className={styles.summary}>
                  <span className={styles.itemIndex}>{index + 1}</span>
                  <span className={styles.itemTitle}>{title}</span>
                  {item.hidden === true && <Badge icon="eyeOff">{t("hidden")}</Badge>}
                  {item.isPlaceholder === true && <Badge tone="warning">{t("placeholderBadge")}</Badge>}
                  {itemIssues.length > 0 && <Badge tone="danger" icon="warning">{itemIssues.length}</Badge>}
                  <AdminIcon name="chevron" size={16} className={styles.summaryChevron} />
                </summary>
                <div className={styles.itemBody}>
                  <SchemaForm fields={field.fields} value={item} path={itemPath} onChange={(next) => onChange(items.map((it, i) => (i === index ? next : it)))} />
                </div>
              </details>
              {!readOnly && (
                <div className={styles.itemControls}>
                  <IconButton label={t("moveUp")} icon="up" disabled={index === 0} onClick={() => move(index, -1)} />
                  <IconButton label={t("moveDown")} icon="down" disabled={index === items.length - 1} onClick={() => move(index, 1)} />
                  {!field.fixed && (field.min === undefined || items.length > field.min) && (
                    <IconButton label={t("fieldRemoveItem")} icon="trash" onClick={() => onChange(items.filter((_, i) => i !== index))} />
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {canAdd && (
        <Button
          size="sm"
          icon="plus"
          onClick={() => {
            onChange([...items, field.newItem()]);
            setOpenIndex(items.length);
          }}
        >
          {field.addLabel ? tl(field.addLabel) : t("fieldAddItem")}
        </Button>
      )}
    </FieldShell>
  );
}

type Block = { type: "heading" | "paragraph" | "list" | "note"; text?: Label; items?: { en: string[]; ar: string[] } };

function BlocksEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "blocks" }>>) {
  const { t } = useAdmin();
  const { readOnly, view, issues } = useForm();
  const blocks = Array.isArray(value) ? (value as Block[]) : [];
  const languages = view === "both" ? (["en", "ar"] as const) : ([view] as const);
  const set = (index: number, block: Block) => onChange(blocks.map((b, i) => (i === index ? block : b)));
  const move = (index: number, delta: number) => {
    const next = [...blocks];
    const [block] = next.splice(index, 1);
    next.splice(index + delta, 0, block);
    onChange(next);
  };
  const typeLabel = { heading: t("blockHeading"), paragraph: t("blockParagraph"), list: t("blockList"), note: t("blockNote") };
  const add = (type: Block["type"]) =>
    onChange([...blocks, type === "list" ? { type, items: { en: [""], ar: [""] } } : { type, text: { en: "", ar: "" } }]);

  return (
    <FieldShell label={field.label} help={field.help} required={field.required} path={path}>
      {blocks.length === 0 && <p className={styles.empty}>{t("blockEmpty")}</p>}
      <ol className={styles.blocks}>
        {blocks.map((block, index) => (
          <li key={index} className={cx(styles.block, styles[`block-${block.type}`])}>
            <div className={styles.blockHeader}>
              <Badge tone={block.type === "note" ? "accent" : "info"}>{typeLabel[block.type]}</Badge>
              {!readOnly && (
                <div className={styles.itemControls}>
                  <IconButton label={t("moveUp")} icon="up" disabled={index === 0} onClick={() => move(index, -1)} />
                  <IconButton label={t("moveDown")} icon="down" disabled={index === blocks.length - 1} onClick={() => move(index, 1)} />
                  <IconButton label={t("remove")} icon="trash" onClick={() => onChange(blocks.filter((_, i) => i !== index))} />
                </div>
              )}
            </div>
            <div className={cx(styles.bilingual, view !== "both" && styles.single)}>
              {languages.map((lang) => (
                <div key={lang} className={styles.langField}>
                  <span className={styles.langTag}>{lang === "en" ? t("english") : t("arabic")}</span>
                  {block.type === "list" ? (
                    <TextArea
                      lang={lang}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      rows={4}
                      readOnly={readOnly}
                      aria-label={`${typeLabel.list} — ${lang === "en" ? t("english") : t("arabic")}`}
                      value={(block.items?.[lang] ?? []).join("\n")}
                      onChange={(e) =>
                        set(index, { ...block, items: { ...(block.items ?? { en: [], ar: [] }), [lang]: e.target.value.split("\n") } })
                      }
                    />
                  ) : block.type === "heading" ? (
                    <TextInput
                      lang={lang}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      readOnly={readOnly}
                      aria-label={`${typeLabel.heading} — ${lang === "en" ? t("english") : t("arabic")}`}
                      value={block.text?.[lang] ?? ""}
                      onChange={(e) => set(index, { ...block, text: { ...(block.text ?? { en: "", ar: "" }), [lang]: e.target.value } })}
                    />
                  ) : (
                    <TextArea
                      lang={lang}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                      rows={4}
                      readOnly={readOnly}
                      aria-label={`${typeLabel[block.type]} — ${lang === "en" ? t("english") : t("arabic")}`}
                      value={block.text?.[lang] ?? ""}
                      onChange={(e) => set(index, { ...block, text: { ...(block.text ?? { en: "", ar: "" }), [lang]: e.target.value } })}
                    />
                  )}
                </div>
              ))}
            </div>
            {block.type === "list" && <p className={styles.help}>{t("blockListHelp")}</p>}
            <IssueList issues={issues.filter((i) => i.path === join(path, index))} />
          </li>
        ))}
      </ol>
      {!readOnly && (
        <div className={styles.row}>
          <span className={styles.subLabel}>{t("blockAdd")}:</span>
          {(["paragraph", "heading", "list", "note"] as const).map((type) => (
            <Button key={type} size="sm" variant="ghost" icon="plus" onClick={() => add(type)}>
              {typeLabel[type]}
            </Button>
          ))}
        </div>
      )}
    </FieldShell>
  );
}

function useCatalogOptions(catalog: Extract<Field, { type: "references" }>["catalog"]) {
  const { locale, t } = useAdmin();
  const { catalogs } = useForm();
  const def = catalogDefs[catalog];
  return (catalogs[catalog] ?? []).map((record) => ({
    slug: record.slug,
    title: displayText(def.itemTitle(record.draft), locale) || record.slug,
    unpublished: statusOf(record.draft, record.published) === "draft",
    draftLabel: t("statusDraft"),
  }));
}

function ReferencesEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "references" }>>) {
  const { t } = useAdmin();
  const { readOnly } = useForm();
  const options = useCatalogOptions(field.catalog);
  const ids = Array.isArray(value) ? (value as string[]) : [];
  const id = useId();
  const move = (index: number, delta: number) => {
    const next = [...ids];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };
  const available = options.filter((o) => !ids.includes(o.slug));
  const full = field.count !== undefined ? ids.length >= field.count : field.max !== undefined && ids.length >= field.max;

  return (
    <FieldShell
      label={field.label}
      help={field.help}
      path={path}
      required={Boolean(field.count || field.min)}
      aside={
        <span className={styles.counter}>
          {field.count !== undefined ? t("fieldReferenceCount", { count: ids.length, total: field.count }) : t("fieldItems", { count: ids.length })}
        </span>
      }
    >
      <ol className={styles.references}>
        {ids.map((slug, index) => {
          const option = options.find((o) => o.slug === slug);
          return (
            <li key={slug} className={styles.reference}>
              <span className={styles.itemIndex}>{index + 1}</span>
              <span className={styles.itemTitle}>{option?.title ?? slug}</span>
              {!option && <Badge tone="danger">{t("fieldReferenceMissing")}</Badge>}
              {option?.unpublished && <Badge tone="warning">{option.draftLabel}</Badge>}
              {!readOnly && (
                <span className={styles.itemControls}>
                  <IconButton label={t("moveUp")} icon="up" disabled={index === 0} onClick={() => move(index, -1)} />
                  <IconButton label={t("moveDown")} icon="down" disabled={index === ids.length - 1} onClick={() => move(index, 1)} />
                  <IconButton label={t("remove")} icon="close" onClick={() => onChange(ids.filter((s) => s !== slug))} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {!readOnly && !full && available.length > 0 && (
        <div className={styles.row}>
          <label className="sr-only" htmlFor={id}>
            {t("fieldReferenceAdd")}
          </label>
          <Select
            id={id}
            value=""
            onChange={(e) => e.target.value && onChange([...ids, e.target.value])}
          >
            <option value="">{t("fieldReferenceAdd")}</option>
            {available.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.title}
              </option>
            ))}
          </Select>
        </div>
      )}
    </FieldShell>
  );
}

function ReferenceEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "reference" }>>) {
  const { t } = useAdmin();
  const { readOnly } = useForm();
  const options = useCatalogOptions(field.catalog);
  const id = useId();
  return (
    <FieldShell label={field.label} help={field.help} path={path} required={field.required} htmlFor={id}>
      <Select id={id} value={typeof value === "string" ? value : ""} disabled={readOnly} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t("fieldReferenceChoose")}</option>
        {options.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.title}
            {option.unpublished ? ` (${option.draftLabel})` : ""}
          </option>
        ))}
      </Select>
    </FieldShell>
  );
}

function LayoutEditor({ field, value, onChange, path }: EditorProps<Extract<Field, { type: "layout" }>>) {
  const { t, tl } = useAdmin();
  const { readOnly } = useForm();
  const known = field.sections.map((s) => s.id);
  const sections = normalizeLayout({ sections: Array.isArray(value) ? (value as { id: string; hidden?: boolean }[]) : [] }, known).sections;
  const update = (next: typeof sections) => onChange(next);
  const move = (index: number, delta: number) => {
    const next = [...sections];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    update(next);
  };
  return (
    <FieldShell label={field.label} help={field.help} path={path}>
      <ol className={styles.references}>
        {sections.map((section, index) => {
          const label = field.sections.find((s) => s.id === section.id)?.label;
          return (
            <li key={section.id} className={cx(styles.reference, section.hidden && styles.muted)}>
              <span className={styles.itemIndex}>{index + 1}</span>
              <span className={styles.itemTitle}>{tl(label)}</span>
              {section.hidden && <Badge icon="eyeOff">{t("hidden")}</Badge>}
              {!readOnly && (
                <span className={styles.itemControls}>
                  <IconButton label={t("moveUp")} icon="up" disabled={index === 0} onClick={() => move(index, -1)} />
                  <IconButton label={t("moveDown")} icon="down" disabled={index === sections.length - 1} onClick={() => move(index, 1)} />
                  <IconButton
                    label={section.hidden ? t("show") : t("hide")}
                    icon={section.hidden ? "eye" : "eyeOff"}
                    onClick={() => update(sections.map((s, i) => (i === index ? (s.hidden ? { id: s.id } : { id: s.id, hidden: true }) : s)))}
                  />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </FieldShell>
  );
}
