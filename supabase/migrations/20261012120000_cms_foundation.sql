-- =============================================================================
-- Dr. Othman Shaker website — CMS foundation
--
-- Content model
--   Every content row keeps two copies of its bilingual content:
--     draft      what editors are working on (never public)
--     published  the version the next site build uses (null = not published)
--   `cms_publish` copies draft -> published; `cms_unpublish` clears published.
--   Visitors never query these tables: the static site is generated from
--   `cms_published_site()`, which returns published content only.
--
-- Security
--   Row Level Security on every table. Anonymous users have no table access.
--   CMS members are listed in `cms_profiles` with the role `admin` or `editor`.
--   Media lives in the private bucket `cms-media`; a file becomes readable
--   without signing in only while published content references it.
--
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Members and roles
-- -----------------------------------------------------------------------------

create type public.cms_role as enum ('admin', 'editor');

create table public.cms_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.cms_role not null,
  display_name text check (char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

comment on table public.cms_profiles is
  'CMS members. A signed-in user without a row here has no CMS access at all.';

create function public.cms_current_role()
returns public.cms_role
language sql stable security definer set search_path = ''
as $$ select role from public.cms_profiles where user_id = auth.uid() $$;

create function public.cms_is_editor()
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.cms_profiles where user_id = auth.uid()) $$;

create function public.cms_is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.cms_profiles where user_id = auth.uid() and role = 'admin') $$;

-- At least one administrator must always remain.
create function public.cms_keep_an_admin()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (select 1 from public.cms_profiles where role = 'admin') then
    raise exception 'The CMS needs at least one administrator.' using errcode = '23514';
  end if;
  return null;
end;
$$;

create trigger cms_profiles_keep_an_admin
  after update or delete on public.cms_profiles
  for each statement execute function public.cms_keep_an_admin();

-- -----------------------------------------------------------------------------
-- 2. Content tables
-- -----------------------------------------------------------------------------

-- Page sections and shared settings, one row per stable key
-- (e.g. 'home.hero', 'about.philosophy', 'settings.contact', 'shared.cta').
-- 'settings.*' rows hold site-wide configuration and are admin-only.
create table public.cms_documents (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z]+(\.[a-zA-Z]+)+$'),
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- Catalog tables share one shape: stable slug (referenced by featured sections
-- and used as the public id), importance/display order, draft and published.

create table public.cms_service_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.cms_services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  group_id uuid not null references public.cms_service_groups (id) on delete restrict,
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index cms_services_group_order_idx on public.cms_services (group_id, sort_order);

create table public.cms_videos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.cms_reviews (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  -- Admin-only verification details; never part of the published content.
  consent_confirmed boolean not null default false,
  verification_note text check (char_length(verification_note) <= 2000),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  -- A real review can only be published with documented consent and the
  -- patient's own 1–5 rating. Placeholders (policy statements) are exempt.
  -- (coalesce: a CHECK passes on NULL, so a missing rating must count as false)
  constraint cms_reviews_publishable check (
    published is null
    or coalesce((published ->> 'isPlaceholder')::boolean, false)
    or (consent_confirmed and coalesce((published ->> 'rating') in ('1', '2', '3', '4', '5'), false))
  )
);

create table public.cms_faq_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.cms_faqs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category_id uuid not null references public.cms_faq_categories (id) on delete restrict,
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create index cms_faqs_category_order_idx on public.cms_faqs (category_id, sort_order);

create table public.cms_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  -- Medical articles go live only with a named clinical reviewer
  -- (placeholders shown in preview builds are exempt).
  constraint cms_articles_reviewed check (
    published is null
    or coalesce((published ->> 'isPlaceholder')::boolean, false)
    or coalesce(jsonb_typeof(published -> 'reviewedBy') = 'object', false)
  )
);

