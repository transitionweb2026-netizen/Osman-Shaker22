/**
 * Field schemas for CMS editors.
 *
 * Each document and catalog entry is described by a list of fields. The same
 * description drives the editor UI (`components/admin/fields`), default
 * values for new entries, and validation:
 *   invalid     unsafe or malformed values (blocks saving)
 *   incomplete  missing required content or translation (blocks publishing)
 *   warning     worth knowing, never blocking
 */
import { SECTION_ANCHOR, isRouteKey, safeExternalUrl } from "@/lib/cta";
import type { CatalogKey } from "./model";

export type Json = Record<string, unknown>;
export type Label = { en: string; ar: string };

export const L = (en: string, ar: string): Label => ({ en, ar });

type Base = { key: string; label: Label; help?: Label };

export type TextField = Base & {
  type: "text";
  /** `false` for single-language values (URLs, ids). Default: bilingual. */
  localized?: boolean;
  multiline?: boolean;
  required?: boolean;
  max?: number;
  format?: "url" | "anchor";
};

export type Field =
  | TextField
  | (Base & { type: "lines"; required?: boolean })
  | (Base & { type: "number"; required?: boolean; min?: number; max?: number; integer?: boolean })
  | (Base & { type: "boolean" })
  | (Base & { type: "select"; options: { value: string; label: Label }[] })
  | (Base & { type: "image"; required?: boolean })
  | (Base & { type: "video" })
  | (Base & { type: "cta" })
  | (Base & { type: "route" })
  | (Base & { type: "phone" })
  | (Base & { type: "rating" })
  | (Base & { type: "group"; fields: Field[] })
  | (Base & { type: "optional"; field: Field; enableLabel: Label })
  | (Base & {
      type: "list";
      fields: Field[];
      itemTitle: (item: Json) => string | Label | undefined;
      newItem: () => Json;
      min?: number;
      max?: number;
      addLabel?: Label;
      /** Items cannot be added or removed, only edited and reordered. */
      fixed?: boolean;
    })
  | (Base & { type: "blocks"; required?: boolean })
  | (Base & { type: "references"; catalog: CatalogKey; count?: number; min?: number; max?: number })
  | (Base & { type: "reference"; catalog: CatalogKey; required?: boolean })
  | (Base & { type: "layout"; sections: { id: string; label: Label }[] })
  | (Base & { type: "placeholder" });

export type FieldType = Field["type"];

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export function emptyValue(field: Field): unknown {
  switch (field.type) {
    case "text":
      return field.localized === false ? "" : { en: "", ar: "" };
    case "lines":
      return { en: [], ar: [] };
    case "number":
      return field.min ?? 0;
    case "boolean":
    case "placeholder":
      return false;
    case "select":
      return field.options[0]?.value ?? "";
    case "image":
      return { src: "", alt: { en: "", ar: "" } };
    case "cta":
      return { label: { en: "", ar: "" }, action: { kind: "page", route: "contact" } };
    case "route":
      return "home";
    case "group":
      return emptyObject(field.fields);
    case "list":
    case "blocks":
    case "references":
      return [];
    case "reference":
      return "";
    case "video":
    case "phone":
    case "rating":
    case "optional":
      return null;
    case "layout":
      return { sections: field.sections.map((s) => ({ id: s.id })) };
  }
}

