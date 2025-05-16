import { type NextRequest, NextResponse } from "next/server"
import { addGradeToSheets, updateGradeInSheets, deleteGradeFromSheets } from "@/lib/google-sheets-server"

export async function POST(request: NextRequest) {
  try {
    const { action, studentId, subjectId, gradeIndex, value, date, quarter } = await request.json()

    if (!studentId || !subjectId) {
      return NextResponse.json({ error: "Отсутствуют обязательные параметры" }, { status: 400 })
    }

    let success = false

    switch (action) {
      case "add":
        if (value === undefined || !date) {
          return NextResponse.json({ error: "Отсутствуют параметры для добавления оценки" }, { status: 400 })
        }
        success = await addGradeToSheets(studentId, subjectId, value, date, quarter)
        break

      case "update":
        if (gradeIndex === undefined || value === undefined) {
          return NextResponse.json({ error: "Отсутствуют параметры для обновления оценки" }, { status: 400 })
        }
        success = await updateGradeInSheets(studentId, subjectId, gradeIndex, value, quarter)
        break

      case "delete":
        if (gradeIndex === undefined) {
          return NextResponse.json({ error: "Отсутствует индекс оценки для удаления" }, { status: 400 })
        }
        success = await deleteGradeFromSheets(studentId, subjectId, gradeIndex, quarter)
        break

      default:
        return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 })
    }

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: "Не удалось выполнить операцию" }, { status: 500 })
    }
  } catch (error) {
    console.error("Ошибка при управлении оценками:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 },
    )
  }
}
