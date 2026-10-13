/**
 * Pulls the content published in the CMS into the static build.
 *
 * Calls the `cms_published_site()` database function with the publishable
 * key (it returns published content only), downloads the files that
 * published content uses, and writes:
 *   - content/cms-snapshot.json              applied over `content/*.ts` by `next build`
 *   - content/media-variants.cms.generated.json
 *   - public/media/cms-<id>-<width>.webp     responsive images
 *   - public/media/cms-<id>.<mp4|webm>       videos
 *
 * Nothing is written to Supabase. No secret key is needed or accepted.
 *
 * Usage:
 *   npm run cms:sync                         then `npm run build`
 *   npm run cms:sync -- --from-file <json>   use a saved `cms_published_site()` result (offline / tests)
 *   npm run cms:sync -- --reset              back to the bundled content (`{ "enabled": false }`)
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = path.join(root, "content", "cms-snapshot.json");
const variantsPath = path.join(root, "content", "media-variants.cms.generated.json");
const mediaDir = path.join(root, "public", "media");
const BUCKET = "cms-media";
const WIDTHS = [320, 480, 640, 960, 1280, 1600, 1920, 2560];
const QUALITY = 72;
const CATALOGS = ["serviceGroups", "services", "videos", "reviews", "faqCategories", "faqs", "articles", "careerMilestones", "certificates"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const STORAGE_PATH = /^(images\/[0-9a-f-]{36}\.(jpg|png|webp|avif)|videos\/[0-9a-f-]{36}\.(mp4|webm))$/;

const args = process.argv.slice(2);
const fromFile = args.includes("--from-file") ? args[args.indexOf("--from-file") + 1] : null;

nextEnv.loadEnvConfig(root, false, { info() {}, error: console.error });

const writeJson = (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`);

/** Removes previously synced CMS files from public/media. */
async function clearSyncedMedia(keep = new Set()) {
  await mkdir(mediaDir, { recursive: true });
  for (const file of await readdir(mediaDir)) {
    if (file.startsWith("cms-") && !keep.has(file)) await rm(path.join(mediaDir, file), { force: true });
  }
}

if (args.includes("--reset")) {
  await writeJson(snapshotPath, { enabled: false });
  await writeJson(variantsPath, {});
  await clearSyncedMedia();
  console.log("CMS content removed from the build: the site uses the bundled content again.");
  process.exit(0);
}

// ---- Configuration -----------------------------------------------------------------

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

function jwtRole(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")).role ?? null;
  } catch {
    return null;
  }
}

function fail(message) {
  console.error(`\ncms:sync stopped: ${message}`);
  process.exit(1);
}

if (key.startsWith("sb_secret_") || jwtRole(key) === "service_role") {
  fail(
    "the configured key is a secret (service-role) key. Use the publishable key (Project Settings → API keys).\n" +
      "Remove the secret key from every NEXT_PUBLIC_ variable: those are embedded in the website.",
  );
}

