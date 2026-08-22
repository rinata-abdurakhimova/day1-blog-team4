import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Project } from "@/lib/projects";
import type { Day2Plan } from "@/lib/day-tables";

function formatHookFormats(value: unknown): string {
  if (!Array.isArray(value)) return "—";
  if (value.length === 0) return "—";
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return Object.entries(item as Record<string, unknown>)
          .map(([key, val]) => `${key}: ${val}`)
          .join(", ");
      }
      return String(item);
    })
    .join("; ");
}

export default async function Day2PlanPage() {
  const supabase = createClient();

  const { data: rows, error } = await supabase
    .from("day2_plan")
    .select("*, projects(niche)")
    .order("created_at", { ascending: false })
    .returns<(Day2Plan & { projects: Pick<Project, "niche"> | null })[]>();

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Day 2 · Plan</h2>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-6 py-4">Project</th>
              <th className="px-6 py-4">Hook formats</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Approved by</th>
              <th className="px-6 py-4">Fallback used</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm text-gray-500"
                >
                  No day2_plan records yet
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {row.projects?.niche ?? row.project_id}
                  </td>
                  <td className="max-w-xs px-6 py-4 text-gray-600">
                    {formatHookFormats(row.hook_formats)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        row.approved
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {row.approved ? "Затверджено" : "На розгляді"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {row.approved_by ?? "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {row.fallback_used ? "Так" : "Ні"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(row.created_at).toLocaleDateString("uk-UA")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/projects/${row.project_id}`}
                      className="text-violet-600 hover:text-violet-700"
                    >
                      Переглянути
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
