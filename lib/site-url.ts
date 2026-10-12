/**
 * Public origin of the website, used for canonical URLs, Open Graph and the sitemap.
 *
 * The production domain is not known yet. Set `NEXT_PUBLIC_SITE_URL`
 * (e.g. in `.env.production`) before the production build; until then the
 * reserved `example.com` domain is used as an obvious placeholder.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(/\/+$/, "");

/**
 * Search engines are asked not to index the site until launch, because it still
 * contains placeholder content. Set `NEXT_PUBLIC_ALLOW_INDEXING=true` for the
 * production build once real content and the domain are in place.
 */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
