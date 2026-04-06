import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRoles } from "@/lib/auth/guards"
import { buildSemesterArchiveData } from "@/lib/semester-archive"
import { SURAHS, getLegacyPreviousMemorizationFields, getPlanMemorizedRanges, normalizePreviousMemorizationRanges } from "@/lib/quran-data"
import { DEFAULT_ACTIVE_SEMESTER_NAME, getOrCreateActiveSemester, isMissingSemestersTable } from "@/lib/semesters"
import { getSaudiDateString } from "@/lib/saudi-time"

const ADVANCING_MEMORIZATION_LEVELS = ["excellent", "good", "very_good"]

function getNormalizedEndVerse(endSurahNumber: number, endVerse?: number | null) {
  if (endVerse && endVerse > 0) return endVerse
  return SURAHS.find((surah) => surah.number === endSurahNumber)?.verseCount ?? null
}

function hasCompletedMemorization(record: any) {
  const evaluations = Array.isArray(record.evaluations)
    ? record.evaluations
    : record.evaluations
      ? [record.evaluations]
      : []

  if ((record.status !== "present" && record.status !== "late") || evaluations.length === 0) {
    return false
  }

  const latestEvaluation = evaluations[evaluations.length - 1]
  return ADVANCING_MEMORIZATION_LEVELS.includes(latestEvaluation?.hafiz_level ?? "")
}

async function getCompletedDaysForPlan(supabase: any, studentId: string, semesterId: string, startDate?: string | null) {
  let query = supabase
    .from("attendance_records")
    .select("status, evaluations(hafiz_level)")
    .eq("student_id", studentId)
    .eq("semester_id", semesterId)
    .order("date", { ascending: true })

  if (startDate) {
    query = query.gte("date", startDate)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data || []).filter(hasCompletedMemorization).length
}

