-- =============================================================================
-- Content updates of 2026-11-25. RUN ONLY IN DR. OTHMAN SHAKER'S PROJECT:
--   https://supabase.com/dashboard/project/pbzdlhuhilmotmdnyzfk/sql/new
--
--  1. Removes service groups 7–9 (Esophagus & stomach, Endocrine glands,
--     Surgical oncology) and their 10 services.
--  2. Keeps 9 FAQs (the 7 shown on the homepage + 2) and removes the other 12.
--  3. Centres every page hero photo on phones.
--  4. Clinic details: main phone / WhatsApp, address, map, booking numbers,
--     hours and fee (contact page and footer).
--  5. Facebook profile; Instagram and YouTube hidden until their links exist.
--  6. Homepage "Featured treatments": removes the Hemorrhoids card (4 cards).
--
-- Everything happens in one transaction: if any check fails, nothing changes.
-- Safe to run again. Deleted entries stay in the CMS revision history.
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

-- 1. Service groups 7–9 and their services ------------------------------------------------
do $$
declare
  removed_groups text[] := array['upper-gi-surgery', 'endocrine-surgery', 'surgical-oncology'];
  known_services text[] := array['hiatal-hernia-reflux', 'stomach-tumors', 'peptic-ulcer-complications',
                                 'thyroid-surgery', 'parathyroid-surgery', 'adrenal-surgery',
                                 'breast-tumor-surgery', 'soft-tissue-tumors', 'lymph-node-biopsy', 'chemotherapy-port'];
begin
  -- Never delete a service added to these groups since they were created
  if exists (
    select 1 from public.cms_services s
    join public.cms_service_groups g on g.id = s.group_id
    where g.slug = any (removed_groups) and s.slug <> all (known_services)
  ) then
    raise exception 'A service group to remove contains services added later. Nothing was changed.';
  end if;

  delete from public.cms_services
  where group_id in (select id from public.cms_service_groups where slug = any (removed_groups));
  delete from public.cms_service_groups where slug = any (removed_groups);
end $$;

-- 2. FAQs: keep booking, bring, companion, prepare-questions, reports-in-advance,
--    second-opinion, plan, side-effects, advice ------------------------------------------
delete from public.cms_faqs
where slug = any (array['second-opinion-records', 'staging', 'more-tests', 'same-treatment', 'supplements',
                        'daily-life', 'after-treatment', 'between-visits', 'emotional-support',
                        'family-questions', 'reviews-policy', 'contact-form']);

-- 3. Hero photos centred on phones (the CMS can still set another focal point per page) ---
update public.cms_documents
set draft = jsonb_set(draft, '{image,positionMobile}', '"50% 50%"', true),
    published = case when published ? 'image'
                     then jsonb_set(published, '{image,positionMobile}', '"50% 50%"', true)
                     else published end
where key in ('home.hero', 'about.hero', 'services.hero', 'videos.hero', 'reviews.hero', 'articles.hero', 'contact.hero')
  and draft ? 'image';

-- 4. Clinic details -----------------------------------------------------------------------------
update public.cms_documents
set draft = draft || c.patch,
    published = coalesce(published, draft) || c.patch,
    published_at = now()
from (select $cms${
  "phone": {"e164": "+201558884480", "display": "01558884480"},
  "whatsapp": {"e164": "+201558884480", "display": "01558884480"},
  "clinic": {
    "title": {"en": "Visit the clinic", "ar": "نورونا في العيادة"},
    "addressLabel": {"en": "Address", "ar": "العنوان"},
    "address": {
      "en": "86 Ahmed El-Zomor St., Zaker Hussein extension, opposite Al-Nahar Al-Wafaa Wal-Amal Hospital, above Sahm Electronics, Nasr City, Cairo",
      "ar": "86 شارع أحمد الزمر، امتداد ذاكر حسين، أمام مستشفى النهار الوفاء والأمل، أعلى سهم للأجهزة الإلكترونية، مدينة نصر، القاهرة"
    },
    "mapUrl": "https://maps.app.goo.gl/oxncb71FgKVTt1fc9",
    "mapLabel": {"en": "Open in Google Maps", "ar": "افتح الموقع على الخريطة"},
    "phonesLabel": {"en": "To book, call", "ar": "للحجز كلمونا على"},
    "phones": [
      {"e164": "+20222733017", "display": "22733017"},
      {"e164": "+2026708818", "display": "026708818"},
      {"e164": "+201092374994", "display": "01092374994"},
      {"e164": "+201558884480", "display": "01558884480"},
      {"e164": "+201555694335", "display": "01555694335"}
    ],
    "hoursLabel": {"en": "Hours", "ar": "المواعيد"},
    "hours": {"en": "Every day except Friday, 7 pm to 10 pm", "ar": "جميع أيام الأسبوع من 7 م إلى 10 م، ماعدا الجمعة"},
    "feeLabel": {"en": "Consultation fee", "ar": "سعر الكشف"},
    "fee": {"en": "500 EGP", "ar": "500 جنيه"}
  }
}$cms$::jsonb as patch) as c
where key = 'settings.contact';

-- 5. Social profiles ------------------------------------------------------------------------------
update public.cms_documents
set draft = jsonb_set(draft, '{items}', s.items, true),
    published = jsonb_set(coalesce(published, draft), '{items}', s.items, true),
    published_at = now()
from (select $cms$[
  {"platform": "facebook", "label": {"en": "Facebook", "ar": "فيسبوك"}, "url": "https://www.facebook.com/osmanshaker83"},
  {"platform": "instagram", "label": {"en": "Instagram", "ar": "إنستغرام"}, "url": ""},
  {"platform": "youtube", "label": {"en": "YouTube", "ar": "يوتيوب"}, "url": ""}
]$cms$::jsonb as items) as s
where key = 'settings.socials';

-- 6. Homepage featured treatments without "Hemorrhoids" (laparoscopic-cholecystectomy) ------------
update public.cms_documents
set draft = jsonb_set(draft, '{serviceIds}',
      coalesce((select jsonb_agg(e.id order by e.n)
                from jsonb_array_elements(draft -> 'serviceIds') with ordinality as e(id, n)
                where e.id <> '"laparoscopic-cholecystectomy"'::jsonb), '[]'::jsonb)),
    published = case when published is null then null else jsonb_set(published, '{serviceIds}',
      coalesce((select jsonb_agg(e.id order by e.n)
                from jsonb_array_elements(published -> 'serviceIds') with ordinality as e(id, n)
                where e.id <> '"laparoscopic-cholecystectomy"'::jsonb), '[]'::jsonb)) end
where key = 'home.treatments';

commit;

-- Expected: 6 service groups, 9 FAQs, 4 featured treatments, 5 clinic numbers
select (select count(*) from public.cms_service_groups) as service_groups,
       (select count(*) from public.cms_faqs) as faqs,
       (select jsonb_array_length(published -> 'serviceIds') from public.cms_documents where key = 'home.treatments') as featured_treatments,
       (select jsonb_array_length(published #> '{clinic,phones}') from public.cms_documents where key = 'settings.contact') as clinic_numbers;