create table public.cms_career_milestones (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create table public.cms_certificates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order integer not null default 0,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- Names of all content tables (used by the generic functions below).
create function public.cms_content_tables()
returns text[]
language sql immutable
as $$
  select array[
    'cms_documents', 'cms_service_groups', 'cms_services', 'cms_videos', 'cms_reviews',
    'cms_faq_categories', 'cms_faqs', 'cms_articles', 'cms_career_milestones', 'cms_certificates'
  ]
$$;

-- -----------------------------------------------------------------------------
-- 3. Media library
-- -----------------------------------------------------------------------------

-- Uploaded files (in the `cms-media` bucket) and the photos bundled with the
-- website code (`bundled_src`, e.g. '/media/hero-doctor'), so both can be
-- picked from one library. Content stores `{ "assetId": "<id>", ... }`.
create table public.cms_media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  storage_path text unique
    check (storage_path ~ '^(images/[0-9a-f-]{36}\.(jpg|png|webp|avif)|videos/[0-9a-f-]{36}\.(mp4|webm))$'),
  thumb_path text unique check (thumb_path ~ '^thumbs/[0-9a-f-]{36}\.webp$'),
  bundled_src text unique check (bundled_src ~ '^/media/[a-z0-9-]+$'),
  mime_type text
    check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm')),
  size_bytes bigint check (size_bytes >= 0),
  width integer check (width > 0),
  height integer check (height > 0),
  duration_seconds numeric check (duration_seconds >= 0),
  original_name text check (char_length(original_name) <= 255),
  title text check (char_length(title) <= 200),
  -- Default alt text, copied into a field when the asset is picked
  alt jsonb not null default '{"en": "", "ar": ""}'::jsonb check (jsonb_typeof(alt) = 'object'),
  -- Maintained by `cms_refresh_media_visibility()`: true while published content uses the file
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint cms_media_one_source check ((storage_path is null) <> (bundled_src is null))
);

create index cms_media_created_idx on public.cms_media (created_at desc);
create index cms_media_kind_idx on public.cms_media (kind, created_at desc);

-- -----------------------------------------------------------------------------
-- 4. Revisions and site state
-- -----------------------------------------------------------------------------

