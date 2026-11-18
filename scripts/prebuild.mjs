/**
 * Runs before every `npm run build` (npm's `prebuild` hook).
 *
 * 1. When Supabase is configured, pulls the content published in the CMS
 *    (`scripts/cms-sync.mjs`), so a build never ships content older than the
 *    dashboard. If the sync fails (network, Supabase), the build stops instead of
 *    quietly using the previous snapshot.
 * 2. Runs the placeholder and key checks (`scripts/check-placeholders.mjs --build`).
 *
 * Without Supabase settings (a fresh clone, the local demo), step 1 is skipped and
 * the build uses the bundled content, as before.
 * `SKIP_CMS_SYNC=1 npm run build` builds offline with the last synced content.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root, false, { info() {}, error: console.error });

const run = (script, args = []) =>
  spawnSync(process.execPath, [path.join(root, "scripts", script), ...args], { cwd: root, stdio: "inherit" }).status ?? 1;

const configured = Boolean(
  (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim() &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim(),
);

if (process.env.SKIP_CMS_SYNC === "1") {
  console.log("prebuild: SKIP_CMS_SYNC=1, building with the last synced CMS content.");
} else if (configured) {
  console.log("prebuild: pulling the content published in the CMS…");
  if (run("cms-sync.mjs") !== 0) {
    console.error(
      "\nBuild stopped: the published CMS content could not be pulled, so the site would show old content.\n" +
        "Check the internet connection and run the build again (or SKIP_CMS_SYNC=1 npm run build to build offline).",
    );
    process.exit(1);
  }
}

process.exit(run("check-placeholders.mjs", ["--build"]));
