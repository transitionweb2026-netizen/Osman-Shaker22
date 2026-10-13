# Connecting the CMS to Supabase — setup checklist

The CMS (`/admin/`) runs as a **local demo** until these steps are done: edits
then stay in the browser and never reach the website. Follow the steps in
order; none of them needs a secret key in this project.

How the CMS works once connected: [docs/CMS.md](CMS.md).

## What you need

| Item | Where to find it | Where it goes |
| --- | --- | --- |
| Project URL | Supabase dashboard → Project Settings → API (or **Connect**) | `NEXT_PUBLIC_SUPABASE_URL` |
| Publishable key (`sb_publishable_…`; older projects: the **anon** key) | Project Settings → API keys | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| The administrator's email address | — | step 4 |

**Never** use the secret / `service_role` key anywhere in this project. Every
`NEXT_PUBLIC_` variable is embedded in the website. The build, `cms:sync` and
the CMS itself refuse a secret key if one is configured by mistake. If that
happens, rotate the key in the dashboard.

## 1. Create the project

Create a Supabase project, preferably in a region close to Egypt (e.g. Frankfurt,
`eu-central-1`). Keep the database password in a password manager: this project
does not need it.

## 2. Apply the migration

`supabase/migrations/20261012120000_cms_foundation.sql` creates:
- the tables, Row Level Security policies and roles;
- the private `cms-media` storage bucket and its policies;
- the database functions used for publishing.

It only creates new objects, all prefixed `cms_`. It does not modify or drop anything that already exists.

Either:

- **SQL editor**: open SQL Editor → New query, paste the whole file and run it once; or
- **Supabase CLI**: `supabase link --project-ref <ref>`, then `supabase db push`.

Check afterwards: Table Editor shows the `cms_*` tables, and Storage shows the
bucket `cms-media` marked **private**.

If the migration was applied outside the CLI (SQL editor or a direct
connection) and you start using the CLI later, record it first so the CLI does
not try to apply it again:
`supabase migration repair --status applied 20261012120000`.

## 3. Lock down sign-ups and set the redirect URLs

Authentication → Sign In / Providers:

- **Allow new users to sign up: off.** Nobody can create an account from the
  website; people are invited (step 4). A user without a CMS role gets no
  access even if an account exists.
- Email provider: on (password sign-in).

Authentication → URL Configuration:

- **Site URL**: `https://your-domain/admin/login/`. Dashboard invitations always
  return to the Site URL, and the website itself does not use Supabase sign-in,
  so the CMS sign-in page is the right target. (Local tests:
  `http://localhost:3000/admin/login/`.)
- **Redirect URLs**: add `https://your-domain/admin/login/` (plus
  `http://localhost:3000/admin/login/` and `http://localhost:4173/admin/login/`
  for local tests). Password-reset links from the sign-in page return there.

## 4. Create the first administrator

1. Authentication → Users → **Invite user** with the administrator's email. They
   open the email, land on `/admin/login/` and choose a password.
2. SQL Editor → run (with their email):

   ```sql
   select public.cms_bootstrap_admin('admin@example.org');
   ```

   This works only while no administrator exists, and only from the SQL editor:
   the function cannot be called through the API.

Further people: invite them the same way, then give them a role from the CMS
(**Team** page, administrators only). Roles:

- **Editor**: edits, publishes and uploads content.
- **Administrator**: can also change the site settings (contact numbers, navigation, footer), delete content and manage the team.

## 5. Configure this project

Copy `.env.example` to `.env.local` (development) and `.env.production` (the
build that is uploaded), and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Rebuild (`npm run build`). `/admin/` now shows the sign-in page instead of the
demo banner.

## 6. Import the current website content

Sign in as the administrator. The dashboard offers **Import website content**:
it copies everything currently on the site into the database (and lists the
bundled photos in the media library). Keep **Mark the imported content as
published** ticked so the database matches the live site. Running it again only
fills in what is missing; it never overwrites edits.

## 7. Publish changes to the live site

After editing and publishing in the CMS:

```bash
npm run cms:sync   # pulls published content and media (publishable key only)
npm run build      # static export with that content
```

Upload the contents of `out/` to `public_html/` as before. **Publishing** in the
CMS shows whether the live site already contains the latest published change.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `/admin/` still shows "Local demo" | The variables are missing in the env file used by the build, or the build was not re-run. |
| "The configured key is a secret (service-role) key" | Replace it with the publishable key, and rotate the secret key. |
| "Your account has no CMS role yet" | Step 4 not done for this user (or their role was removed). |
| Invitation link opens the website, not `/admin/login/` | The Site URL (step 3) is not the `/admin/login/` address. |
| Password-reset link is rejected | `/admin/login/` on that domain is missing from Redirect URLs (step 3). |
| `cms:sync`: "Was the migration applied?" | Step 2 not done, or the URL points to another project. |
| An editor cannot change settings or delete | That is intended: only administrators can. The database enforces it. |
