import { cmsSnapshot } from "@/lib/content";

// Written into the static export as /cms-build.json. The CMS reads it from the
// live site to tell whether published changes are still waiting for a rebuild.
export const dynamic = "force-static";

export function GET() {
  return Response.json({
    cmsContent: cmsSnapshot.enabled,
    contentVersion: cmsSnapshot.version ?? null,
    syncedAt: cmsSnapshot.syncedAt ?? null,
    builtAt: new Date().toISOString(),
  });
}
