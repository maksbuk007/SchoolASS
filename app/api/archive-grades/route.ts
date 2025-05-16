import { NextResponse } from "next/server"
import { getStudentArchiveGrades } from "@/lib/google-sheets-api"
import { getUserById } from "@/lib/users"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const studentId = url.searchParams.get("studentId")

    console.log(`API: Получение архивных оценок для ученика: ${studentId}`)

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          message: "Не указан ID ученика",
        },
        { status: 400 },
      )
    }

    // Проверяем, существует ли ученик
    const student = getUserById(studentId)
    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Ученик не найден",
        },
        { status: 404 },
      )
    }

    const archiveData = await getStudentArchiveGrades(studentId)

    if (!archiveData) {
      return NextResponse.json({
        success: false,
        message: "Архивные оценки не найдены",
        data: { studentId, subjects: {} },
      })
    }

    return NextResponse.json({
      success: true,
      data: archiveData,
    })
  } catch (error) {
    console.error("API: Ошибка при получении архивных оценок:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 },
    )
  }
}
