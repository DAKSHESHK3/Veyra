import { createClient } from "@supabase/supabase-js";

function sanitizeUrl(url?: string): string {
  if (!url) return "";
  let clean = url.trim().replace(/^["']|["']$/g, "");
  // Remove any trailing /rest/v1 or /rest/v1/ that users often accidentally paste
  clean = clean.replace(/\/rest\/v1\/?$/i, "");
  // Remove trailing slashes
  clean = clean.replace(/\/+$/, "");
  return clean;
}

function sanitizeKey(key?: string): string {
  if (!key) return "";
  return key.trim().replace(/^["']|["']$/g, "");
}

const supabaseUrl = sanitizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = sanitizeKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("placeholder") &&
    !supabaseAnonKey.includes("placeholder")
  );
};

// Create client with sanitized configuration
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
