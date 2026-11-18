-- =============================================================================
-- Auto-publish: rebuild the website whenever published content changes.
--
-- `cms_site_state.content_changed_at` moves on every publish, unpublish or
-- reorder of published content (see cms_mark_site_changed). This trigger then
-- asks GitHub to run the "Publish website" workflow (.github/workflows/
-- publish-website.yml), which builds the site with the published content and
-- uploads it to Hostinger.
--
-- The GitHub token and repository are read from Supabase Vault, never stored
-- in this file. Until both secrets exist the trigger does nothing:
--
--   select vault.create_secret('<fine-grained token>', 'github_dispatch_token');
--   select vault.create_secret('<owner>/<repository>', 'github_dispatch_repo');
--
-- The token needs access to that one repository only, with
-- "Contents: Read and write" (required by GitHub's repository_dispatch API).
-- A failed request never blocks publishing: it is logged as a warning, and the
-- next publish (or Actions → Publish website → Run workflow) catches up.
-- =============================================================================

-- pg_net's functions live in the `net` schema wherever the extension is registered.
create extension if not exists pg_net with schema extensions;

create or replace function public.cms_request_site_build()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  token text;
  repo text;
begin
  select decrypted_secret into token from vault.decrypted_secrets where name = 'github_dispatch_token' limit 1;
  select decrypted_secret into repo from vault.decrypted_secrets where name = 'github_dispatch_repo' limit 1;
  if coalesce(trim(token), '') = '' or coalesce(trim(repo), '') = '' then
    return null;
  end if;

  -- pg_net queues the request and sends it after the transaction commits.
  perform net.http_post(
    url := 'https://api.github.com/repos/' || trim(repo) || '/dispatches',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || trim(token),
      'Accept', 'application/vnd.github+json',
      'X-GitHub-Api-Version', '2022-11-28',
      'User-Agent', 'cms-auto-publish',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'event_type', 'cms-publish',
      'client_payload', jsonb_build_object('version', new.content_changed_at)
    )
  );
  return null;
exception when others then
  raise warning 'cms auto-publish: the build request could not be queued (%)', sqlerrm;
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

-- Shows whether auto-publish is configured and the latest build requests GitHub answered
-- (status 204 = accepted). Run it in the SQL editor; not exposed to the website or the CMS.
create or replace function public.cms_auto_publish_status()
returns table (configured boolean, requested_at timestamptz, status_code integer, error text)
language sql security definer set search_path = ''
as $$
  with settings as (
    select count(*) filter (where name in ('github_dispatch_token', 'github_dispatch_repo')) = 2 as configured
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
