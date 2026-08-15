import { createClient, readSupabaseConfig } from "@/lib/supabase";

// Deployment smoke test: reports whether the Supabase configuration is
// readable and whether a query actually succeeds, so a failing deployment can
// be diagnosed from the browser instead of the hosting provider's logs.
// It reports presence only — never the values themselves.
export const dynamic = "force-dynamic";

export async function GET() {
  const { url, key, missing } = readSupabaseConfig();

  const env = {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    SUPABASE_SECRET_KEY: Boolean(process.env.SUPABASE_SECRET_KEY),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };

  if (!url || !key) {
    return Response.json({ ok: false, env, missing }, { status: 500 });
  }

  // The host is safe to echo back and is the field most likely to be wrong.
  let host: string;
  try {
    host = new URL(url).host;
  } catch {
    return Response.json(
      { ok: false, env, error: "SUPABASE_URL is not a valid URL" },
      { status: 500 },
    );
  }

  // A network-level failure rejects rather than returning an error object, so
  // both shapes have to be reported for the response to be worth reading.
  try {
    const { error, count } = await createClient()
      .from("projects")
      .select("id", { count: "exact", head: true });

    if (error) {
      return Response.json(
        {
          ok: false,
          env,
          host,
          error: error.message || "(empty message)",
          code: error.code,
          details: error.details,
          hint: error.hint,
        },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, env, host, projects: count });
  } catch (thrown) {
    const error = thrown instanceof Error ? thrown : new Error(String(thrown));
    return Response.json(
      {
        ok: false,
        env,
        host,
        error: `${error.name}: ${error.message || "(empty message)"}`,
        cause: error.cause ? String(error.cause) : undefined,
      },
      { status: 500 },
    );
  }
}
