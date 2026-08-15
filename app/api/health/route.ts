import { createClient, readSupabaseConfig } from "@/lib/supabase";

// Deployment smoke test: reports whether the Supabase configuration is
// readable and whether a query actually succeeds, so a failing deployment can
// be diagnosed from the browser instead of the hosting provider's logs.
// It reports presence only — never the values themselves.
export const dynamic = "force-dynamic";

// Error text from the Supabase client can quote the credential it was given
// (an invalid header value is reported verbatim, for example). This route is
// publicly reachable, so every string it echoes goes through here first.
// Whitespace is tolerated inside the token patterns because a credential
// pasted with a line break is exactly the case that produces such errors.
function redact(text: string | null | undefined, secrets: string[]): string {
  if (!text) return "(empty message)";

  let safe = text;
  for (const secret of secrets) {
    if (secret) safe = safe.split(secret).join("[redacted]");
  }

  return safe
    .replace(/sb_(secret|publishable)_[\w\-\s]{8,}/gi, "[redacted]")
    .replace(/eyJ[\w\-.\s]{20,}/g, "[redacted]");
}

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

  const secrets = [key, process.env.SUPABASE_SECRET_KEY ?? ""];

  // A credential carrying a line break or stray whitespace cannot be sent as a
  // header, and the resulting error is opaque. Name it directly instead.
  if (/\s/.test(key)) {
    return Response.json(
      {
        ok: false,
        env,
        error:
          "The Supabase key contains whitespace or a line break. Re-paste it " +
          "as a single line.",
      },
      { status: 500 },
    );
  }

  let host: string;
  try {
    // The host is safe to echo back and is the field most likely to be wrong.
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
          error: redact(error.message, secrets),
          code: error.code,
          hint: redact(error.hint, secrets),
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
        error: `${error.name}: ${redact(error.message, secrets)}`,
      },
      { status: 500 },
    );
  }
}
