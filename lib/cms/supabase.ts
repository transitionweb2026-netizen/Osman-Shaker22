import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

let client: SupabaseClient | null = null;

/** The browser Supabase client (publishable key + the signed-in user's session). */
export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
  client ??= createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Invitation and password-reset links return here with the session in the URL
      detectSessionInUrl: true,
      flowType: "implicit",
      storageKey: "cms-auth",
    },
  });
  return client;
}
