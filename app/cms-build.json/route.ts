import { getCmsSnapshotInfo } from "@/lib/content";

// Which published CMS content the site currently shows. The CMS Publishing screen
// compares it with the database. Cached with the pages and refreshed on every publish.
export const dynamic = "force-static";

export async function GET() {
  const info = await getCmsSnapshotInfo();
  return Response.json({
    cmsContent: info.enabled,
    contentVersion: info.version,
    syncedAt: info.syncedAt,
    builtAt: new Date().toISOString(),
    // Pages read the CMS when rendered: publishing updates the site by itself.
    autoPublish: true,
    live: info.live,
  });
}
