import { createAdminClient } from "@/lib/supabase/admin"
import { requireRoles } from "@/lib/auth/guards"
import { normalizeWhatsAppPhoneNumber } from "@/lib/phone-number"
import { isWhatsAppWorkerReady, readWhatsAppWorkerStatus } from "@/lib/whatsapp-worker-status"

import { NextResponse } from "next/server"

type QueueMessageInput = {
  id: string
  phoneNumber: string
  message: string
  userId?: string
}

type BulkQueueRecipientInput = {
  phoneNumber?: string | null
  userId?: string | null
  message?: string | null
}

async function insertWhatsAppHistoryRows(
  supabase: ReturnType<typeof createAdminClient>,
  rows: Array<{
    id: string
    phone_number: string
    message_text: string
    status: string
    sent_by: string | null
    sent_at: null
  }>,
) {
  if (rows.length === 0) {
    return
  }

  const { error } = await supabase
    .from("whatsapp_messages")
    .insert(rows)

  if (!error || error.code === "42P01") {
    return
  }

  if (error.code !== "23503" && error.code !== "22P02") {
    throw error
  }

  const fallbackRows = rows.map((row) => ({
    ...row,
    sent_by: null,
  }))

  const { error: fallbackError } = await supabase
    .from("whatsapp_messages")
    .insert(fallbackRows)

  if (fallbackError && fallbackError.code !== "42P01") {
    throw fallbackError
  }
}

/**
 * Queue-based WhatsApp Send Endpoint
 * POST /api/whatsapp/send
 * يضيف الرسالة إلى طابور الإرسال ليعالجها الـ Worker الخارجي
 */
export async function POST(request: Request) {
  try {
    const auth = await requireRoles(request, ["admin", "supervisor"])
    if ("response" in auth) {
      return auth.response
    }

    const body = await request.json()
    const { phoneNumber, message, recipients } = body
    const normalizedMessage = typeof message === "string" ? message.trim() : ""
    const workerStatus = await readWhatsAppWorkerStatus()

    if (!isWhatsAppWorkerReady(workerStatus)) {
      return NextResponse.json(
        { error: "واتساب غير مرتبط حاليًا. اربط واتساب أولًا ثم أعد الإرسال." },
        { status: 409 }
      )
    }

    if (!normalizedMessage && !Array.isArray(recipients)) {
      return NextResponse.json(
        { error: "نص الرسالة مطلوب" },
        { status: 400 }
      )
    }

    if (Array.isArray(recipients)) {
      const hasAnyMessage = recipients.some(
        (recipient) => typeof recipient?.message === "string" && recipient.message.trim(),
      )

      if (!normalizedMessage && !hasAnyMessage) {
        return NextResponse.json(
          { error: "نص الرسالة مطلوب" },
          { status: 400 }
        )
      }

      const bulkResult = await enqueueMessagesBulk({
        message: normalizedMessage,
        recipients,
        sentByUserId: auth.session.id,
      })

      return NextResponse.json({
        success: true,
        queuedCount: bulkResult.queuedCount,
        failedCount: bulkResult.failedCount,
        invalidPhoneCount: bulkResult.invalidPhoneCount,
        missingPhoneCount: bulkResult.missingPhoneCount,
        message: `تمت إضافة ${bulkResult.queuedCount} رسالة إلى طابور الإرسال`,
      })
    }

    // التحقق من البيانات المطلوبة
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: "رقم الهاتف والرسالة مطلوبان" },
        { status: 400 }
      )
    }

    const queuedMessage = await enqueueMessage({
      id: crypto.randomUUID(),
      phoneNumber: normalizeWhatsAppPhoneNumber(phoneNumber),
      message: normalizedMessage,
      userId: auth.session.id,
    })

    return NextResponse.json({
      success: true,
      queuedMessage,
      message: "تمت إضافة الرسالة إلى طابور الإرسال بنجاح",
    })
  } catch (error) {
    console.error("[WhatsApp] Send error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "حدث خطأ أثناء إضافة الرسالة إلى الطابور",
      },
      { status: 500 }
    )
  }
}

