import type { Locale } from "./i18n";

/**
 * Central route registry.
 *
 * Every page lives under `app/[locale]/…`. A route registered with
 * `live: false` (a page not built yet) either falls back to a matching homepage
 * section (`homeAnchor`) or renders as a non-interactive "coming soon" control,
 * so the static export never contains a broken link.
 */
export type RouteKey =
  | "home"
  | "about"
  | "services"
  | "servicesSpecialties"
  | "servicesTreatments"
  | "videos"
  | "reviews"
  | "reviewsFaq"
  | "articles"
  | "contact";

type RouteDefinition = {
  /** Path below the locale prefix, with trailing slash (and optional hash). */
  path: string;
  live: boolean;
  /** Homepage section id used while the dedicated page does not exist yet. */
  homeAnchor?: string;
};

export const routes: Record<RouteKey, RouteDefinition> = {
  home: { path: "", live: true },
  about: { path: "about/", live: true },
  services: { path: "services/", live: true },
  // Anchors match the group ids in content/services.ts
  servicesSpecialties: { path: "services/#medical-specialties", live: true },
  servicesTreatments: { path: "services/#treatments", live: true },
  videos: { path: "videos/", live: true },
  reviews: { path: "reviews/", live: true },
  // FAQ section of the Reviews & FAQs page
  reviewsFaq: { path: "reviews/#faq", live: true },
  articles: { path: "articles/", live: true },
  contact: { path: "contact/", live: true },
};

/** Paths of all built pages (for the sitemap). */
export const pagePaths = Object.values(routes)
  .filter((route) => route.live && !route.path.includes("#"))
  .map((route) => route.path);

export function localeHref(locale: Locale, path = ""): string {
  return `/${locale}/${path}`;
}

/**
 * Resolves a route to an href, or `null` when the destination is not available yet.
 * Pass `allowHomeAnchor: false` for links that sit inside the section they would fall back to.
 */
export function resolveRoute(
  key: RouteKey,
  locale: Locale,
  { allowHomeAnchor = true }: { allowHomeAnchor?: boolean } = {},
): string | null {
  const route = routes[key];
  if (route.live) return localeHref(locale, route.path);
  if (allowHomeAnchor && route.homeAnchor) return localeHref(locale, `#${route.homeAnchor}`);
  return null;
}
