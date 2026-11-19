import { createHash, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CMS_CACHE_TAG } from "@/lib/cms/published";

/**
 * Called by Supabase whenever published CMS content changes
 * (supabase/migrations/20261119120000_cms_live_revalidate.sql): POST with the
 * header `x-cms-secret: <CMS_REVALIDATE_SECRET>`.
 *
 * Expires the cached CMS content immediately (`expire: 0`), so the next visit
 * of any page renders the new content instead of a stale copy.
 */
const digest = (value: string) => createHash("sha256").update(value).digest();

export async function POST(request: Request) {
  const secret = (process.env.CMS_REVALIDATE_SECRET ?? "").trim();
  if (!secret) {
    return Response.json({ revalidated: false, error: "CMS_REVALIDATE_SECRET is not set on the server." }, { status: 503 });
  }
  const given = (request.headers.get("x-cms-secret") ?? "").trim();
  if (!timingSafeEqual(digest(given), digest(secret))) {
    return Response.json({ revalidated: false, error: "Invalid secret." }, { status: 401 });
  }
  revalidateTag(CMS_CACHE_TAG, { expire: 0 });
  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