/**
 * إضافة الرسالة إلى الطابور مع إنشاء سجل تاريخي متزامن معها
 */
async function enqueueMessage(data: QueueMessageInput) {
  const supabase = createAdminClient()

  const { data: queuedMessage, error: queueError } = await supabase
    .from("whatsapp_queue")
    .insert({
      id: data.id,
      phone_number: data.phoneNumber,
      message: data.message,
      status: "pending",
    })
    .select()
    .single()

  if (queueError) {
    console.error("[WhatsApp Queue] Error enqueuing message:", queueError)
    throw new Error("فشل في إضافة الرسالة إلى طابور واتساب")
  }

  try {
    await insertWhatsAppHistoryRows(supabase, [{
      id: data.id,
      phone_number: data.phoneNumber,
      message_text: data.message,
      status: "pending",
      sent_by: data.userId || null,
      sent_at: null,
    }])
  } catch (historyError) {
    console.error("[WhatsApp History] Error saving message history:", historyError)
  }

  return queuedMessage
}

async function enqueueMessagesBulk(params: {
  message: string
  recipients: BulkQueueRecipientInput[]
  sentByUserId: string
}) {
  const supabase = createAdminClient()
  const queueRows: Array<{ id: string; phone_number: string; message: string; status: string }> = []
  const historyRows: Array<{
    id: string
    phone_number: string
    message_text: string
    status: string
    sent_by: string | null
    sent_at: null
  }> = []
  let invalidPhoneCount = 0
  let missingPhoneCount = 0

  for (const recipient of params.recipients) {
    if (!recipient?.phoneNumber || !String(recipient.phoneNumber).trim()) {
      missingPhoneCount += 1
      continue
    }

    const resolvedMessage = typeof recipient.message === "string" && recipient.message.trim()
      ? recipient.message.trim()
      : params.message

    if (!resolvedMessage) {
      continue
    }

    let normalizedPhone
    try {
      normalizedPhone = normalizeWhatsAppPhoneNumber(String(recipient.phoneNumber))
    } catch {
      invalidPhoneCount += 1
      continue
    }

    const id = crypto.randomUUID()
    queueRows.push({
      id,
      phone_number: normalizedPhone,
      message: resolvedMessage,
      status: "pending",
    })
    historyRows.push({
      id,
      phone_number: normalizedPhone,
      message_text: resolvedMessage,
      status: "pending",
      sent_by: params.sentByUserId,
      sent_at: null,
    })
  }

  if (queueRows.length > 0) {
    const { error: queueError } = await supabase
      .from("whatsapp_queue")
      .insert(queueRows)

    if (queueError) {
      console.error("[WhatsApp Queue] Error bulk enqueuing messages:", queueError)
      throw new Error("فشل في إضافة الرسائل إلى طابور واتساب")
    }

    try {
      await insertWhatsAppHistoryRows(supabase, historyRows)
    } catch (historyError) {
      console.error("[WhatsApp History] Error bulk saving message history:", historyError)
    }
  }

  return {
    queuedCount: queueRows.length,
    failedCount: invalidPhoneCount + missingPhoneCount,
    invalidPhoneCount,
    missingPhoneCount,
  }
}

/**
 * GET /api/whatsapp/send
 * الحصول على قائمة الرسائل المرسلة
 */
export async function GET(request: Request) {
  try {
    const auth = await requireRoles(request, ["admin", "supervisor"])
    if ("response" in auth) {
      return auth.response
    }
    const supabase = createAdminClient()

    const { data: messages, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("[Database] Error fetching messages:", error)
      return NextResponse.json(
        { error: "فشل في جلب الرسائل" },
        { status: 500 }
      )
    }

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("[WhatsApp] Get messages error:", error)
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب الرسائل" },
      { status: 500 }
    )
  }
}
