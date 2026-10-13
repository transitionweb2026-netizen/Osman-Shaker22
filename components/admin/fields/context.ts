"use client";

import { createContext, useContext } from "react";
import type { CatalogKey } from "@/lib/cms/model";
import type { Issue, Label } from "@/lib/cms/schema";
import type { CatalogRecord, MediaRecord } from "@/lib/cms/store/types";
import type { RouteKey } from "@/lib/routes";

export type LanguageView = "both" | "en" | "ar";

export type FormContextValue = {
  issues: Issue[];
  view: LanguageView;
  readOnly: boolean;
  /** Entries of catalogs referenced by the form (services, FAQs, articles). */
  catalogs: Partial<Record<CatalogKey, CatalogRecord[]>>;
  /** Opens the media library and resolves with the chosen file (or null). */
  pickMedia: (kind: "image" | "video") => Promise<MediaRecord | null>;
  /** Display URL of a media library entry (signed for private uploads). */
  mediaUrl: (assetId: string) => Promise<string | null>;
};

export const FormContext = createContext<FormContextValue | null>(null);

export function useForm(): FormContextValue {
  const value = useContext(FormContext);
  if (!value) throw new Error("Fields must be rendered inside a SchemaForm");
  return value;
}

/** Destinations offered for "opens a page" buttons. */
export const routeLabels: Record<RouteKey, Label> = {
  home: { en: "Home", ar: "الرئيسية" },
  about: { en: "About the Doctor", ar: "عن الطبيب" },
  services: { en: "Services", ar: "الخدمات" },
  servicesSpecialties: { en: "Services → Medical specialties", ar: "الخدمات ← التخصصات الطبية" },
  servicesTreatments: { en: "Services → Treatments", ar: "الخدمات ← العلاجات" },
  videos: { en: "Videos", ar: "الفيديوهات" },
  reviews: { en: "Reviews & FAQs", ar: "الآراء والأسئلة الشائعة" },
  articles: { en: "Articles", ar: "المقالات" },
  contact: { en: "Contact", ar: "تواصل معنا" },
};