-- Previous versions of content rows, written automatically on every change.
create table public.cms_revisions (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  record_label text,
  action text not null check (action in ('update', 'delete')),
  draft jsonb,
  published jsonb,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index cms_revisions_record_idx on public.cms_revisions (record_id, created_at desc);

-- When published content (or the order of published items) last changed.
-- The site build records this value, so the CMS can tell whether the live
-- site is behind the database.
create table public.cms_site_state (
  id smallint primary key default 1 check (id = 1),
  content_changed_at timestamptz not null default now()
);

insert into public.cms_site_state default values;

-- -----------------------------------------------------------------------------
-- 5. Triggers
-- -----------------------------------------------------------------------------

create function public.cms_touch()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create function public.cms_record_revision()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and old.draft is not distinct from new.draft
     and old.published is not distinct from new.published then
    return new;
  end if;

  insert into public.cms_revisions (table_name, record_id, record_label, action, draft, published, created_by)
  values (
    tg_table_name, old.id, coalesce(to_jsonb(old) ->> 'key', to_jsonb(old) ->> 'slug'),
    lower(tg_op), old.draft, old.published, auth.uid()
  );

  -- Keep the 30 most recent versions of each record
  delete from public.cms_revisions
  where record_id = old.id
    and id not in (
      select id from public.cms_revisions where record_id = old.id
      order by created_at desc, id desc limit 30
    );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create function public.cms_mark_site_changed()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  ignored text[] := array['draft', 'updated_at', 'updated_by', 'consent_confirmed', 'verification_note'];
  changed boolean;
begin
  if tg_op = 'INSERT' then
    changed := new.published is not null;
  elsif tg_op = 'DELETE' then
    changed := old.published is not null;
  else
    changed := old.published is distinct from new.published
      or (new.published is not null and (to_jsonb(old) - ignored) is distinct from (to_jsonb(new) - ignored));
  end if;

  if changed then
    update public.cms_site_state set content_changed_at = now() where id = 1;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array public.cms_content_tables() loop
    execute format('create trigger %I before update on public.%I for each row execute function public.cms_touch()',
      t || '_touch', t);
    execute format('create trigger %I after update or delete on public.%I for each row execute function public.cms_record_revision()',
      t || '_revision', t);
    execute format('create trigger %I after insert or update or delete on public.%I for each row execute function public.cms_mark_site_changed()',
      t || '_site_changed', t);
  end loop;
end;
$$;

create trigger cms_media_touch before update on public.cms_media
  for each row execute function public.cms_touch();

create trigger cms_profiles_touch before update on public.cms_profiles
  for each row execute function public.cms_touch();

-- -----------------------------------------------------------------------------
-- 6. Media references and visibility
-- -----------------------------------------------------------------------------

-- Ids of the media assets used by published content.
create function public.cms_published_asset_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select distinct (ref #>> '{}')::uuid
  from (
              select published from public.cms_documents where published is not null
    union all select published from public.cms_service_groups where published is not null
    union all select published from public.cms_services where published is not null
    union all select published from public.cms_videos where published is not null
    union all select published from public.cms_reviews where published is not null
    union all select published from public.cms_faq_categories where published is not null
    union all select published from public.cms_faqs where published is not null
    union all select published from public.cms_articles where published is not null
    union all select published from public.cms_career_milestones where published is not null
    union all select published from public.cms_certificates where published is not null
  ) content,
  lateral jsonb_path_query(content.published, 'lax $.**.assetId') ref
  where jsonb_typeof(ref) = 'string'
    and (ref #>> '{}') ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
$$;

create function public.cms_refresh_media_visibility()
returns void
language sql security definer set search_path = ''
as $$
  with used as (select public.cms_published_asset_ids() as id)
  update public.cms_media m
  set is_public = exists (select 1 from used where used.id = m.id)
  where m.is_public is distinct from exists (select 1 from used where used.id = m.id);
$$;

-- Where an asset is used (drafts and published content). Runs with the
-- caller's rights, so it only sees what the caller may see.
create function public.cms_media_usage(p_asset uuid)
returns table (table_name text, record_id uuid, label text, in_draft boolean, in_published boolean)
language sql stable security invoker set search_path = ''
as $$
  with rows as (
              select 'cms_documents' as table_name, id, key as label, draft, published from public.cms_documents
    union all select 'cms_service_groups', id, slug, draft, published from public.cms_service_groups
    union all select 'cms_services', id, slug, draft, published from public.cms_services
    union all select 'cms_videos', id, slug, draft, published from public.cms_videos
    union all select 'cms_reviews', id, slug, draft, published from public.cms_reviews
    union all select 'cms_faq_categories', id, slug, draft, published from public.cms_faq_categories
    union all select 'cms_faqs', id, slug, draft, published from public.cms_faqs
    union all select 'cms_articles', id, slug, draft, published from public.cms_articles
    union all select 'cms_career_milestones', id, slug, draft, published from public.cms_career_milestones
    union all select 'cms_certificates', id, slug, draft, published from public.cms_certificates
  ),
  matches as (
    select r.table_name, r.id, r.label,
      jsonb_path_exists(r.draft, 'lax $.** ? (@.assetId == $id)', jsonb_build_object('id', p_asset::text), true) as in_draft,
      coalesce(jsonb_path_exists(r.published, 'lax $.** ? (@.assetId == $id)', jsonb_build_object('id', p_asset::text), true), false) as in_published
    from rows r
  )
  select table_name, id, label, in_draft, in_published
  from matches
  where in_draft or in_published
  order by table_name, label
$$;

-- Files used by published content cannot be deleted.
create function public.cms_guard_media_delete()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if exists (select 1 from public.cms_published_asset_ids() as used(id) where used.id = old.id) then
    raise exception 'This file is used by published content. Replace or unpublish it there first.'
      using errcode = '23503';
  end if;
  return old;
end;
$$;

create trigger cms_media_guard_delete before delete on public.cms_media
  for each row execute function public.cms_guard_media_delete();

-- -----------------------------------------------------------------------------
-- 7. Publishing
-- -----------------------------------------------------------------------------

-- These run with the caller's rights, so Row Level Security decides who may
-- publish what (see the policies below).

create function public.cms_publish(p_table text, p_id uuid)
returns timestamptz
language plpgsql security invoker set search_path = ''
as $$
declare
  affected integer;
  stamp timestamptz := now();
begin
  if not (p_table = any (public.cms_content_tables())) then
    raise exception 'Unknown content table %', p_table using errcode = '22023';
  end if;
  execute format(
    'update public.%I set published = draft, published_at = $2, published_by = auth.uid() where id = $1', p_table
  ) using p_id, stamp;
  get diagnostics affected = row_count;
  if affected = 0 then
    raise exception 'Not found, or you may not publish it.' using errcode = '42501';
  end if;
  perform public.cms_refresh_media_visibility();
  return stamp;
end;
$$;

create function public.cms_unpublish(p_table text, p_id uuid)
returns void
language plpgsql security invoker set search_path = ''
as $$
declare
  affected integer;
begin
  if not (p_table = any (public.cms_content_tables())) then
    raise exception 'Unknown content table %', p_table using errcode = '22023';
  end if;
  execute format(
    'update public.%I set published = null, published_at = null, published_by = null where id = $1', p_table
  ) using p_id;
  get diagnostics affected = row_count;
  if affected = 0 then
    raise exception 'Not found, or you may not unpublish it.' using errcode = '42501';
  end if;
  perform public.cms_refresh_media_visibility();
end;
$$;

-- Sets the display / importance order of catalog rows from an ordered id list.
create function public.cms_reorder(p_table text, p_ids uuid[])
returns void
language plpgsql security invoker set search_path = ''
as $$
begin
  if not (p_table = any (public.cms_content_tables())) or p_table = 'cms_documents' then
    raise exception 'Unknown catalog table %', p_table using errcode = '22023';
  end if;
  execute format(
    'update public.%I as t set sort_order = x.position from unnest($1) with ordinality as x(id, position) where t.id = x.id',
    p_table
  ) using p_ids;
end;
$$;

-- Status of every content row, for the dashboard and the publishing screen:
-- 'draft' (never published), 'changed' (published, with unpublished edits) or
-- 'published'. Runs with the caller's rights.
create function public.cms_content_status()
returns table (table_name text, record_id uuid, label text, status text, updated_at timestamptz, published_at timestamptz)
language sql stable security invoker set search_path = ''
as $$
  select r.table_name, r.id, r.label,
    case
      when r.published is null then 'draft'
      when r.draft is distinct from r.published then 'changed'
      else 'published'
    end,
    r.updated_at, r.published_at
  from (
              select 'cms_documents' as table_name, id, key as label, draft, published, updated_at, published_at from public.cms_documents
    union all select 'cms_service_groups', id, slug, draft, published, updated_at, published_at from public.cms_service_groups
    union all select 'cms_services', id, slug, draft, published, updated_at, published_at from public.cms_services
    union all select 'cms_videos', id, slug, draft, published, updated_at, published_at from public.cms_videos
    union all select 'cms_reviews', id, slug, draft, published, updated_at, published_at from public.cms_reviews
    union all select 'cms_faq_categories', id, slug, draft, published, updated_at, published_at from public.cms_faq_categories
    union all select 'cms_faqs', id, slug, draft, published, updated_at, published_at from public.cms_faqs
    union all select 'cms_articles', id, slug, draft, published, updated_at, published_at from public.cms_articles
    union all select 'cms_career_milestones', id, slug, draft, published, updated_at, published_at from public.cms_career_milestones
    union all select 'cms_certificates', id, slug, draft, published, updated_at, published_at from public.cms_certificates
  ) r
  order by r.updated_at desc
$$;

-- Everything the static site build needs, published content only.
-- Callable without signing in (the build uses the publishable key).
create function public.cms_published_site()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'initialized', exists (select 1 from public.cms_documents),
    'version', (select content_changed_at from public.cms_site_state where id = 1),
    'documents', coalesce(
      (select jsonb_object_agg(d.key, d.published) from public.cms_documents d where d.published is not null),
      '{}'::jsonb),
    'serviceGroups', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', g.slug, 'content', g.published) order by g.sort_order, g.slug)
       from public.cms_service_groups g where g.published is not null),
      '[]'::jsonb),
    'services', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', s.slug, 'group', g.slug, 'content', s.published)
                        order by g.sort_order, s.sort_order, s.slug)
       from public.cms_services s join public.cms_service_groups g on g.id = s.group_id
       where s.published is not null and g.published is not null),
      '[]'::jsonb),
    'videos', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', v.slug, 'content', v.published) order by v.sort_order, v.slug)
       from public.cms_videos v where v.published is not null),
      '[]'::jsonb),
    'reviews', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', r.slug, 'content', r.published) order by r.sort_order, r.slug)
       from public.cms_reviews r where r.published is not null),
      '[]'::jsonb),
    'faqCategories', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', c.slug, 'content', c.published) order by c.sort_order, c.slug)
       from public.cms_faq_categories c where c.published is not null),
      '[]'::jsonb),
    'faqs', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', f.slug, 'category', c.slug, 'content', f.published)
                        order by c.sort_order, f.sort_order, f.slug)
       from public.cms_faqs f join public.cms_faq_categories c on c.id = f.category_id
       where f.published is not null and c.published is not null),
      '[]'::jsonb),
    'articles', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', a.slug, 'content', a.published) order by a.sort_order, a.slug)
       from public.cms_articles a where a.published is not null),
      '[]'::jsonb),
    'careerMilestones', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', m.slug, 'content', m.published) order by m.sort_order, m.slug)
       from public.cms_career_milestones m where m.published is not null),
      '[]'::jsonb),
    'certificates', coalesce(
      (select jsonb_agg(jsonb_build_object('slug', c.slug, 'content', c.published) order by c.sort_order, c.slug)
       from public.cms_certificates c where c.published is not null),
      '[]'::jsonb),
    'media', coalesce(
      (select jsonb_agg(jsonb_build_object(
                'id', m.id, 'kind', m.kind, 'path', m.storage_path, 'mime', m.mime_type,
                'width', m.width, 'height', m.height) order by m.created_at)
       from public.cms_media m where m.is_public and m.storage_path is not null),
      '[]'::jsonb)
  )
