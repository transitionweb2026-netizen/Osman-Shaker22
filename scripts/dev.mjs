/**
 * Local development with the content published in the CMS, kept up to date.
 *
 * `npm run dev`:
 *   1. pulls the published content (`scripts/cms-sync.mjs`) if it changed since the last sync;
 *   2. starts `next dev`;
 *   3. checks Supabase every few seconds and pulls again after each publish, so the open
 *      page reloads with the change. No build is needed while content is being written.
 *
 * Without the Supabase settings it only starts `next dev` (bundled content, local demo).
 * `npm run dev:static` starts `next dev` alone. Extra arguments go to `next dev`,
 * e.g. `npm run dev -- -p 3001`.
 */
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const snapshotPath = path.join(root, "content", "cms-snapshot.json");
const INTERVAL_MS = 5000;

nextEnv.loadEnvConfig(root, true, { info() {}, error: console.error });

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const key = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();
const tag = "[cms]";

function startNext() {
  const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
  const child = spawn(process.execPath, [nextBin, "dev", ...process.argv.slice(2)], { cwd: root, stdio: "inherit" });
  child.on("exit", (code) => process.exit(code ?? 0));
  for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
}

if (!url || !key) {
  console.log(`${tag} Supabase is not configured: the site uses the bundled content.`);
  startNext();
} else {
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  /** Version of the content the site currently shows (from the last sync). */
  let synced = await readFile(snapshotPath, "utf8")
    .then((text) => JSON.parse(text).version ?? null)
    .catch(() => null);
  let reachable = true;

  const publishedVersion = async () => {
    const { data, error } = await supabase.rpc("cms_published_site");
    if (error) throw new Error(error.message);
    return data?.initialized ? (data.version ?? null) : null;
  };

  const sync = () =>
    new Promise((resolve) => {
      const child = spawn(process.execPath, [path.join(root, "scripts", "cms-sync.mjs")], { cwd: root, stdio: ["ignore", "pipe", "inherit"] });
      let output = "";
      child.stdout.on("data", (chunk) => (output += chunk));
      child.on("exit", (code) => {
        // Keep the summary lines, drop the build reminder: no build is needed in development.
        const lines = output.split(/\r?\n/).filter((line) => line.trim() && !line.startsWith("Next:") && !line.startsWith(">"));
        for (const line of lines) console.log(`${tag} ${line.trim()}`);
        resolve(code === 0);
      });
    });

  /** Pulls the published content when it differs from what the site shows. */
  const check = async () => {
    let version;
    try {
      version = await publishedVersion();
    } catch (error) {
      if (reachable) console.warn(`${tag} Could not reach Supabase (${error.message}). Retrying every ${INTERVAL_MS / 1000} s.`);
      reachable = false;
      return;
    }
    if (!reachable) console.log(`${tag} Supabase reachable again.`);
    reachable = true;
    if (!version || version === synced) return;
    console.log(`${tag} New content published in the CMS, updating the site…`);
    if (await sync()) {
      synced = version;
      console.log(`${tag} Done: refresh the page if it did not reload by itself.`);
    }
  };

  await check();
  startNext();
  console.log(`${tag} Watching the CMS: published changes appear here within ${INTERVAL_MS / 1000} seconds.`);

  const loop = async () => {
    await check();
    setTimeout(loop, INTERVAL_MS);
  };
  setTimeout(loop, INTERVAL_MS);
}
