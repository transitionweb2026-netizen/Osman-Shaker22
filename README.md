# Dr. Othman Shaker — bilingual website

Static, bilingual (English / Arabic) website built with Next.js 16 (App Router)
and exported as plain HTML/CSS/JS for Hostinger. No Node.js server is needed in
production.

Pages (each in `/en/…` and `/ar/…`): Home, About the Doctor, Services, Videos,
Reviews & FAQs, Articles, Contact.

> **Not ready for publication yet.** All photos, statistics, contact details,
> social links, reviews, videos, certificates, career details, articles and
> service descriptions are placeholders or drafts. Run `npm run check:content`
> for the full list.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000 → /en/ or /ar/
npm run build        # static export into out/
npm run preview      # serves out/ like Hostinger does, http://localhost:4173
```

| Script | Purpose |
| --- | --- |
| `dev` / `build` | Next.js development server / static export to `out/` (after the placeholder check) |
| `preview` | Serves `out/` (directory URLs → `index.html`, unknown paths → `404.html`) |
| `lint`, `typecheck` | ESLint; route type generation + `tsc --noEmit` |
| `images` | Converts photos in `assets-src/` into responsive WebP files in `public/media/` |
| `og` | Regenerates social sharing images (`public/og/`) and the Apple touch icon |
| `check:content` | Lists every placeholder and missing launch setting (reads `.env*` files like the build); exits non-zero until clear |

## Project structure

```
app/
  [locale]/layout.tsx    root layout per language: lang/dir, fonts, header, footer, floating contact
  [locale]/page.tsx      homepage
  [locale]/about/ services/ videos/ reviews/ articles/ contact/   the other pages
  (entry)/page.tsx       "/" — redirects to the saved or browser language; bilingual chooser without JS
  global-not-found.tsx   bilingual 404 (exported as 404.html)
  globals.css            design tokens, liquid-glass material, base RTL-aware styles
  robots.ts, sitemap.ts, icon.svg, apple-icon.png
components/
  layout/                SiteHeader, LanguageSwitcher, SocialContactPanel, FloatingContact, SiteFooter, RevealObserver
  sections/              homepage sections, PageHero (internal pages) and one folder per page
                         (about/, services/, videos/, reviews/, articles/, contact/)
  cards/                 ServiceCard, ReviewCard, QuoteBlock
  dialog/                Dialog + DialogTrigger (native <dialog> popups)
  content/               ContentBlocks + DetailView (long-form content in popups)
  glass/                 GlassPanel + FlowingInk (the liquid-glass / ink material)
  media/                 MediaImage, VideoPlayer, VideoFrame, VideoCard, PortraitStack, StatCounter, FaqAccordion, TiltStage
  ui/                    Button / RouteButton, SectionHeading, Icon, BrandMark