let supabase = null;
if (!fromFile) {
  if (!url || !key) {
    fail(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not set (see .env.example and docs/CMS.md).\n" +
        "Nothing was changed; the build keeps using the current content.",
    );
  }
  supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

// ---- Published content ---------------------------------------------------------------

let site;
if (fromFile) {
  site = JSON.parse(await readFile(path.resolve(fromFile), "utf8"));
  console.log(`Using ${fromFile} instead of Supabase.`);
} else {
  const { data, error } = await supabase.rpc("cms_published_site");
  if (error) fail(`could not read the published content (${error.message}). Was the migration applied?`);
  site = data;
}

if (!site?.initialized) {
  console.log("The CMS database is still empty (nothing imported yet). The build keeps the bundled content.");
  process.exit(0);
}

/** `true` anywhere in a value: content still marked as a placeholder. */
const hasPlaceholder = (value) =>
  Array.isArray(value)
    ? value.some(hasPlaceholder)
    : Boolean(value) && typeof value === "object" && (value.isPlaceholder === true || Object.values(value).some(hasPlaceholder));

const catalogs = {};
for (const name of CATALOGS) {
  catalogs[name] = (site[name] ?? []).map((entry) => {
    const parent = entry.group ?? entry.category;
    return parent ? { slug: entry.slug, content: entry.content, parent } : { slug: entry.slug, content: entry.content };
  });
}

const documents = site.documents ?? {};
const placeholders = [
  ...Object.entries(documents)
    .filter(([, value]) => hasPlaceholder(value))
    .map(([name]) => `section ${name}`),
  ...CATALOGS.flatMap((name) => catalogs[name].filter((entry) => hasPlaceholder(entry.content)).map((entry) => `${name} "${entry.slug}"`)),
];

// ---- Media ------------------------------------------------------------------------------

/** Asset ids referenced by published content (images and videos uploaded to the CMS). */
const used = new Set();
const collect = (value) => {
  if (Array.isArray(value)) return value.forEach(collect);
  if (!value || typeof value !== "object") return;
  if (typeof value.assetId === "string" && typeof value.src === "string" && value.src.startsWith("/media/cms-")) used.add(value.assetId);
  Object.values(value).forEach(collect);
};
collect(documents);
collect(catalogs);

const variants = {};
const keep = new Set();
const media = (site.media ?? []).filter((item) => used.has(item.id));
const missing = [...used].filter((id) => !media.some((item) => item.id === id));
if (missing.length) {
  fail(`published content uses ${missing.length} file(s) that are not available: ${missing.join(", ")}`);
}

async function download(storagePath) {
  if (fromFile) {
    // Offline runs read files from a local folder next to the JSON (same layout as the bucket)
    return readFile(path.join(path.dirname(path.resolve(fromFile)), "storage", storagePath));
  }
  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
  if (error) throw new Error(`${storagePath}: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

await mkdir(mediaDir, { recursive: true });
for (const item of media) {
  // Ids and paths come from the database; still never let them shape a path outside public/media
  if (!UUID.test(item.id) || !STORAGE_PATH.test(item.path ?? "")) fail(`unexpected media record ${JSON.stringify(item)}`);
  const name = `cms-${item.id}`;
  const bytes = await download(item.path);

  if (item.kind === "video") {
    const extension = item.path.endsWith(".webm") ? "webm" : "mp4";
    await writeFile(path.join(mediaDir, `${name}.${extension}`), bytes);
    keep.add(`${name}.${extension}`);
    console.log(`${name.padEnd(44)} video (${(bytes.length / 1048576).toFixed(1)} MB)`);
    continue;
  }

  const { width, height } = await sharp(bytes).rotate().metadata();
  const { dominant } = await sharp(bytes).stats();
  const maxWidth = Math.min(width, WIDTHS.at(-1));
  const widths = [...WIDTHS.filter((w) => w < maxWidth), maxWidth];
  for (const w of widths) {
    await sharp(bytes)
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(path.join(mediaDir, `${name}-${w}.webp`));
    keep.add(`${name}-${w}.webp`);
  }
  const color = `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  variants[name] = { width, height, widths, color };
  console.log(`${name.padEnd(44)} ${width}x${height} -> ${widths.join(", ")}`);
}

await clearSyncedMedia(keep);

// ---- Snapshot ---------------------------------------------------------------------------

await writeJson(variantsPath, variants);
await writeJson(snapshotPath, {
  enabled: true,
  syncedAt: new Date().toISOString(),
  version: site.version ?? null,
  documents,
  catalogs,
  placeholders,
});

const count = (name) => catalogs[name].length;
console.log(
  `\nSynced ${Object.keys(documents).length} sections, ${count("services")} services, ${count("videos")} videos, ` +
    `${count("reviews")} reviews, ${count("faqs")} questions, ${count("articles")} articles and ${media.length} files.`,
);
if (placeholders.length) console.log(`${placeholders.length} published item(s) are still marked as placeholders (npm run check:content).`);
console.log("Next: npm run build, then upload out/ to the host.");