export function emptyObject(fields: Field[]): Json {
  return Object.fromEntries(
    fields.filter((f) => f.type !== "placeholder").map((f) => [f.key, emptyValue(f)]),
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export type Severity = "invalid" | "incomplete" | "warning";
export type Issue = { path: string; severity: Severity; message: Label };

/** Slugs available in each catalog, for reference checks. */
export type ValidationContext = { catalogs?: Partial<Record<CatalogKey, Set<string>>> };

const msg = {
  required: L("Required.", "مطلوب."),
  missingEn: L("The English text is missing.", "النص الإنجليزي ناقص."),
  missingAr: L("The Arabic text is missing.", "النص العربي ناقص."),
  tooLong: (max: number) => L(`Keep it under ${max} characters.`, `يجب ألا يتجاوز ${max} حرفًا.`),
  url: L("Enter a complete address starting with https://", "أدخل عنوانًا كاملًا يبدأ بـ https://"),
  anchor: L(
    "Use lowercase letters, numbers and hyphens (a section id such as “specialties”).",
    "استخدم أحرفًا إنجليزية صغيرة وأرقامًا وشرطات (معرّف قسم مثل specialties).",
  ),
  route: L("Choose a page.", "اختر صفحة."),
  phone: L("Use international format, e.g. +201234567890.", "استخدم الصيغة الدولية، مثل ‎+201234567890."),
  phoneDisplay: L("Add the number as it should be shown.", "أضف الرقم كما يجب أن يظهر."),
  image: L("Choose an image.", "اختر صورة."),
  alt: L(
    "Describe the image in both languages (alternative text for screen readers).",
    "صف الصورة باللغتين (نص بديل لقارئات الشاشة).",
  ),
  youtube: L("Enter a YouTube link or the 11-character video id.", "أدخل رابط يوتيوب أو معرّف الفيديو المكوّن من 11 حرفًا."),
  videoFile: L("Choose or upload the video file.", "اختر ملف الفيديو أو ارفعه."),
  number: (min?: number, max?: number) =>
    L(
      `Enter a number${min !== undefined ? ` from ${min}` : ""}${max !== undefined ? ` to ${max}` : ""}.`,
      `أدخل رقمًا${min !== undefined ? ` من ${min}` : ""}${max !== undefined ? ` إلى ${max}` : ""}.`,
    ),
  count: (n: number) => L(`Choose exactly ${n}.`, `اختر ${n} بالضبط.`),
  atLeast: (n: number) => L(`Add at least ${n}.`, `أضف ${n} على الأقل.`),
  atMost: (n: number) => L(`Use at most ${n}.`, `استخدم ${n} كحد أقصى.`),
  missingReference: (id: string) =>
    L(`“${id}” does not exist (it may have been deleted).`, `العنصر «${id}» غير موجود (ربما حُذف).`),
  emptyBlock: L("This block is empty in one of the languages.", "هذه الفقرة فارغة في إحدى اللغتين."),
  placeholder: L(
    "Marked as placeholder: replace it or confirm it before launch.",
    "معلّم كمحتوى مؤقت: استبدله أو اعتمده قبل الإطلاق.",
  ),
  rating: L("A real review needs the patient's rating (1–5).", "يحتاج الرأي الحقيقي إلى تقييم المريض (١–٥)."),
};

const isText = (v: unknown): v is string => typeof v === "string";
const blank = (v: unknown) => !isText(v) || v.trim() === "";
const join = (base: string, key: string | number) => (base ? `${base}.${key}` : String(key));

/** YouTube id from a link or a bare id, or `null`. */
export function youtubeId(input: string): string | null {
  const value = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return youtubeId(url.pathname.slice(1));
    if (host.endsWith("youtube.com")) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) return youtubeId(fromQuery);
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})/);
      if (match) return match[1];
    }
  } catch {
    /* not a URL */
  }
  return null;
}

function checkLocalized(value: unknown, path: string, required: boolean, max: number | undefined, out: Issue[]) {
  const v = (value ?? {}) as Partial<Label>;
  const en = isText(v.en) ? v.en : "";
  const ar = isText(v.ar) ? v.ar : "";
  if (required) {
    if (!en.trim() && !ar.trim()) out.push({ path, severity: "incomplete", message: msg.required });
    else if (!en.trim()) out.push({ path: `${path}.en`, severity: "incomplete", message: msg.missingEn });
    else if (!ar.trim()) out.push({ path: `${path}.ar`, severity: "incomplete", message: msg.missingAr });
  } else if (en.trim() && !ar.trim()) {
    out.push({ path: `${path}.ar`, severity: "incomplete", message: msg.missingAr });
  } else if (ar.trim() && !en.trim()) {
    out.push({ path: `${path}.en`, severity: "incomplete", message: msg.missingEn });
  }
  if (max) {
    if (en.length > max) out.push({ path: `${path}.en`, severity: "invalid", message: msg.tooLong(max) });
    if (ar.length > max) out.push({ path: `${path}.ar`, severity: "invalid", message: msg.tooLong(max) });
  }
}

