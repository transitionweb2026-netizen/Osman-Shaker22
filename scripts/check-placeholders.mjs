/**
 * Pre-publication check: lists every item still marked `isPlaceholder: true`
 * in `content/`, plus missing launch settings. Settings are read from the
 * environment and `.env*` files, exactly as `next build` reads them.
 *
 * Usage:
 *   npm run check:content   Full report; exits with code 1 while anything remains.
 *   --build                 Runs before every `npm run build` (the `prebuild` script).
 *                           A launch build (NEXT_PUBLIC_ALLOW_INDEXING=true) stops while
 *                           anything remains, so placeholder phone numbers, photos or
 *                           texts cannot be published by mistake. A preview build only
 *                           prints a one-line reminder.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");
const buildMode = process.argv.includes("--build");

// Same files and precedence as `next build`: .env.production.local, .env.local, .env.production, .env
nextEnv.loadEnvConfig(root, false, { info() {}, error: console.error });

const indent = (line) => line.match(/^\s*/)[0].length;
const isComment = (line) => /^\s*(\*|\/\/|\/\*)/.test(line);
const IDENTIFIER = /\b(?:id|src|platform|e164):\s*["`]([^"`]+)["`]/;
const OPENER = /^\s*(?:export const (\w+)[^=]*=|(\w+):)\s*\{\s*$/;
const ARRAY = /^\s*(\w+):\s*\[\s*$/;
/** Any top-level declaration, e.g. `const reviews: Review[] = [` or `const items = list.map(…`. */
const DECLARATION = /^(?:export\s+)?const\s+(\w+)/;

/** Describes the object that holds a placeholder flag, e.g. `specialties.items "breast"`. */
function describe(lines, index) {
  let level = indent(lines[index]);
  // Single-line objects, e.g. `phone: { e164: "…", isPlaceholder: true }`
  const inlineKey = lines[index].match(/^\s*(\w+):\s*\{.*\}/)?.[1];
  // "" (not null) stops the search from borrowing a sibling's identifier
  let identifier = inlineKey ? "" : (lines[index].match(IDENTIFIER)?.[1] ?? null);
  const path = inlineKey ? [inlineKey] : [];
  for (let i = index - 1; i >= 0 && path.length < 4; i--) {
    const line = lines[i];
    if (isComment(line) || !line.trim()) continue;
    const lineIndent = indent(line);
    if (lineIndent === level && identifier === null) identifier = line.match(IDENTIFIER)?.[1] ?? null;
    if (lineIndent >= level) continue;
    const declaration = line.match(DECLARATION);
    if (declaration && !OPENER.test(line)) {
      path.unshift(declaration[1]);
      break;
    }
    const opener = line.match(OPENER);
    const array = line.match(ARRAY);
    if (opener) path.unshift(opener[1] ?? opener[2]);
    else if (array) path.unshift(array[1]);
    else if (!/^\s*\{\s*$/.test(line)) continue;
    level = lineIndent;
    if (opener?.[1]) break;
  }
  return `${path.join(".")}${identifier ? ` "${identifier}"` : ""}`;
}

const findings = [];
for (const file of (await readdir(contentDir)).filter((f) => f.endsWith(".ts"))) {
  const lines = (await readFile(path.join(contentDir, file), "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    if (isComment(line) || !/isPlaceholder:\s*true/.test(line)) return;
    findings.push(`content/${file}:${index + 1}  ${describe(lines, index)}`);
  });
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
const launch = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
const settings = [];
// .env.example ships with example.com, so a copied but unedited file still counts as "not set"
if (!siteUrl || /^https?:\/\/(?:www\.)?example\.com(?:[/:]|$)/i.test(siteUrl)) {
  settings.push("NEXT_PUBLIC_SITE_URL is not set to the real domain (canonical URLs use example.com)");
}
if (!launch) settings.push('NEXT_PUBLIC_ALLOW_INDEXING is not "true" (pages are marked noindex)');

if (buildMode && !launch) {
  // Preview build: placeholders are expected, and every page is noindex.
  console.log(
    findings.length
      ? `Preview build: ${findings.length} placeholder item(s) remain and pages are noindex (details: npm run check:content).`
      : "Preview build: pages are noindex until NEXT_PUBLIC_ALLOW_INDEXING=true.",
  );
  process.exit(0);
}

if (findings.length) {
  console.log(`${findings.length} placeholder item(s) to replace or approve before publication:\n`);
  findings.forEach((finding) => console.log(`  - ${finding}`));
}
if (settings.length) {
  console.log("\nLaunch settings:");
  settings.forEach((setting) => console.log(`  - ${setting}`));
}
if (findings.length || settings.length) {
  if (buildMode) {
    console.error(
      "\nLaunch build stopped: NEXT_PUBLIC_ALLOW_INDEXING is \"true\", but the items above are not ready.\n" +
        "Replace them (or set `isPlaceholder: false` once the client has approved an item),\n" +
        "or build a noindex preview by leaving NEXT_PUBLIC_ALLOW_INDEXING unset.",
    );
  }
  process.exitCode = 1;
} else {
  console.log("No placeholders left. Ready for publication.");
}
