// Trend objects can come from two shapes depending on where they were
// produced: the live Dify pipeline (title/format/hashtags/hook_idea/
// description) or the legacy workshop seed data (format_name/why_it_works/
// example_topic/avg_length_sec/source_url). All fields are optional so the
// UI can render whichever shape actually shows up.
export type Trend = {
  // Dify pipeline shape
  title?: string;
  format?: string;
  hashtags?: string[];
  hook_idea?: string;
  description?: string;
  // Legacy seed shape
  format_name?: string;
  why_it_works?: string;
  example_topic?: string;
  avg_length_sec?: number;
  source_url?: string;
};

export type Day1Trends = {
  id: string;
  project_id: string;
  run_id: string;
  trends: Trend[] | null;
  sources: unknown;
};

export type Day2Plan = {
  id: string;
  project_id: string;
  run_id: string;
  hook_formats: unknown;
  approved: boolean;
  approved_by: string | null;
  fallback_used: boolean;
  created_at: string;
};

export type OutlineSection = {
  h2?: string;
  bullets?: string[];
};

export type BlogOutline = {
  title?: string;
  hook?: string;
  angle?: string;
  audience?: string;
  cta?: string;
  sections?: OutlineSection[];
  seo_keywords?: string[];
  estimated_words?: number;
};

// The pipeline writes hook_formats as a single object (not a list of hook
// strings): { kind: "blog_outline", status, outline: {...}, review_note,
// needs_manual_review }. Older/manual records may still store a plain array
// of hook format strings. Normalize both shapes for display.
export type HookFormatsSummary = {
  hookStrings: string[];
  outline: BlogOutline | null;
  status: string | null;
  needsManualReview: boolean;
  reviewNote: string | null;
};

export function parseHookFormats(value: unknown): HookFormatsSummary {
  if (Array.isArray(value)) {
    return {
      hookStrings: value.map((item) =>
        typeof item === "string" ? item : JSON.stringify(item),
      ),
      outline: null,
      status: null,
      needsManualReview: false,
      reviewNote: null,
    };
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const outline =
      record.outline && typeof record.outline === "object"
        ? (record.outline as BlogOutline)
        : null;

    return {
      hookStrings: [],
      outline: outline && Object.keys(outline).length > 0 ? outline : null,
      status: typeof record.status === "string" ? record.status : null,
      needsManualReview: Boolean(record.needs_manual_review),
      reviewNote:
        typeof record.review_note === "string" && record.review_note
          ? record.review_note
          : null,
    };
  }

  return {
    hookStrings: [],
    outline: null,
    status: null,
    needsManualReview: false,
    reviewNote: null,
  };
}

export type Day3Assets = {
  id: string;
  project_id: string;
  run_id: string;
  script: string | null;
  hook_variants: unknown;
  thumbnail_url: string | null;
};

export type Day4Video = {
  id: string;
  project_id: string;
  run_id: string;
  shotlist: unknown;
  video_url: string | null;
  voiceover_url: string | null;
  knowledge_refs: unknown;
  status: string | null;
};
