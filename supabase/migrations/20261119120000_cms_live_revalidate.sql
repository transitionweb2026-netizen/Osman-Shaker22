-- =============================================================================
-- Live website: every publish in the CMS shows on the website within seconds.
--
-- The website runs as a Next.js server: it reads published content when it
-- renders a page and caches the result (lib/cms/published.ts). Whenever
-- published content changes (`cms_site_state.content_changed_at`, see
-- cms_mark_site_changed), this trigger calls the site's
-- POST /api/revalidate/ endpoint (app/api/revalidate/route.ts), which expires
-- that cache, so the next visit renders the new content.
--
-- Replaces the GitHub "Publish website" build request of
-- 20261118120000_cms_auto_publish.sql (static export, no longer used): the
-- Vault secrets github_dispatch_token / github_dispatch_repo are not read any more.
--
-- Settings, in Supabase Vault (Integrations → Vault → Secrets):
--   site_revalidate_url     https://<website domain>/api/revalidate/   (with the final slash)
--   site_revalidate_secret  the same value as CMS_REVALIDATE_SECRET on the website server
-- Until both exist the trigger does nothing; the website then still picks up
-- published changes within about a minute. A failed request never blocks publishing.
-- Safe to run more than once.
-- =============================================================================

create extension if not exists pg_net with schema extensions;

create or replace function public.cms_request_site_build()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  site_url text;
  site_secret text;
begin
  select decrypted_secret into site_url from vault.decrypted_secrets where name = 'site_revalidate_url' limit 1;
  select decrypted_secret into site_secret from vault.decrypted_secrets where name = 'site_revalidate_secret' limit 1;
  -- Pasted values may carry spaces or line breaks
  site_url := btrim(coalesce(site_url, ''), E' \t\r\n');
  site_secret := btrim(coalesce(site_secret, ''), E' \t\r\n');
  if site_url = '' or site_secret = '' then
    return null;
  end if;

  -- pg_net queues the request and sends it after the transaction commits.
  perform net.http_post(
    url := site_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'User-Agent', 'cms-live-revalidate',
      'x-cms-secret', site_secret
    ),
    body := jsonb_build_object('version', new.content_changed_at),
    timeout_milliseconds := 15000
  );
  return null;
exception when others then
  raise warning 'cms live revalidate: the request could not be queued (%)', sqlerrm;
  return null;
end;
$$;

revoke all on function public.cms_request_site_build() from public, anon, authenticated;

drop trigger if exists cms_request_site_build on public.cms_site_state;
create trigger cms_request_site_build
after update of content_changed_at on public.cms_site_state
for each row
when (old.content_changed_at is distinct from new.content_changed_at)
execute function public.cms_request_site_build();

-- Whether the live refresh is configured, and the website's latest answers
-- (200 = refreshed, 401 = the two secrets differ, 503 = CMS_REVALIDATE_SECRET missing
-- on the website). Run it in the SQL editor; not exposed to the website or the CMS.
create or replace function public.cms_auto_publish_status()
returns table (configured boolean, requested_at timestamptz, status_code integer, error text)
language sql security definer set search_path = ''
as $$
  with settings as (
    select count(*) filter (where name in ('site_revalidate_url', 'site_revalidate_secret')) = 2 as configured
    from vault.decrypted_secrets
  )
  select s.configured, r.created, r.status_code, coalesce(r.error_msg, left(r.content, 200))
  from settings s
  left join lateral (
    select created, status_code, error_msg, content
    from net._http_response
    order by created desc
    limit 5
  ) r on true;
$$;

revoke all on function public.cms_auto_publish_status() from public, anon, authenticated;
