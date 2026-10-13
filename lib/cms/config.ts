/**
 * CMS configuration, read from public build-time environment variables.
 *
 * Only the project URL and the publishable (anon) key belong here: both are
 * safe in the browser because Row Level Security protects the data. A secret
 * or service-role key is refused outright.
 */

export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
export const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ""
).trim();

export type ConfigProblem = "missingUrl" | "invalidUrl" | "missingKey" | "secretKey";

/** Role claimed by a legacy JWT key (`anon`, `service_role`), if readable. */
function jwtRole(key: string): string | null {
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function configProblems(url = supabaseUrl, key = supabaseKey): ConfigProblem[] {
  const problems: ConfigProblem[] = [];
  if (!url) problems.push("missingUrl");
  else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
        problems.push("invalidUrl");
      }
    } catch {
      problems.push("invalidUrl");
    }
  }
  if (!key) problems.push("missingKey");
  else if (key.startsWith("sb_secret_") || jwtRole(key) === "service_role") problems.push("secretKey");
  return problems;
}

/** True when the CMS can talk to Supabase. Otherwise it runs in local demo mode. */
export const isSupabaseConfigured = configProblems().length === 0;

export const MEDIA_BUCKET = "cms-media";

/** Upload limits (the bucket enforces 50 MB server-side; keep these at or below it). */
export const MEDIA_LIMITS = {
  imageBytes: 15 * 1024 * 1024,
  videoBytes: 50 * 1024 * 1024,
  /** Longest side of the thumbnail generated in the browser. */
  thumbnailSize: 480,
} as const;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

/** Key under which the local demo store keeps its data. */
export const LOCAL_STORE_KEY = "cms-local-demo-v1";
/** Key for the CMS interface language (independent of the website language). */
export const ADMIN_LOCALE_KEY = "cms-admin-locale";
