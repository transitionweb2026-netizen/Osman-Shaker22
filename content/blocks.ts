/** Shorthands for writing bilingual long-form content (service details, articles). */
import type { ContentBlock } from "./types";

export const heading = (en: string, ar: string): ContentBlock => ({ type: "heading", text: { en, ar } });

export const paragraph = (en: string, ar: string): ContentBlock => ({ type: "paragraph", text: { en, ar } });

export const list = (en: string[], ar: string[]): ContentBlock => ({ type: "list", items: { en, ar } });

export const note = (en: string, ar: string): ContentBlock => ({ type: "note", text: { en, ar } });