content/                 ALL editable content (typed, bilingual) — see below
lib/                     i18n, routes registry, content access layer, SEO helper, fonts, helpers
assets-src/              original photos (inputs for `npm run images`)
docs/CMS.md              the CMS at /admin/: editing, publishing, security
docs/SUPABASE.md         connecting the CMS: Supabase setup checklist
```

Only small parts ship JavaScript (header/menu, language switcher, popups, video
player, FAQ, certificate gallery, contact form, statistics counter, portrait
tilt, scroll reveal); everything else is static HTML. Popup content is part of
the static HTML too.

## Editing content

All visible text lives in `content/` and is typed by `content/types.ts`:

| File | Content |
| --- | --- |
| `site.ts` | name, contact details, social links, navigation, footer, shared CTA card, interface labels |
| `home.ts` | homepage sections |
| `about.ts` | About page: hero, quotes, career milestones, certificates |
| `services.ts` | **the services catalog** (groups, cards and popup details) |
| `videos.ts` | introduction video and the nine-video catalog |
| `reviews.ts` | Reviews & FAQs page and the patient reviews catalog |
| `faq.ts` | **the FAQ catalog**, grouped by topic |
| `articles.ts` | articles (card summary + full body) |
| `contact.ts` | Contact page, form labels and messages |
| `media.ts` | every image reference (the media manifest) |

Each string is written once per language:

```ts
title: { en: "Breast cancer", ar: "أورام الثدي" }
```

Components never contain copy; `lib/content.ts` resolves the right language
before rendering. Items marked `isPlaceholder: true` must be replaced or
approved before launch.

**One source per item.** Homepage cards are the same records as the cards on
the full pages, so editing one updates it everywhere:

- **Videos and reviews:** each catalog is ordered by importance. The homepage
  shows the first three videos and the first six reviews, so moving an entry
  up or down decides whether it appears there.
- **Services and FAQs** are grouped, so the homepage and About page pick them by
  id (`serviceIds`, `faqIds`). An unknown id fails the build.

**Star ratings.** Every review card shows five stars. A real review must carry
the rating the patient gave (`rating: 1`–`5`), or the build fails; placeholder
reviews keep `rating: null` and show empty stars marked "Rating pending".

**Long-form content** (service popups, articles) is a list of blocks written
with the helpers in `content/blocks.ts`: `paragraph`, `heading`, `list`, `note`.

### Contact details

Set the real numbers in `content/site.ts` (`contact.phone`, `contact.whatsapp`):
`e164` without spaces (e.g. `+201234567890`) and a readable `display` form.
WhatsApp and call links everywhere — header, hero panel, CTA, Contact page,
service popups and the floating buttons — are generated from these. Set a social
link's `url` to `null` to hide it everywhere.

### Contact form

The site has no server, so the form works in one of two ways:

- **Default (no endpoint):** after validation it opens WhatsApp with the
  message prepared; the visitor presses send there. The page says so — it never
  claims the message was sent.
- **With `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT`:** it posts JSON
  (`name, phone, email, topic, message, locale`) to that URL (e.g. Formspree,
  Web3Forms or a Supabase Edge Function) and shows success only after a 2xx
  response.

### Videos

In `content/videos.ts`, set a video's `source` to
`{ kind: "youtube", id: "VIDEO_ID" }` or `{ kind: "file", src: "/media/intro.mp4" }`
and add its real `duration`. Until then the poster shows "Video coming soon"
without any play control. The player loads only after the visitor presses play
(no autoplay).

### Certificates, career and quotes (About page)

- Certificates: add scans to `assets-src/` (e.g. `assets-src/certificates/certificate-1.jpg`),
  run `npm run images`, then set `image` on each entry in `content/about.ts`
  (`src: "/media/certificate-1"`). Cards show the whole certificate without
  cropping, and a "view larger" popup appears automatically.
- Career milestones read "To be confirmed" until verified dates and institutions
  are entered.
- Quotations are shown without attribution until approved; set `attribution`
  to display the doctor's name.

### Replacing images

1. Put the approved photo in `assets-src/` with the same name as the placeholder
   (e.g. `assets-src/doctor/hero-doctor.jpg`) and delete the old file from
   `assets-src/placeholders/`.
2. `npm run images` — creates WebP files at 320–2560 px widths.
3. In `content/media.ts` update `alt`, adjust `position` / `positionMobile`
   (crop focus) and remove `isPlaceholder`.
4. After replacing the hero photo, run `npm run og`.

Absolute URLs (e.g. Supabase Storage) can be used as `src` directly.

Temporary photos are from Unsplash (Unsplash License); each entry in
`content/media.ts` records its source. None of them shows Dr. Othman Shaker.

## Languages and routing

- Every page exists as `/en/…/` and `/ar/…/` static HTML with the correct
  `lang` and `dir`, so there is no flash of the wrong direction.
- The EN / AR switcher links to the same page in the other language and saves
  the choice in `localStorage` (optional — switching works without it).
- `/` redirects to the saved language, otherwise the browser's language,
  otherwise English. Without JavaScript it shows a bilingual chooser.
- RTL uses logical CSS properties throughout; only direction-bearing elements
  are mirrored (arrows, timelines, card fan, gallery controls, popup close
  button, the hero photo so the subject faces the text). Arabic uses El Messiri
  (headings) and IBM Plex Sans Arabic, with Arabic-Indic digits for figures;
  phone numbers stay in Latin digits.
- `lib/routes.ts` is the route registry. A future page can be registered with
  `live: false`: links then fall back to a homepage section or a non-clickable
  "Soon" state, so the export never contains broken links.

## Deploying to Hostinger

1. Create `.env.production` from `.env.example`:
   - `NEXT_PUBLIC_SITE_URL=https://your-domain` (canonical URLs, Open Graph, sitemap)
   - `NEXT_PUBLIC_ALLOW_INDEXING=true` for the launch build; leave it out for a preview
   - optionally `NEXT_PUBLIC_CONTACT_FORM_ENDPOINT` (see "Contact form")
2. If the CMS is connected: `npm run cms:sync` (pulls the published CMS content).
   Then `npm run build`
3. Upload the **contents** of `out/` (including the hidden `.htaccess`) into
   `public_html/` with File Manager or FTP. The site must be served from the
   domain root.

`.htaccess` sets the 404 page, compression and caching (hashed JS/CSS/fonts are
cached for a year; HTML is always revalidated).

`npm run build` runs the placeholder check first (`prebuild`):

- **Launch build** (`NEXT_PUBLIC_ALLOW_INDEXING=true`): the build stops while any
  placeholder or launch setting remains, so placeholder phone numbers, photos or
  texts cannot go live by mistake. An item the client approves as-is is
  released by setting its `isPlaceholder` to `false`.
- **Preview build** (indexing not enabled): placeholders are allowed, every page
  carries `noindex` and `robots.txt` blocks crawlers. The call and WhatsApp
  buttons then still use the placeholder number, so share preview links only
  with people who know it is a draft.

## Launch checklist

- [ ] Real photos (doctor, heroes, cards, posters, CTA) — `npm run images`, `npm run og`
- [ ] Verified phone / WhatsApp number and social profile URLs
- [ ] Contact form endpoint configured, or the WhatsApp hand-off accepted
- [ ] Approved statistics (or remove the items)
- [ ] Doctor-approved services catalog, About copy, quotes and career details
- [ ] Scanned certificates
- [ ] Real videos, or removal of the video entries
- [ ] Medically reviewed articles (`reviewedBy` set)
- [ ] Consented patient reviews, each with the rating the patient gave
- [ ] Doctor-approved FAQ answers (`content/faq.ts`)
- [ ] `npm run check:content` lists only the two launch settings
- [ ] Domain in `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ALLOW_INDEXING=true` in `.env.production`
- [ ] `npm run build` completes (it stops while anything remains), upload `out/`

## Notes

- `next.config.ts` pins `turbopack.root` to this folder: the parent Desktop
  folder contains another `package.json`, which Next.js would otherwise treat as
  the workspace root.
- CMS: see [docs/CMS.md](docs/CMS.md); to connect it, [docs/SUPABASE.md](docs/SUPABASE.md).
#   O s m a n - S h a k e r  
 