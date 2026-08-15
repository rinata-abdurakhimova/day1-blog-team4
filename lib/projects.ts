export const PLATFORMS = ["blog", "medium", "substack"] as const;
export const STATUSES = [
  "created",
  "researched",
  "planned",
  "drafted",
  "published",
] as const;

export type Platform = (typeof PLATFORMS)[number];
export type Status = (typeof STATUSES)[number];

export type Project = {
  id: string;
  niche: string;
  platform: Platform;
  status: Status;
  created_at: string;
  updated_at: string;
};

export const STATUS_STYLES: Record<Status, string> = {
  created: "bg-gray-100 text-gray-600",
  researched: "bg-blue-50 text-blue-600",
  planned: "bg-amber-50 text-amber-700",
  drafted: "bg-violet-50 text-violet-700",
  published: "bg-green-50 text-green-700",
};

// Rows can be written straight into Supabase by the research Skill, so a
// status outside this list is possible. Fall back instead of rendering an
// undefined class name.
export function statusStyle(status: string): string {
  return STATUS_STYLES[status as Status] ?? "bg-gray-100 text-gray-600";
}