$$;

-- -----------------------------------------------------------------------------
-- 8. Team management (no service-role key needed in the browser)
-- -----------------------------------------------------------------------------

-- Members with their sign-in email; administrators only.
create function public.cms_team()
returns table (user_id uuid, email text, role public.cms_role, display_name text, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select p.user_id, u.email::text, p.role, p.display_name, p.created_at
  from public.cms_profiles p
  join auth.users u on u.id = p.user_id
  where public.cms_is_admin()
  order by p.created_at
$$;

-- Gives an existing account (invited from the Supabase dashboard) a CMS role.
create function public.cms_set_role(p_email text, p_role public.cms_role)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  member uuid;
begin
  if not public.cms_is_admin() then
    raise exception 'Only administrators can manage the team.' using errcode = '42501';
  end if;
  select id into member from auth.users where lower(email) = lower(trim(p_email));
  if member is null then
    raise exception 'No account exists for this email. Invite the person from the Supabase dashboard first.'
      using errcode = 'P0002';
  end if;
  insert into public.cms_profiles (user_id, role) values (member, p_role)
  on conflict (user_id) do update set role = excluded.role;
end;
$$;

create function public.cms_remove_member(p_user uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.cms_is_admin() then
    raise exception 'Only administrators can manage the team.' using errcode = '42501';
  end if;
  delete from public.cms_profiles where user_id = p_user;
end;
$$;

-- First administrator. Run once in the SQL editor:
--   select public.cms_bootstrap_admin('you@example.com');
-- Not callable through the API.
create function public.cms_bootstrap_admin(p_email text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  member uuid;
begin
  if exists (select 1 from public.cms_profiles where role = 'admin') then
    raise exception 'An administrator already exists. Manage roles from the CMS Team page.';
  end if;
  select id into member from auth.users where lower(email) = lower(trim(p_email));
  if member is null then
    raise exception 'No account exists for %. Create or invite the user under Authentication first.', p_email;
  end if;
  insert into public.cms_profiles (user_id, role) values (member, 'admin')
  on conflict (user_id) do update set role = 'admin';
end;
$$;

-- -----------------------------------------------------------------------------
-- 9. Row Level Security
-- -----------------------------------------------------------------------------

alter table public.cms_profiles enable row level security;

create policy "Members read their own profile; admins read all"
  on public.cms_profiles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.cms_is_admin()));

create policy "Admins manage profiles"
  on public.cms_profiles for all to authenticated
  using ((select public.cms_is_admin()))
  with check ((select public.cms_is_admin()));

-- Documents: editors edit page content; 'settings.*' is admin-only.
alter table public.cms_documents enable row level security;

create policy "Members read documents"
  on public.cms_documents for select to authenticated
  using ((select public.cms_is_editor()));

create policy "Members create documents"
  on public.cms_documents for insert to authenticated
  with check ((select public.cms_is_admin()) or ((select public.cms_is_editor()) and key not like 'settings.%'));

create policy "Members update documents"
  on public.cms_documents for update to authenticated
  using ((select public.cms_is_admin()) or ((select public.cms_is_editor()) and key not like 'settings.%'))
  with check ((select public.cms_is_admin()) or ((select public.cms_is_editor()) and key not like 'settings.%'));

create policy "Admins delete documents"
  on public.cms_documents for delete to authenticated
  using ((select public.cms_is_admin()));

-- Catalogs: editors create, edit, publish and reorder; admins delete.
do $$
declare
  t text;
begin
  foreach t in array array[
    'cms_service_groups', 'cms_services', 'cms_videos', 'cms_reviews', 'cms_faq_categories',
    'cms_faqs', 'cms_articles', 'cms_career_milestones', 'cms_certificates'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to authenticated using ((select public.cms_is_editor()))',
      'Members read ' || t, t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.cms_is_editor()))',
      'Members create ' || t, t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.cms_is_editor())) with check ((select public.cms_is_editor()))',
      'Members update ' || t, t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.cms_is_admin()))',
      'Admins delete ' || t, t);
  end loop;
