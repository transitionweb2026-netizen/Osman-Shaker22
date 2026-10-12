# Supabase CMS — integration plan

Status: **not implemented**. The site currently reads typed content from `content/`.
This document describes how to connect Supabase later without touching the
presentation components.

## 1. How content reaches a static site

The site is a static export (`out/`) hosted on Hostinger, so there is no server
to render pages on request. Two consequences:

- **Editing in Supabase does not change the exported HTML by itself.**
  Content is read while `next build` runs, so a new build and upload is needed
  for changes to appear.
- Reading content in the browser instead would work, but search engines and
  link previews would then see the fallback content, not the edited one.

Recommended flow (keeps full SEO and static hosting):

1. Editors change content in the future dashboard and press **Publish**.
2. A Supabase Database Webhook (or Edge Function) calls a CI job — e.g. a
   GitHub Actions `repository_dispatch` event.
3. The job runs `npm ci && npm run build` with the public Supabase URL and anon
   key, then uploads `out/` to Hostinger (FTP/SFTP deploy action).
4. Builds take about a minute; the live site updates when the upload finishes.

## 2. Where the code plugs in

`lib/content.ts` defines the seam:

```ts
export interface ContentSource {
  getSiteContent(): Promise<SiteContent>;
  getHomePage(): Promise<HomePageContent>;
  getAboutPage(): Promise<AboutPageContent>;
  getServicesPage(): Promise<ServicesPageContent>;
  getVideosPage(): Promise<VideosPageContent>;
  getReviewsPage(): Promise<ReviewsPageContent>;
  getArticlesPage(): Promise<ArticlesPageContent>;
  getContactPage(): Promise<ContactPageContent>;
}
```

Add a `supabaseContentSource` that fetches published rows, maps them onto the
types in `content/types.ts` and **falls back to the static content** when the
environment variables are missing or a request fails. Then switch the `source`
constant. Components stay unchanged, because they only receive localized,
resolved values (`getSite(locale)`, `getHome(locale)`, `getAbout(locale)`, …).

Featured selections are references, not copies: the homepage and About page
store ids (`serviceIds`, `videoIds`, `reviewIds`, `faqIds`) that `lib/content.ts`
resolves against the catalogs. Keep that model in the database (a sort-ordered
`featured_items` table, or `featured_on_home` / `featured_on_about` columns).

Validate fetched data before using it (e.g. with `zod`), so a bad edit fails
the build instead of publishing a broken page. Keep the "exactly five
specialties / five treatments / three videos / four reviews" rules in that
validation, or relax the tuple types in `content/types.ts` if the design should
accept other counts.

## 3. Suggested schema

Bilingual fields are stored as `_en` / `_ar` column pairs, which map directly
onto `Localized<string>`. Every editable table has a `status` so drafts are never
public.

```sql
create type content_status as enum ('draft', 'published');

-- People allowed to edit (linked to Supabase Auth users)
create table public.editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Singleton sections: hero, intro video, about, statistics heading, journey heading,
-- why choose, final CTA, footer, SEO, contact details, ui strings…
-- `content` holds the same bilingual shape as content/home.ts and content/site.ts.
create table public.page_sections (
  key text primary key,                -- e.g. 'home.hero', 'site.contact', 'home.seo'
  content jsonb not null,
  status content_status not null default 'draft',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id)
);

-- Repeating items (one table per list keeps the dashboard simple)

-- Service groups on the Services page ('medical-specialties', 'treatments', 'consultation-care', …)
create table public.service_groups (
  id text primary key,                 -- also the page anchor, e.g. /en/services/#treatments
  eyebrow_en text not null, eyebrow_ar text not null,
  title_en text not null, title_ar text not null,
  description_en text not null, description_ar text not null,
  sort_order int not null default 0
);

-- The services catalog. Cards show `summary`; the popup shows `details`, an array of
-- blocks matching the ContentBlock type:
--   {"type": "paragraph" | "heading" | "note", "text": {"en": "…", "ar": "…"}}
--   {"type": "list", "items": {"en": ["…"], "ar": ["…"]}}
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,           -- referenced by featured selections
  group_id text not null references public.service_groups (id),
  title_en text not null, title_ar text not null,
  summary_en text not null, summary_ar text not null,
  details jsonb not null default '[]',
  image_path text not null,            -- Supabase Storage path
  image_alt_en text not null, image_alt_ar text not null,
  sort_order int not null default 0,
  status content_status not null default 'draft',
  updated_at timestamptz not null default now()
);

-- public.journey_steps      (icon, title_*, description_*, sort_order, status)
-- public.statistics         (value int, suffix, label_*, sort_order, status)
-- public.videos             (slug, title_*, description_*, poster_path, youtube_id or file_path, duration, sort_order, status)
-- public.reviews            (text_*, reviewer_*, rating int check (rating between 1 and 5),
--                            consent_confirmed boolean not null, sort_order, status)
-- public.faq_categories     (slug, title_*, sort_order, status)   — topics on the Reviews & FAQs page
-- public.faqs               (slug, category_id, question_*, answer_*, sort_order, status)
-- public.social_links       (platform, url, sort_order, status)
-- public.career_milestones  (period_*, title_*, organization_*, description_*, sort_order, status)
-- public.certificates       (title_*, image_path, sort_order, status) — publish only real, verified scans
-- public.articles           (slug, category_*, title_*, excerpt_*, image_path, body jsonb (ContentBlock[]),
--                            reviewed_by_* null, is_featured boolean, sort_order, status)
```

For articles, consider requiring `reviewed_by_en` / `reviewed_by_ar` before an
article can be published, so medical content always carries a named reviewer.

For reviews, require `consent_confirmed = true` and a `rating` before a row can
be published (a check constraint or a trigger), so testimonials cannot go live
without the patient's documented consent or with an invented score. The build
enforces the rating as well: a non-placeholder review without one fails it.

## 4. Row Level Security

Enable RLS on **every** table. The public (anon) role may only read published
rows; only editors may write.

```sql
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.editors where user_id = auth.uid());
$$;

alter table public.services enable row level security;

create policy "Public can read published services"
  on public.services for select
  to anon, authenticated
  using (status = 'published');

create policy "Editors can read all services"
  on public.services for select
  to authenticated
  using (public.is_editor());

create policy "Editors can insert services"
  on public.services for insert
  to authenticated
  with check (public.is_editor());

create policy "Editors can update services"
  on public.services for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete services"
  on public.services for delete
  to authenticated
  using (public.is_editor());

-- Repeat for each content table. `editors` itself: RLS on, no public policies;
-- manage membership from the Supabase dashboard or a service-role script.
```

## 5. Storage

- Bucket `site-media`, **public read** (images must load on the public site).
- Writes restricted to editors:

```sql
create policy "Editors can upload site media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-media' and public.is_editor());

create policy "Editors can update site media"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-media' and public.is_editor());

create policy "Editors can delete site media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-media' and public.is_editor());
```

`components/media/MediaImage.tsx` already renders absolute URLs as-is. For
responsive images from Storage, either upload pre-sized variants or extend the
component to build a `srcset` from Supabase image transformations (paid plans).

## 6. Keys and secrets

- The build only needs `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The anon key is public by design; RLS is what
  protects the data.
- **Never** put the service-role key in this project, in `.env*` files that the
  build reads, or in the browser. Use it only in trusted server environments
  (Supabase Edge Functions, CI secrets for admin scripts).
- The editing dashboard (a separate app or route) authenticates editors with
  Supabase Auth; all writes go through RLS.
