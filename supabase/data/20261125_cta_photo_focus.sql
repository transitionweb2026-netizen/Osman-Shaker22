-- =============================================================================
-- RUN ONLY IN DR. OTHMAN SHAKER'S PROJECT:
--   https://supabase.com/dashboard/project/pbzdlhuhilmotmdnyzfk/sql/new
--
-- "Start your journey" card (shared.cta): moves the photo's focal point up so
-- the doctor's head stays inside the card on computers. The old value (40% 35%)
-- belonged to the template photo it replaced. The focal point stays editable in
-- the CMS (click on the photo). Safe to run again.
-- =============================================================================

begin;

-- Safety check: Dr. Othman Shaker's project only (other CMS projects share these tables)
do $$
begin
  if not exists (select 1 from public.cms_service_groups where slug = 'medical-specialties')
     or not exists (select 1 from public.cms_service_groups where slug = 'consultation-care') then
    raise exception 'Wrong project: this file is for Dr. Othman Shaker''s website (Supabase project pbzdlhuhilmotmdnyzfk). Nothing was changed.';
  end if;
end $$;

update public.cms_documents
set draft = jsonb_set(draft, '{image,position}', '"50% 15%"', true),
    published = case when published ? 'image'
                     then jsonb_set(published, '{image,position}', '"50% 15%"', true)
                     else published end
where key = 'shared.cta'
  and draft ? 'image';

commit;

-- Expected: 50% 15%
select published #>> '{image,position}' as cta_photo_focus
from public.cms_documents
where key = 'shared.cta';