end;
$$;

alter table public.cms_media enable row level security;

create policy "Members read media" on public.cms_media for select to authenticated
  using ((select public.cms_is_editor()));
create policy "Members add media" on public.cms_media for insert to authenticated
  with check ((select public.cms_is_editor()));
create policy "Members edit media" on public.cms_media for update to authenticated
  using ((select public.cms_is_editor())) with check ((select public.cms_is_editor()));
create policy "Admins delete media" on public.cms_media for delete to authenticated
  using ((select public.cms_is_admin()));

-- Revisions are written by trigger only.
alter table public.cms_revisions enable row level security;

create policy "Members read revisions" on public.cms_revisions for select to authenticated
  using ((select public.cms_is_editor()));

alter table public.cms_site_state enable row level security;

create policy "Members read site state" on public.cms_site_state for select to authenticated
  using ((select public.cms_is_editor()));

-- Visitors use `cms_published_site()` only: no direct table access.
do $$
declare
  t text;
begin
  foreach t in array public.cms_content_tables() || array['cms_profiles', 'cms_media', 'cms_revisions', 'cms_site_state'] loop
    execute format('revoke all on table public.%I from anon', t);
  end loop;
end;
$$;

-- Signed-in users reach the tables only through the policies above. Granted
-- explicitly because newer projects may not grant new tables to the API roles.
grant usage on schema public to authenticated;
do $$
declare
  t text;
