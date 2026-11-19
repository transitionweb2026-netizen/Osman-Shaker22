import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Runs as a Next.js server (Vercel, or a Node.js host such as Hostinger Business/Cloud):
  // pages are prerendered and cached, and re-rendered as soon as content is published in
  // the CMS (lib/cms/published.ts, app/api/revalidate). A static export cannot do that.
  turbopack: {
    // Pin the project root: a parent folder contains another package.json/lockfile,
    // which would otherwise be detected as the workspace root.
    root: __dirname,
  },
  // Keep the `/en/`, `/ar/` URL style of the original static site.
  trailingSlash: true,
  images: {
    // Responsive variants come from `npm run images` (bundled photos) and the
    // `/cms-media` route (CMS uploads), rendered by `components/media/MediaImage.tsx`.
    unoptimized: true,
  },
  experimental: {
    // A single bilingual 404 page, since the app has two root layouts.
    globalNotFound: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Pages may only be framed by this site (the CMS preview); protects /admin/ from clickjacking.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
