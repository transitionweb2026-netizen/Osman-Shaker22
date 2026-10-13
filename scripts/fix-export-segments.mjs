/**
 * Runs after `next build` (the `postbuild` script).
 *
 * The client router prefetches route segments from files named like
 * `__next.admin.!KGNtcyk.__PAGE__.txt` (segment path joined with dots). On
 * Windows, Next.js 16 writes them with the OS path separator instead, as
 * nested folders (`__next.admin/!KGNtcyk/__PAGE__.txt`), so those requests
 * 404 and navigation falls back to slower full-page loads. This copies each
 * nested file to the flat name the client requests. On Linux/macOS builds
 * there is nothing to do.
 */
import { copyFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");

async function filesBelow(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => (entry.isDirectory() ? filesBelow(path.join(dir, entry.name)) : [path.join(dir, entry.name)])),
  );
  return nested.flat();
}

let fixed = 0;
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("__next.")) {
      for (const file of await filesBelow(full)) {
        const parts = path.relative(full, file).split(path.sep);
        await copyFile(file, path.join(dir, `${entry.name}.${parts.join(".")}`));
        fixed++;
      }
      await rm(full, { recursive: true, force: true });
    } else {
      await visit(full);
    }
  }
}

try {
  await stat(outDir);
} catch {
  process.exit(0);
}
await visit(outDir);
if (fixed) console.log(`Prefetch files: ${fixed} segment file(s) renamed to the names the client requests.`);
