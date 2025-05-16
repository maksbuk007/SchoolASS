import { type NextRequest, NextResponse } from "next/server"
import { getStudentGradesFromSheets } from "@/lib/google-sheets-server"
import { getUserById } from "@/lib/users"
import { subjects } from "@/lib/data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Отсутствует ID ученика",
          data: null,
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
          error: "Ученик не найден",
          data: null,
        },
        { status: 404 },
      )
    }

    try {
      const result = await getStudentGradesFromSheets(studentId)

      // If no data is returned, create an empty structure
      if (!result) {
        const emptyData = {
          studentId,
          subjects: {},
        }

        subjects.forEach((subject) => {
          emptyData.subjects[subject.id] = {
            current: [],
            quarters: {
              "2025-Q1": [],
              "2025-Q2": [],
              "2025-Q3": [],
            },
          }
        })

        return NextResponse.json({
          success: true,
          data: emptyData,
          warning: "Данные не найдены, показана пустая структура",
        })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        lastUpdate: result.lastUpdate,
      })
    } catch (error) {
      console.error(`Error fetching grades for student ${studentId}:`, error)

      // Return empty data structure on error
      const emptyData = {
        studentId,
        subjects: {},
      }

      subjects.forEach((subject) => {
        emptyData.subjects[subject.id] = {
          current: [],
          quarters: {
            "2025-Q1": [],
            "2025-Q2": [],
            "2025-Q3": [],
          },
        }
      })

      return NextResponse.json(
        {
          success: false,
          error: "Ошибка при получении данных из Google Sheets",
          errorDetails: error instanceof Error ? error.message : String(error),
          data: emptyData,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Ошибка при получении оценок:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
        data: null,
      },
      { status: 500 },
    )
  }
