import type { CoachingLogRow } from "@/types/coaching";

export function mapCoachingLogRow(row: Record<string, unknown>): CoachingLogRow {
  return {
    id: String(row.id ?? ""),
    user_id: String(row.user_id ?? ""),
    body: String(row.body ?? ""),
    created_at: String(row.created_at ?? ""),
  };
}