begin
  foreach t in array public.cms_content_tables() || array['cms_media', 'cms_profiles'] loop
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
  end loop;
end;
$$;
grant select on table public.cms_revisions, public.cms_site_state to authenticated;

-- -----------------------------------------------------------------------------
-- 10. Storage: private bucket for uploads
-- -----------------------------------------------------------------------------

-- Server-side limits (the CMS also validates before uploading). The file size
-- limit cannot exceed the project's global limit (50 MB on the Free plan).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media', 'cms-media', false, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- True while published content uses the file (or its thumbnail).
create function public.cms_storage_object_is_public(p_name text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.cms_media m
    where m.is_public and (m.storage_path = p_name or m.thumb_path = p_name)
  )
$$;

create policy "CMS: published media is readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'cms-media' and public.cms_storage_object_is_public(name));

create policy "CMS: members read all media"
  on storage.objects for select to authenticated
  using (bucket_id = 'cms-media' and (select public.cms_is_editor()));

-- Uploads use generated names only (no user-provided paths).
create policy "CMS: members upload media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'cms-media'
    and (select public.cms_is_editor())
    and name ~ '^(images/[0-9a-f-]{36}\.(jpg|png|webp|avif)|videos/[0-9a-f-]{36}\.(mp4|webm)|thumbs/[0-9a-f-]{36}\.webp)$'
  );

