import { type NextRequest, NextResponse } from "next/server"
import { initStudentSheet } from "@/lib/google-sheets-server"

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json()

    if (!studentId) {
      return NextResponse.json({ error: "Отсутствует ID ученика" }, { status: 400 })
    }

    const success = await initStudentSheet(studentId)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Не удалось инициализировать таблицу" }, { status: 500 })
    }
  } catch (error) {
    console.error("Ошибка при инициализации таблицы:", error)
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
