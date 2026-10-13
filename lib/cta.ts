import type { CtaAction, Localized } from "@/content/types";
import type { Locale } from "./i18n";
import type { Resolved } from "./localize";
import { telHref, whatsappHref } from "./contact";
import { resolveRoute, routes, type RouteKey } from "./routes";

type Contact = {
  phone: { e164: string } | null;
  whatsapp: { e164: string } | null;
  whatsappMessage: string;
};

export type CtaTarget = {
  href: string;
  /** Opens in a new tab (WhatsApp, external sites). */
  newTab: boolean;
  icon: "whatsapp" | "phone" | null;
};

/** Section ids are plain slugs, e.g. `specialties`. */
export const SECTION_ANCHOR = /^[a-z][a-z0-9-]*$/;

/** Only absolute https URLs are accepted for external buttons. */
export function safeExternalUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" && parsed.hostname.includes(".") ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function isRouteKey(value: string): value is RouteKey {
  return Object.hasOwn(routes, value);
}

/**
 * Where a button leads, or `null` when it cannot work (an unknown route, a
 * missing phone number, an unsafe URL…) — such buttons are not rendered.
 */
export function ctaTarget(
  action: Resolved<CtaAction> | CtaAction,
  locale: Locale,
  contact: Contact,
): CtaTarget | null {
  switch (action.kind) {
    case "page": {
      if (!isRouteKey(action.route)) return null;
      const href = resolveRoute(action.route, locale, { allowHomeAnchor: false });
      return href ? { href, newTab: false, icon: null } : null;
    }
    case "section":
      return SECTION_ANCHOR.test(action.anchor) ? { href: `#${action.anchor}`, newTab: false, icon: null } : null;
    case "whatsapp": {
      if (!contact.whatsapp) return null;
      const message = typeof action.message === "string" ? action.message : contact.whatsappMessage;
      return { href: whatsappHref(contact.whatsapp, message || contact.whatsappMessage), newTab: true, icon: "whatsapp" };
    }
    case "phone":
      return contact.phone ? { href: telHref(contact.phone), newTab: false, icon: "phone" } : null;
    case "external": {
      const url = safeExternalUrl(action.url);
      return url ? { href: url, newTab: action.newTab, icon: null } : null;
    }
    default:
      return null;
  }
}

/** A WhatsApp action with its default message, for content defaults. */
export const whatsappAction = (message?: Localized): CtaAction =>
  message ? { kind: "whatsapp", message } : { kind: "whatsapp" };
