# Website CMS

A bilingual (English / Arabic) content management system at **`/admin/`**,
built into the website. Editors change texts, photos, videos, services,
reviews, FAQs and articles. **Publishing shows the change on the live website
within seconds**: no build, no upload, nobody else involved.

Connecting it to Supabase: [docs/SUPABASE.md](SUPABASE.md).

## Two steps

| Step | Who / where | Effect |
| --- | --- | --- |
| **Save draft** | CMS editor | Stored in the database as the draft. Never visible to the public. |
| **Publish** | CMS editor | The draft becomes the published version (a copy is kept in the history), and the live website shows it within seconds ([Live updates](#live-updates)). |

The **Publishing** screen in the CMS compares the database with the live
site's `/cms-build.json` and says whether the site already shows everything published.

**While writing content on your own computer**, run `npm run dev` and open
`http://localhost:3005/ar/` (dashboard: `http://localhost:3005/admin/`; port 3005
is fixed so other projects on 3000 are not confused with this site). It reads the
published content every few seconds; open pages reload by themselves, also after
the computer slept.

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
Browser (/admin/)
   │  Supabase Auth (email + password, invitation only)
   │  PostgREST + Storage, protected by Row Level Security
   ▼
Supabase: cms_documents, cms_<catalog> tables, cms_media, cms_revisions, bucket cms-media (private)
   │  cms_published_site()  — published content only, callable with the publishable key
   │  on publish: trigger (pg_net) → POST https://<site>/api/revalidate/
   ▼
Website (Next.js server: Vercel, or Hostinger Business/Cloud)
   pages prerendered and cached (content/*.ts defaults + published CMS content),
   re-rendered on the next visit after each publish; CMS uploads served by /cms-media/
```

**Code map**

- `supabase/migrations/…_cms_foundation.sql`: the schema, RLS, storage policies, publishing functions, roles and revision history. `…_cms_live_revalidate.sql`: the publish trigger that refreshes the website.
- `lib/cms/`:
  - `published.ts`: reads `cms_published_site()` for the pages (cached under the `cms` tag) and points CMS uploads at `/cms-media/`.
  - `model.ts`: how CMS records map onto the site's content tree (`applySnapshot`).
  - `registry.ts`: every editable document and catalog, with bilingual field labels and validation.
  - `schema.ts`: the field types and validation.
  - `store/`: `SupabaseStore` (real data) and `LocalStore` (the demo).
  - `preview.ts`: draft previews.
  - `media-upload.ts`: file checks and thumbnails.
- `lib/content.ts`: the page data (live CMS content, or the committed snapshot when Supabase can't be reached).
- `app/api/revalidate/route.ts`: called by Supabase after each publish; expires the cached CMS content.
- `app/cms-media/[id]/[file]/route.ts`: published uploads: photos resized to WebP on request (cached for a year), videos through a signed Storage URL.
- `components/admin/`: the interface: shell, screens, editors, field editors, media library and preview.
- `app/admin/`: the CMS routes. Screens read their state from the URL, e.g. `/admin/edit/?doc=home.hero` or `/admin/videos/?id=…`.
- `scripts/cms-sync.mjs`: saves the published content as `content/cms-snapshot.json`, the fallback used when Supabase can't be reached (run by every build).

## Security model

- **No public sign-up.** Accounts are invited from the Supabase dashboard. An account without a row in `cms_profiles` has no access.
- **Roles live in the database** (`cms_profiles`: `admin` / `editor`), never in the browser. Every table has Row Level Security. Hidden buttons are only a convenience; the database is what enforces:
  - editors can't change site settings;
  - editors can't delete content, media or team members;
  - at least one administrator always remains.
- **Visitors have no table access at all.** The website server reads published content through `cms_published_site()`. Drafts are never returned by public queries.
- **Media is private by default.** A file becomes readable without signing in only while published content uses it; editors preview drafts through short-lived signed URLs. `/cms-media/` serves only files listed as published. Uploads:
  - are checked by their actual file signature, not the browser's declared type;
  - are stored as `images/<uuid>.<ext>` or `videos/<uuid>.<ext>` (the storage policy rejects any other path), never under user file names;
  - are limited in size by the bucket.
- **Keys**: the browser, the website server and `cms:sync` use only the publishable key. A secret / `service_role` key is refused:
  - by the CMS, which shows an error;
  - by `cms:sync`, which stops;
  - by every build: `prebuild` stops if any `NEXT_PUBLIC_` variable holds one.
- **The refresh endpoint** (`/api/revalidate/`) needs `CMS_REVALIDATE_SECRET` (server-only, never `NEXT_PUBLIC_`); without it, it refuses every request.
- **Privileged actions are database functions:**
  - `cms_set_role` and `cms_remove_member` check that the caller is an administrator;
  - `cms_bootstrap_admin` can only run in the SQL editor.

  Nothing privileged runs in the browser.
- **The admin is never indexed**: pages carry `noindex`, `robots.txt` disallows `/admin/`, and every response sends `X-Frame-Options: SAMEORIGIN` (`next.config.ts`).

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
| `npm run dev` | Local site on `http://localhost:3005/` that follows the CMS; open pages reload by themselves after a publish (`scripts/dev.mjs`). |
| `npm run dev:static` | `next dev` alone. |
| `npm run build` | Saves the fallback snapshot (`cms:sync`; a failure only leaves the previous one), placeholder and key checks, production build. `SKIP_CMS_SYNC=1` skips the snapshot. |
| `npm start` / `npm run preview` | Production server (`next start`; `preview` on port 3006). |
| `npm run cms:sync` | Saves the published content (and the media it uses) as the fallback snapshot. |
| `npm run cms:sync -- --reset` | Back to the bundled content (removes the snapshot and synced media). |
| `npm run cms:sync -- --from-file site.json` | Uses a saved `cms_published_site()` result (offline tests). |
| `npm run check:content` | Lists placeholders (from the snapshot when one exists) and launch settings. |

## Live updates

```
Publish in the CMS
   → cms_site_state.content_changed_at changes
   → database trigger (pg_net) → POST <site_revalidate_url> with header x-cms-secret
   → app/api/revalidate: revalidateTag("cms", { expire: 0 })
   → the next visit of any page renders the new content (and caches it again)
```

Without that call (not set up yet, or it failed), pages still refresh their
CMS content at most a minute after it changed. If Supabase can't be reached,
pages keep the content they last had (or the committed snapshot), never an error.

### One-time setup

1. **A secret**: a long random value, e.g.
   `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`.
   (`.env.local` on the developer's computer already holds one, as `CMS_REVALIDATE_SECRET`.)
2. **The website host**: add the environment variable `CMS_REVALIDATE_SECRET` with that
   value (Vercel: Project → Settings → Environment Variables, Production; then redeploy.
   Hostinger: the Node.js app's environment variables).
3. **Supabase**:
   - SQL editor: run `supabase/migrations/20261119120000_cms_live_revalidate.sql`.
   - Integrations → Vault → Secrets, two secrets:
     - `site_revalidate_url`: `https://<website domain>/api/revalidate/` (with the final slash);
     - `site_revalidate_secret`: the same value as `CMS_REVALIDATE_SECRET`.

When the website moves (another domain, Vercel → Hostinger), only
`site_revalidate_url` changes, plus the environment variables on the new host.

The earlier GitHub-based publishing (`github_dispatch_token`, `github_dispatch_repo`)
is no longer used: delete those two Vault secrets and revoke the GitHub token.

### Checking it

- Supabase SQL editor: `select * from public.cms_auto_publish_status();` shows
  whether both Vault secrets exist and the website's latest answers (200 = refreshed,
  401 = the two secrets differ, 503 = `CMS_REVALIDATE_SECRET` missing on the host,
  404 = wrong `site_revalidate_url`).
- `https://<site>/cms-build.json`: `contentVersion` is the time of the last publish
  the site shows; `live: true` means it reads the CMS directly.

## Limits and notes

- The homepage structure (featured specialties and treatments) follows the approved design. The editors validate these counts.
- Photos uploaded in the CMS are resized on request (WebP, 320–1920 px, never enlarged) and then cached by browsers and the CDN. The CMS itself shows the original file or its thumbnail.
- Order changes and every other published change appear on the next visit after publishing.
- The revision history keeps the 30 most recent versions of each record.
