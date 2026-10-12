/**
 * Generates the social sharing images and the Apple touch icon:
 *   public/og/og-en.jpg, public/og/og-ar.jpg  (1200×630, from the hero photo)
 *   app/apple-icon.png                         (180×180, from app/icon.svg)
 *
 * Re-run after replacing the hero photo: npm run og
 */
import { readdir, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const W = 1200;
const H = 630;

async function findSource(dir, name) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = await findSource(full, name);
      if (found) return found;
    } else if (path.parse(entry.name).name === name) {
      return full;
    }
  }
  return null;
}

const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function overlay({ rtl, name, role, tagline, nameFont, bodyFont }) {
  const x = rtl ? W - 96 : 96;
  // With an RTL base direction, "start" anchors on the right edge.
  const text = `text-anchor="start" direction="${rtl ? "rtl" : "ltr"}"`;
  const scrim = rtl
    ? `<linearGradient id="scrim" x1="1" y1="0" x2="0" y2="0">`
    : `<linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">`;
  const markX = rtl ? W - 96 - 56 : 96;
  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${scrim}
      <stop offset="0" stop-color="#040d1f" stop-opacity="0.96"/>
      <stop offset="0.42" stop-color="#06152f" stop-opacity="0.82"/>
      <stop offset="0.75" stop-color="#0c4484" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#0c4484" stop-opacity="0.05"/>
    </linearGradient>
    <radialGradient id="amber" cx="${rtl ? 0.25 : 0.75}" cy="0.2" r="0.6">
      <stop offset="0" stop-color="#e98435" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#e98435" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ring" x1="0.1" y1="0.1" x2="0.9" y2="0.95">
      <stop offset="0" stop-color="#dbe8f8"/>
      <stop offset="0.45" stop-color="#4a8ad6"/>
      <stop offset="1" stop-color="#e98435"/>
    </linearGradient>
    <linearGradient id="seam" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#4a8ad6" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#e98435"/>
      <stop offset="1" stop-color="#4a8ad6" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0c4484" opacity="0.28"/>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <rect width="${W}" height="${H}" fill="url(#amber)"/>
  <g transform="translate(${markX} 150) scale(1.4)">
    <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="12" fill="#0c4484" fill-opacity="0.5" stroke="#ffffff" stroke-opacity="0.3"/>
    <circle cx="19.5" cy="20.5" r="9.6" fill="none" stroke="url(#ring)" stroke-width="3"/>
    <circle cx="27.6" cy="12.4" r="3.3" fill="#e98435"/>
  </g>
  <text x="${x}" y="320" ${text} font-family="${nameFont}" font-size="74" fill="#f8f2ea">${escape(name)}</text>
  <text x="${x}" y="380" ${text} font-family="${bodyFont}" font-size="26" font-weight="700" letter-spacing="${rtl ? 0 : 6}" fill="#f6b77f">${escape(role)}</text>
  <text x="${x}" y="440" ${text} font-family="${bodyFont}" font-size="28" fill="#dbe8f8" fill-opacity="0.85">${escape(tagline)}</text>
  <rect x="0" y="${H - 4}" width="${W}" height="4" fill="url(#seam)"/>
</svg>`);
}

const heroSource = await findSource(path.join(root, "assets-src"), "hero-doctor");
if (!heroSource) throw new Error("assets-src/**/hero-doctor.* not found");

await mkdir(path.join(root, "public", "og"), { recursive: true });

const variants = [
  {
    file: "og-en.jpg",
    rtl: false,
    name: "Dr. Othman Shaker",
    role: "ONCOLOGY",
    tagline: "Expert cancer care that begins with listening.",
    nameFont: "Georgia, 'Times New Roman', serif",
    bodyFont: "'Segoe UI', Arial, sans-serif",
  },
  {
    file: "og-ar.jpg",
    rtl: true,
    name: "د. عثمان شاكر",
    role: "طب الأورام",
    tagline: "رعاية متخصصة لمرضى الأورام تبدأ بالإصغاء إليك.",
    nameFont: "'Segoe UI', Tahoma, Arial, sans-serif",
    bodyFont: "'Segoe UI', Tahoma, Arial, sans-serif",
  },
];

for (const variant of variants) {
  let photo = sharp(heroSource).rotate().resize(W, H, { fit: "cover", position: "attention" });
  if (variant.rtl) photo = photo.flop();
  await photo
    .composite([{ input: overlay(variant) }])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(root, "public", "og", variant.file));
  console.log(`public/og/${variant.file}`);
}

const iconSvg = await readFile(path.join(root, "app", "icon.svg"));
await sharp(iconSvg, { density: 600 })
  .resize(180, 180)
  .flatten({ background: "#040d1f" })
  .png()
  .toFile(path.join(root, "app", "apple-icon.png"));
console.log("app/apple-icon.png");
