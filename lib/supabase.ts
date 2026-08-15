import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Every query in this app runs server-side (server components and server
// actions), so a secret key is preferred: it bypasses RLS and never reaches
// the browser. The publishable key stays as a fallback so local setups that
// only have the NEXT_PUBLIC_ pair keep working.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and either " +
        "SUPABASE_SECRET_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return createSupabaseClient(url, key);
}
