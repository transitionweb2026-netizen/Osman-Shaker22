import type { MetadataRoute } from "next";
import { allowIndexing, siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    // The CMS (static admin pages) is never indexed
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