function getMergedMemorizedRange(student: any, plan: any) {
  const storedRanges = normalizePreviousMemorizationRanges(student?.memorized_ranges)
  const normalizedPlan = {
    ...plan,
    direction: plan?.direction || "asc",
    has_previous: plan?.has_previous || storedRanges.length > 0 || !!(plan?.prev_start_surah || student?.memorized_start_surah),
    prev_start_surah: plan?.prev_start_surah || student?.memorized_start_surah || null,
    prev_start_verse: plan?.prev_start_verse || student?.memorized_start_verse || null,
    prev_end_surah: plan?.prev_end_surah || student?.memorized_end_surah || null,
    prev_end_verse: plan?.prev_end_verse || student?.memorized_end_verse || null,
    previous_memorization_ranges: normalizePreviousMemorizationRanges([
      ...storedRanges,
      ...normalizePreviousMemorizationRanges(plan?.previous_memorization_ranges),
    ]),
  }

  const memorizedRanges = getPlanMemorizedRanges(normalizedPlan, Number(plan?.completedDays) || 0)

  if (memorizedRanges.length > 0) {
    const legacyFields = getLegacyPreviousMemorizationFields(memorizedRanges)

    return {
      memorized_start_surah: legacyFields.prev_start_surah,
      memorized_start_verse: legacyFields.prev_start_verse,
      memorized_end_surah: legacyFields.prev_end_surah,
      memorized_end_verse: legacyFields.prev_end_verse,
      memorized_ranges: memorizedRanges,
    }
  }

  const inheritedStartSurah =
    student?.memorized_start_surah ||
    normalizedPlan?.prev_start_surah ||
    normalizedPlan?.start_surah_number ||
    null
  const inheritedStartVerse =
    student?.memorized_start_verse ||
    normalizedPlan?.prev_start_verse ||
    normalizedPlan?.start_verse ||
    1
  const endSurah =
    student?.memorized_end_surah ||
    normalizedPlan?.prev_end_surah ||
    normalizedPlan?.end_surah_number ||
    null
  const endVerse = endSurah
    ? getNormalizedEndVerse(
        endSurah,
        student?.memorized_end_verse || normalizedPlan?.prev_end_verse || normalizedPlan?.end_verse,
      )
    : null

  return {
    memorized_start_surah: inheritedStartSurah,
    memorized_start_verse: inheritedStartVerse,
    memorized_end_surah: endSurah,
    memorized_end_verse: endVerse,
    memorized_ranges: storedRanges.length > 0 ? storedRanges : null,
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireRoles(request, ["admin", "supervisor"])
    if ("response" in auth) {
      return auth.response
    }

    const supabase = await createClient()
    const activeSemester = await getOrCreateActiveSemester(supabase)
    const body = await request.json()
    const semesterName = String(body.name || "").trim()

    if (!semesterName) {
      return NextResponse.json({ error: "اسم الفصل مطلوب" }, { status: 400 })
    }

    const { data: existingSemester } = await supabase
      .from("semesters")
      .select("id, name")
      .neq("id", activeSemester.id)
      .ilike("name", semesterName)
      .maybeSingle()

    if (existingSemester?.id) {
      return NextResponse.json({ error: "يوجد فصل محفوظ بنفس الاسم بالفعل" }, { status: 400 })
    }

    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, memorized_start_surah, memorized_start_verse, memorized_end_surah, memorized_end_verse, memorized_ranges")

    if (studentsError) {
      return NextResponse.json({ error: studentsError.message || "فشل في جلب الطلاب" }, { status: 500 })
    }

    const { data: plans, error: plansError } = await supabase
      .from("student_plans")
      .select("student_id, start_surah_number, start_verse, end_surah_number, end_verse, prev_start_surah, prev_start_verse, prev_end_surah, prev_end_verse, previous_memorization_ranges, total_pages, daily_pages, direction, start_date, has_previous")
      .eq("semester_id", activeSemester.id)

    if (plansError) {
      return NextResponse.json({ error: plansError.message || "فشل في جلب الخطط الحالية" }, { status: 500 })
    }

    const plansByStudentId = new Map((plans || []).map((plan) => [plan.student_id, plan]))
    let archivedPlansCount = 0

    for (const student of students || []) {
      const plan = plansByStudentId.get(student.id)
      const updateData: Record<string, number | null> = {
        points: 0,
        store_points: 0,
      }

      if (plan) {
        const completedDays = await getCompletedDaysForPlan(supabase, student.id, activeSemester.id, plan.start_date)
        Object.assign(updateData, getMergedMemorizedRange(student, { ...plan, completedDays }))
        archivedPlansCount += 1
      }

      const { error: updateStudentError } = await supabase
        .from("students")
        .update(updateData)
        .eq("id", student.id)

      if (updateStudentError) {
        const columnsMissing = /memorized_start_surah|memorized_end_surah|column/i.test(
          `${updateStudentError.message ?? ""} ${updateStudentError.details ?? ""}`,
        )

        return NextResponse.json(
          {
            error: columnsMissing
              ? "حقول محفوظ الطالب غير موجودة بعد. نفذ ملف scripts/043_add_student_memorized_fields.sql و scripts/049_add_previous_memorization_ranges.sql ثم أعد المحاولة."
              : updateStudentError.message || "فشل في تحديث بيانات الطلاب",
            details: updateStudentError.details ?? null,
            hint: updateStudentError.hint ?? null,
            code: updateStudentError.code ?? null,
          },
          { status: 500 },
        )
      }
    }

    const archivedAt = new Date().toISOString()

    const [attendanceResult, invoicesResult, expensesResult, incomesResult, tripsResult] = await Promise.all([
      supabase
        .from("attendance_records")
        .select("id, student_id, halaqah, date, status, notes, is_compensation, evaluations(hafiz_level, tikrar_level, samaa_level, rabet_level)")
        .eq("semester_id", activeSemester.id)
        .order("date", { ascending: false }),
      supabase
        .from("finance_invoices")
        .select("id, title, vendor, invoice_number, amount, issue_date, due_date, status")
        .eq("semester_id", activeSemester.id)
        .order("issue_date", { ascending: false }),
      supabase
        .from("finance_expenses")
        .select("id, title, beneficiary, payment_method, amount, expense_date")
        .eq("semester_id", activeSemester.id)
        .order("expense_date", { ascending: false }),
      supabase
        .from("finance_incomes")
        .select("id, title, source, amount, income_date")
        .eq("semester_id", activeSemester.id)
        .order("income_date", { ascending: false }),
      supabase
        .from("finance_trips")
        .select("id, title, trip_date, costs")
        .eq("semester_id", activeSemester.id)
        .order("trip_date", { ascending: false }),
    ])

    if (attendanceResult.error) throw attendanceResult.error
    if (invoicesResult.error) throw invoicesResult.error
    if (expensesResult.error) throw expensesResult.error
    if (incomesResult.error) throw incomesResult.error
    if (tripsResult.error) throw tripsResult.error

    const semesterStudentIds = Array.from(
      new Set(
        [...(plans || []).map((plan) => String(plan.student_id || "")), ...(attendanceResult.data || []).map((row) => String(row.student_id || ""))].filter(Boolean),
      ),
    )

    const studentMap = new Map<string, { id: string; name?: string | null; account_number?: number | null; halaqah?: string | null }>()

    if (semesterStudentIds.length > 0) {
      const { data: semesterStudents, error: semesterStudentsError } = await supabase
        .from("students")
        .select("id, name, account_number, halaqah")
        .in("id", semesterStudentIds)

      if (semesterStudentsError) {
        throw semesterStudentsError
      }

      for (const student of semesterStudents || []) {
        studentMap.set(String(student.id), student)
      }
    }

    const archiveBundle = buildSemesterArchiveData({
      plansRows: plans || [],
      attendanceRows: attendanceResult.data || [],
      invoiceRows: invoicesResult.data || [],
      expenseRows: expensesResult.data || [],
      incomeRows: incomesResult.data || [],
      tripRows: tripsResult.data || [],
      studentMap,
      generatedAt: archivedAt,
    })

    const { error: archiveSemesterError } = await supabase
      .from("semesters")
      .update({
        name: semesterName,
        status: "archived",
        end_date: getSaudiDateString(),
        archived_at: archivedAt,
        archive_snapshot: archiveBundle.snapshot,
        updated_at: archivedAt,
      })
      .eq("id", activeSemester.id)

    if (archiveSemesterError) {
      throw archiveSemesterError
    }

    const { error: cancelSchedulesError } = await supabase
      .from("exam_schedules")
      .update({
        status: "cancelled",
        cancelled_at: archivedAt,
        updated_at: archivedAt,
      })
      .eq("semester_id", activeSemester.id)
      .eq("status", "scheduled")

    if (cancelSchedulesError) {
      throw cancelSchedulesError
    }

    const { data: newSemester, error: newSemesterError } = await supabase
      .from("semesters")
      .insert({
        name: DEFAULT_ACTIVE_SEMESTER_NAME,
        status: "active",
        start_date: getSaudiDateString(),
      })
      .select("id, name")
      .single()

    if (newSemesterError) {
      throw newSemesterError
    }

    return NextResponse.json({
      success: true,
      archivedSemesterName: semesterName,
      newSemester,
      studentsReset: (students || []).length,
      plansArchived: archivedPlansCount,
      accountsPreserved: true,
    })
  } catch (error) {
    console.error("[end-semester] POST error:", error)
    if (isMissingSemestersTable(error)) {
      return NextResponse.json({ error: "جدول الفصول غير موجود بعد. نفذ ملف scripts/046_create_semesters.sql ثم أعد المحاولة." }, { status: 503 })
    }
    return NextResponse.json({ error: "حدث خطأ أثناء إنهاء الفصل" }, { status: 500 })
  }
}
