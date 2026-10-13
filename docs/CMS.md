# Website CMS

A bilingual (English / Arabic) content management system at **`/admin/`**,
built into the static website. Editors change texts, photos, videos, services,
reviews, FAQs and articles. Publishing makes changes ready for the next site
build. The website stays a fully static export: no server is added.

Connecting it to Supabase: [docs/SUPABASE.md](SUPABASE.md).

## Three separate steps

| Step | Who / where | Effect |
| --- | --- | --- |
| **Save draft** | CMS editor | Stored in the database as the draft. Never visible to the public. |
| **Publish** | CMS editor | The draft becomes the published version (a copy is kept in the history). |
| **Rebuild the site** | `npm run cms:sync && npm run build`, upload `out/` | The live website shows everything published. |

Because the site is static, publishing alone does not change the live pages.
**Publishing** in the CMS compares the database with the live site's
`/cms-build.json` and says when a rebuild is needed.

## What can be edited

- **Pages & sections**: each page lists its sections. Each section can be:
  - edited in English and Arabic side by side, or one language at a time;
  - hidden, or moved, where the design allows it ("Order and visibility");
  - previewed with the website's own components, on a desktop or phone screen, in either language.
- **Catalogs**: services (in groups), videos, reviews, FAQ (in topics), articles, career timeline and certificates. Each catalog has:
  - search, a group or topic filter, and pagination;
  - ordering: videos and reviews are ordered by importance, and the homepage shows the first 3 videos and the first 6 reviews;
  - create, draft, publish, unpublish, delete (administrators only) and history.

  Featured services and featured FAQs are chosen by reference, so the homepage card and the full page are the same record.
- **Media library**:
  - upload JPEG, PNG, WebP or AVIF images (up to 15 MB) and MP4 or WebM videos (up to 50 MB), with progress;
  - each file has a title and default alternative text, and shows where it is used;
  - files used by published content can't be deleted;
  - each use of an image has its own focal point (with a separate one for phones) and its own alternative text.
- **Videos**: an uploaded file, a YouTube link, or "coming soon".
- **Buttons**: label, optional screen-reader label, hidden toggle, and a validated action:
  - open a page;
  - scroll to a section;
  - WhatsApp, or call (both use the numbers in Site settings);
  - open an external `https://` address.
- **Site settings** (administrators only): name and description, contact numbers, social links, navigation, quick-action buttons, footer and interface texts.
- **Search & sharing**: title and description per page and language (with a length check), a custom sharing image, and "hide from search engines".

## Content rules the CMS enforces

- **Draft and publish checks**:
  - Missing required text (in either language) or missing alternative text can be saved as a draft, but not published.
  - Invalid values block saving: too long, an unsafe URL, a malformed number.
- **Reviews**: a real review needs the patient's documented consent (admin checkbox) and the rating the patient gave. The database refuses to publish one without both. Nothing is invented: placeholder reviews describe the review policy and show "Rating pending".
- **Articles**: a real article needs a named medical reviewer before it can be published. The database checks this too.
- **Placeholders**: items marked as placeholders are listed:
  - on the dashboard;
  - by `npm run check:content`;
  - by the launch build, which stops while any remain.
- **Deletion**:
  - Deleting warns when the entry is referenced elsewhere, or still published.
  - A service group or FAQ topic that still contains entries can't be deleted.

## Architecture

```
Browser (/admin/, static pages)
   │  Supabase Auth (email + password, invitation only)
   │  PostgREST + Storage, protected by Row Level Security
   ▼
Supabase: cms_documents, cms_<catalog> tables, cms_media, cms_revisions, bucket cms-media (private)
   │  cms_published_site()  — published content only, callable with the publishable key
   ▼
npm run cms:sync  →  content/cms-snapshot.json (+ public/media/cms-*.webp|mp4)
   ▼
next build  →  out/  (content/*.ts defaults, overridden by the snapshot)  →  Hostinger
```

**Code map**

