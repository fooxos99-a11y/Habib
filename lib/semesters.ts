import { getSaudiDateString } from "@/lib/saudi-time"

export const DEFAULT_ACTIVE_SEMESTER_NAME = "الفصل الحالي"

export type SemesterRow = {
  id: string
  name: string
  status: "active" | "archived"
  start_date: string
  end_date?: string | null
  archived_at?: string | null
  archive_snapshot?: unknown
  created_at: string
  updated_at: string
}

export function isMissingSemestersTable(error: unknown) {
  if (!error || typeof error !== "object") {
    return false
  }

  const candidate = error as { code?: unknown; message?: unknown; details?: unknown }
  return (
    candidate.code === "42P01" ||
    candidate.code === "PGRST205" ||
    (typeof candidate.message === "string" && candidate.message.includes("semesters")) ||
    (typeof candidate.details === "string" && candidate.details.includes("semesters"))
  )
}

export async function getOrCreateActiveSemester(supabase: any) {
  const { data: existingSemester, error: existingSemesterError } = await supabase
    .from("semesters")
    .select("id, name, status, start_date, end_date, archived_at, created_at, updated_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingSemesterError) {
    throw existingSemesterError
  }

  if (existingSemester?.id) {
    return existingSemester as SemesterRow
  }

  const { data: createdSemester, error: createdSemesterError } = await supabase
    .from("semesters")
    .insert({
      name: DEFAULT_ACTIVE_SEMESTER_NAME,
      status: "active",
      start_date: getSaudiDateString(),
    })
    .select("id, name, status, start_date, end_date, archived_at, created_at, updated_at")
    .single()

  if (createdSemesterError) {
    throw createdSemesterError
  }

  return createdSemester as SemesterRow
}