function checkAction(action: unknown, path: string, out: Issue[]) {
  const a = (action ?? {}) as Json;
  switch (a.kind) {
    case "page":
      if (!isText(a.route) || !isRouteKey(a.route)) out.push({ path: `${path}.route`, severity: "invalid", message: msg.route });
      break;
    case "section":
      if (!isText(a.anchor) || !SECTION_ANCHOR.test(a.anchor)) {
        out.push({ path: `${path}.anchor`, severity: "invalid", message: msg.anchor });
      }
      break;
    case "whatsapp":
      if (a.message) checkLocalized(a.message, `${path}.message`, false, 300, out);
      break;
    case "phone":
      break;
    case "external":
      if (!isText(a.url) || !safeExternalUrl(a.url)) out.push({ path: `${path}.url`, severity: "invalid", message: msg.url });
      break;
    default:
      out.push({ path, severity: "invalid", message: msg.route });
  }
}

export function validateField(field: Field, value: unknown, path: string, ctx: ValidationContext, out: Issue[]): void {
  switch (field.type) {
    case "text": {
      if (field.localized === false) {
        const v = isText(value) ? value : "";
        if (field.required && !v.trim()) out.push({ path, severity: "incomplete", message: msg.required });
        if (v.trim() && field.format === "url" && !safeExternalUrl(v)) out.push({ path, severity: "invalid", message: msg.url });
        if (v.trim() && field.format === "anchor" && !SECTION_ANCHOR.test(v)) {
          out.push({ path, severity: "invalid", message: msg.anchor });
        }
        if (field.max && v.length > field.max) out.push({ path, severity: "invalid", message: msg.tooLong(field.max) });
      } else {
        checkLocalized(value, path, Boolean(field.required), field.max, out);
      }
      return;
    }
    case "lines": {
      const v = (value ?? {}) as { en?: unknown; ar?: unknown };
      const en = Array.isArray(v.en) ? v.en.filter((s) => !blank(s)) : [];
      const ar = Array.isArray(v.ar) ? v.ar.filter((s) => !blank(s)) : [];
      if (field.required && !en.length && !ar.length) out.push({ path, severity: "incomplete", message: msg.required });
      else if (en.length !== ar.length) {
        out.push({ path, severity: "incomplete", message: en.length > ar.length ? msg.missingAr : msg.missingEn });
      }
      return;
    }
    case "number": {
      const ok =
        typeof value === "number" &&
        Number.isFinite(value) &&
        (field.min === undefined || value >= field.min) &&
        (field.max === undefined || value <= field.max) &&
        (!field.integer || Number.isInteger(value));
      if (!ok) out.push({ path, severity: "invalid", message: msg.number(field.min, field.max) });
      return;
    }
    case "image": {
      const v = value as { src?: unknown; alt?: unknown } | null | undefined;
      if (!v || blank(v.src)) {
        if (field.required) out.push({ path, severity: "incomplete", message: msg.image });
        return;
      }
      const alt = (v.alt ?? {}) as Partial<Label>;
      if (blank(alt.en) || blank(alt.ar)) out.push({ path: `${path}.alt`, severity: "incomplete", message: msg.alt });
      return;
    }
    case "video": {
      const v = value as Json | null | undefined;
      if (!v) return;
      if (v.kind === "youtube" && (!isText(v.id) || !youtubeId(v.id))) {
        out.push({ path, severity: "invalid", message: msg.youtube });
      }
      if (v.kind === "file" && blank(v.src) && blank(v.assetId)) out.push({ path, severity: "incomplete", message: msg.videoFile });
      return;
    }
    case "cta": {
      const v = (value ?? {}) as Json;
      if (!v.hidden) checkLocalized(v.label, `${path}.label`, true, 60, out);
      checkAction(v.action, `${path}.action`, out);
      if (v.ariaLabel) checkLocalized(v.ariaLabel, `${path}.ariaLabel`, false, 120, out);
      return;
    }
    case "route":
      if (!isText(value) || !isRouteKey(value)) out.push({ path, severity: "invalid", message: msg.route });
      return;
    case "phone": {
      if (value === null || value === undefined) return;
      const v = value as Json;
      if (!isText(v.e164) || !/^\+[1-9]\d{7,14}$/.test(v.e164)) out.push({ path: `${path}.e164`, severity: "invalid", message: msg.phone });
      if (blank(v.display)) out.push({ path: `${path}.display`, severity: "incomplete", message: msg.phoneDisplay });
      return;
    }
    case "rating":
      if (value !== null && value !== undefined && !(Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5)) {
        out.push({ path, severity: "invalid", message: msg.number(1, 5) });
      }
      return;
    case "group":
      validateFields(field.fields, (value ?? {}) as Json, path, ctx, out);
      return;
    case "optional":
      if (value !== null && value !== undefined) validateField(field.field, value, path, ctx, out);
      return;
    case "list": {
      const items = Array.isArray(value) ? (value as Json[]) : [];
      if (field.min !== undefined && items.length < field.min) out.push({ path, severity: "incomplete", message: msg.atLeast(field.min) });
      if (field.max !== undefined && items.length > field.max) out.push({ path, severity: "invalid", message: msg.atMost(field.max) });
      items.forEach((item, index) => validateFields(field.fields, item ?? {}, join(path, index), ctx, out));
      return;
    }
    case "blocks": {
      const blocks = Array.isArray(value) ? (value as Json[]) : [];
      if (field.required && !blocks.length) out.push({ path, severity: "incomplete", message: msg.required });
      blocks.forEach((block, index) => {
        const blockPath = join(path, index);
        if (block.type === "list") {
          const items = (block.items ?? {}) as { en?: string[]; ar?: string[] };
          const en = (items.en ?? []).filter((s) => !blank(s));
          const ar = (items.ar ?? []).filter((s) => !blank(s));
          if (!en.length || en.length !== ar.length) out.push({ path: blockPath, severity: "incomplete", message: msg.emptyBlock });
        } else {
          const text = (block.text ?? {}) as Partial<Label>;
          if (blank(text.en) || blank(text.ar)) out.push({ path: blockPath, severity: "incomplete", message: msg.emptyBlock });
        }
      });
      return;
    }
    case "references": {
      const ids = Array.isArray(value) ? (value as string[]) : [];
      if (field.count !== undefined && ids.length !== field.count) out.push({ path, severity: "incomplete", message: msg.count(field.count) });
      if (field.min !== undefined && ids.length < field.min) out.push({ path, severity: "incomplete", message: msg.atLeast(field.min) });
      if (field.max !== undefined && ids.length > field.max) out.push({ path, severity: "invalid", message: msg.atMost(field.max) });
      const known = ctx.catalogs?.[field.catalog];
      if (known) for (const id of ids) if (!known.has(id)) out.push({ path, severity: "incomplete", message: msg.missingReference(id) });
      return;
    }
    case "reference": {
      if (blank(value)) {
        if (field.required) out.push({ path, severity: "incomplete", message: msg.required });
        return;
      }
      const known = ctx.catalogs?.[field.catalog];
      if (known && !known.has(value as string)) out.push({ path, severity: "incomplete", message: msg.missingReference(value as string) });
      return;
    }
    case "placeholder":
      if (value === true) out.push({ path, severity: "warning", message: msg.placeholder });
      return;
    case "boolean":
    case "select":
    case "layout":
      return;
  }
}

export function validateFields(fields: Field[], value: Json, path: string, ctx: ValidationContext, out: Issue[] = []): Issue[] {
  for (const field of fields) validateField(field, value?.[field.key], join(path, field.key), ctx, out);
  return out;
}

export function validate(fields: Field[], value: Json, ctx: ValidationContext = {}): Issue[] {
  return validateFields(fields, value, "", ctx, []);
}

export const blocksSave = (issues: Issue[]) => issues.some((i) => i.severity === "invalid");
export const blocksPublish = (issues: Issue[]) => issues.some((i) => i.severity !== "warning");

/** Issues at a path or below it. */
export const issuesAt = (issues: Issue[], path: string) =>
  issues.filter((i) => i.path === path || i.path.startsWith(`${path}.`));

/** First non-empty text of a label-like value, for list titles. */
export function displayText(value: unknown, locale: "en" | "ar"): string {
  if (isText(value)) return value;
  if (value && typeof value === "object" && "en" in value) {
    const v = value as Label;
    return (locale === "ar" ? v.ar || v.en : v.en || v.ar) ?? "";
  }
  return "";
}