- `supabase/migrations/…_cms_foundation.sql`: the schema, RLS, storage policies, publishing functions, roles and revision history.
- `lib/cms/`:
  - `model.ts`: how CMS records map onto the site's content tree, and `applySnapshot` for the build.
  - `registry.ts`: every editable document and catalog, with bilingual field labels and validation.
  - `schema.ts`: the field types and validation.
  - `store/`: `SupabaseStore` (real data) and `LocalStore` (the demo).
  - `preview.ts`: draft previews.
  - `media-upload.ts`: file checks and thumbnails.
- `components/admin/`: the interface: shell, screens, editors, field editors, media library and preview.
- `app/admin/`: static routes. Screens read their state from the URL, e.g. `/admin/edit/?doc=home.hero` or `/admin/videos/?id=…`.
- `scripts/cms-sync.mjs`: pulls published content and media for the build.
- `scripts/fix-export-segments.mjs`: runs after every build (`postbuild`). On Windows, Next.js 16 writes the router's prefetch files into nested folders; this gives them the flat names the browser requests.

## Security model

- **No public sign-up.** Accounts are invited from the Supabase dashboard. An account without a row in `cms_profiles` has no access.
- **Roles live in the database** (`cms_profiles`: `admin` / `editor`), never in the browser. Every table has Row Level Security. Hidden buttons are only a convenience; the database is what enforces:
  - editors can't change site settings;
  - editors can't delete content, media or team members;
  - at least one administrator always remains.
- **Visitors have no table access at all.** The static build reads published content through `cms_published_site()`. Drafts are never returned by public queries.
- **Media is private by default.** A file becomes readable without signing in only while published content uses it; editors preview drafts through short-lived signed URLs. Uploads:
  - are checked by their actual file signature, not the browser's declared type;
  - are stored as `images/<uuid>.<ext>` or `videos/<uuid>.<ext>` (the storage policy rejects any other path), never under user file names;
  - are limited in size by the bucket.
- **Keys**: the browser and `cms:sync` use only the publishable key. A secret / `service_role` key is refused:
  - by the CMS, which shows an error;
  - by `cms:sync`, which stops;
  - by every build: `prebuild` stops if any `NEXT_PUBLIC_` variable holds one.
- **Privileged actions are database functions:**
  - `cms_set_role` and `cms_remove_member` check that the caller is an administrator;
  - `cms_bootstrap_admin` can only run in the SQL editor.

  Nothing privileged runs in the browser.
- **The admin is never indexed**: pages carry `noindex`, `robots.txt` disallows `/admin/`, and `.htaccess` sends `X-Frame-Options: SAMEORIGIN`.

## Local demo

Without the Supabase variables, `/admin/` runs a **local demo**:
- it is seeded with the website's current content;
- edits are saved only in that browser (localStorage) and never reach the website;
- uploads are disabled;
- **Reset demo** starts it again from the website content.

The interface and the publishing rules are the same as when connected.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run cms:sync` | Downloads published content and the media it uses; writes the build snapshot. |
| `npm run cms:sync -- --reset` | Back to the bundled content (removes the snapshot and synced media). |
| `npm run cms:sync -- --from-file site.json` | Uses a saved `cms_published_site()` result (offline tests). |
| `npm run check:content` | Lists placeholders (from the snapshot when one exists) and launch settings. |
| `npm run build` | Placeholder and key checks, static export, prefetch-file fix. |

## Automating "Publish website" later (not set up)

A button in the CMS can trigger the rebuild instead of running the commands by
hand. One way:
1. A GitHub Action on `repository_dispatch` (or `workflow_dispatch`) runs `npm ci`, `npm run cms:sync` and `npm run build`.
2. It uploads `out/` to Hostinger over FTP or SFTP.
3. It needs these repository secrets:
   - the Supabase URL and publishable key;
   - the Hostinger FTP host, user and password.
4. The trigger is a small Supabase Edge Function that holds a GitHub token, so the token never reaches the browser. It should check that the caller is a CMS member.

None of this is configured yet. It needs those credentials, and your decision
to deploy automatically.

## Limits and notes

- The homepage structure (5 featured specialties, 5 treatments, the statistics) follows the approved design. The editors validate these counts.
- Responsive image sizes for uploads are generated by `cms:sync` (WebP, 320–2560 px). The CMS itself shows the original file or its thumbnail.
- Order changes take effect at the next build, like every published change.
- The revision history keeps the 30 most recent versions of each record.