create policy "CMS: admins delete media files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cms-media' and (select public.cms_is_admin()));

-- -----------------------------------------------------------------------------
-- 11. Function permissions
-- -----------------------------------------------------------------------------

-- Functions are executable by PUBLIC by default; grant only what each role needs.
revoke execute on function
  public.cms_current_role(), public.cms_is_editor(), public.cms_is_admin(),
  public.cms_content_tables(), public.cms_published_asset_ids(), public.cms_refresh_media_visibility(),
  public.cms_media_usage(uuid), public.cms_publish(text, uuid), public.cms_unpublish(text, uuid),
  public.cms_reorder(text, uuid[]), public.cms_content_status(), public.cms_published_site(), public.cms_team(),
  public.cms_set_role(text, public.cms_role), public.cms_remove_member(uuid),
  public.cms_bootstrap_admin(text), public.cms_storage_object_is_public(text),
  public.cms_touch(), public.cms_record_revision(), public.cms_mark_site_changed(),
  public.cms_guard_media_delete(), public.cms_keep_an_admin()
from public, anon, authenticated;

-- Signed-in members (each function still checks the caller's role).
grant execute on function
  public.cms_current_role(), public.cms_is_editor(), public.cms_is_admin(),
  public.cms_content_tables(), public.cms_refresh_media_visibility(),
  public.cms_media_usage(uuid), public.cms_publish(text, uuid), public.cms_unpublish(text, uuid),
  public.cms_reorder(text, uuid[]), public.cms_content_status(), public.cms_team(),
  public.cms_set_role(text, public.cms_role), public.cms_remove_member(uuid)
to authenticated;

-- The site build (publishable key) and the storage read policy.
grant execute on function public.cms_published_site(), public.cms_storage_object_is_public(text)
to anon, authenticated;

-- `cms_bootstrap_admin` stays without grants: only the SQL editor (postgres) can run it.
