import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Every query in this app runs server-side (server components and server
// actions), so nothing here needs a NEXT_PUBLIC_ variable. Prefer the
// non-public names: Next inlines NEXT_PUBLIC_ values into the bundle at build
// time, which freezes them and makes a later change in the hosting dashboard
// take no effect until the next build. The NEXT_PUBLIC_ names stay as a
// fallback so existing setups keep working.
export function readSupabaseConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const missing: string[] = [];
  if (!url) missing.push("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)");
  if (!key) {
    missing.push(
      "SUPABASE_SECRET_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)",
    );
  }

  return { url, key, missing };
}

export function createClient() {
  const { url, key, missing } = readSupabaseConfig();

  if (!url || !key) {
    throw new Error(
      `Supabase is not configured. Missing: ${missing.join(", ")}. ` +
        "Set these in the hosting dashboard and redeploy.",
    );
  }

  return createSupabaseClient(url, key);
}
