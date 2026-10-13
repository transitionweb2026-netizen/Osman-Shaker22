/**
 * Responsive image pipeline for the static export.
 *
 * Reads every source photo in `assets-src/` (any sub-folder), and writes
 * `public/media/<name>-<width>.webp` at a set of responsive widths plus a
 * variants manifest (`content/media-variants.generated.json`) that
 * `components/media/MediaImage.tsx` uses to build `srcset`.
 *
 * To replace a temporary photo: drop the real file into `assets-src/`
 * (e.g. `assets-src/doctor/hero-doctor.jpg`), point the slot in
 * `content/media.ts` at `/media/hero-doctor`, then run `npm run images`.
 *
 * Usage: npm run images
 */
import { readdir, mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "assets-src");
const outDir = path.join(root, "public", "media");
const manifestPath = path.join(root, "content", "media-variants.generated.json");

const WIDTHS = [320, 480, 640, 960, 1280, 1600, 1920, 2560];
const QUALITY = 72;
const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

async function listSources(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listSources(full);
      return SOURCE_EXT.has(path.extname(entry.name).toLowerCase()) ? [full] : [];
    }),
  );
  return files.flat();
}

function toHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const sources = await listSources(srcDir);
const names = new Map();
for (const file of sources) {
  const name = path.basename(file, path.extname(file));
  if (names.has(name)) {
    throw new Error(`Duplicate media name "${name}":\n  ${names.get(name)}\n  ${file}`);
  }
  names.set(name, file);
}

// Start clean, but keep the files written by `npm run cms:sync` (`cms-…`)
await mkdir(outDir, { recursive: true });
for (const file of await readdir(outDir)) {
  if (!file.startsWith("cms-")) await rm(path.join(outDir, file), { recursive: true, force: true });
}

const manifest = {};
for (const [name, file] of [...names].sort(([a], [b]) => a.localeCompare(b))) {
  const image = sharp(file).rotate();
  const { width, height } = await image.metadata();
  const { dominant } = await sharp(file).stats();
  const maxWidth = Math.min(width, WIDTHS.at(-1));
  const widths = [...WIDTHS.filter((w) => w < maxWidth), maxWidth];

  await Promise.all(
    widths.map((w) =>
      sharp(file)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 5 })
        .toFile(path.join(outDir, `${name}-${w}.webp`)),
    ),
  );

  manifest[name] = { width, height, widths, color: toHex(dominant) };
  console.log(`${name.padEnd(28)} ${width}x${height} -> ${widths.join(", ")}`);
}

await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\nWrote ${Object.keys(manifest).length} images to public/media and ${path.relative(root, manifestPath)}`);
