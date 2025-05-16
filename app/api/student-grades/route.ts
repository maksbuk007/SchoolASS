import { type NextRequest, NextResponse } from "next/server"
import { getGoogleSheetsClient } from "@/lib/google-sheets-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Не указан ID студента" }, { status: 400 })
    }

    console.log(`Получение оценок для студента: ${studentId}`)

    // Получаем клиент Google Sheets
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    // Получаем данные из листа Grades (текущие оценки)
    const currentGradesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Grades!A1:V28",
    })

    // Получаем данные из листа Previous_Grades (архивные оценки)
    const previousGradesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Previous_Grades!A1:V28",
    })

    // Получаем дату последнего обновления из ячейки U2
    const lastUpdateResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Grades!U2",
    })

    const lastUpdate = lastUpdateResponse.data.values?.[0]?.[0] || ""
    console.log("Дата последнего обновления:", lastUpdate)

    const currentValues = currentGradesResponse.data.values || []
    const previousValues = previousGradesResponse.data.values || []

    if (currentValues.length === 0) {
      return NextResponse.json({ error: "Лист с оценками пуст" }, { status: 404 })
    }

    // Получаем заголовки (предметы)
    const headers = currentValues[0]

    // Ищем строку с данными ученика по ID в столбце V (индекс 21)
    const studentRowIndex = currentValues.findIndex((row) => row.length > 21 && row[21] === studentId)

    if (studentRowIndex === -1) {
      return NextResponse.json({ error: `Ученик ${studentId} не найден (столбец V)` }, { status: 404 })
    }

    const studentRow = currentValues[studentRowIndex]
    console.log(`Найдена строка для ученика ${studentId}: ${studentRowIndex + 1}`)

    // Ищем строку с данными ученика в архивных оценках
    const previousStudentRowIndex = previousValues.findIndex((row) => row.length > 21 && row[21] === studentId)
    const previousStudentRow = previousStudentRowIndex !== -1 ? previousValues[previousStudentRowIndex] : null

    // Формируем объект с оценками по предметам
    const result = {
      studentId,
      studentName: `${studentRow[0]} ${studentRow[1]}`, // Фамилия и имя
      subjects: {},
      lastUpdate,
    }

    // Обрабатываем каждый предмет (столбцы от D до T)
    for (let i = 3; i < Math.min(headers.length, 20); i++) {
      const subjectId = headers[i]
      if (!subjectId) continue

      // Текущие оценки
      const currentGrades = i < studentRow.length && studentRow[i] ? parseGrades(studentRow[i]) : []

      // Архивные оценки
      const archiveGrades =
        previousStudentRow && i < previousStudentRow.length && previousStudentRow[i]
          ? parseArchiveGrades(previousStudentRow[i])
          : []

      // Формируем объект с оценками для предмета
      result.subjects[subjectId] = {
        current: currentGrades,
        quarters: {
          "2025-Q1": archiveGrades[0] ? [archiveGrades[0]] : [],
          "2025-Q2": archiveGrades[1] ? [archiveGrades[1]] : [],
          "2025-Q3": archiveGrades[2] ? [archiveGrades[2]] : [],
          "2025-Q4": archiveGrades[3] ? [archiveGrades[3]] : [],
        },
        year: archiveGrades[4] ? archiveGrades[4] : 0,
      }
    }

    console.log("Результат запроса:", JSON.stringify(result, null, 2))
    return NextResponse.json(result)
  } catch (error) {
    console.error("Ошибка при получении оценок:", error)
    return NextResponse.json({ error: "Ошибка при получении оценок" }, { status: 500 })
  }
}

// Функция для парсинга оценок из строки
function parseGrades(gradesStr: string): number[] {
  try {
    return gradesStr
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g !== "")
      .map((g) => {
        const parsed = Number.parseFloat(g)
        return isNaN(parsed) ? 0 : parsed
      })
      .filter((g) => g > 0)
  } catch (e) {
    console.error("Ошибка при парсинге оценок:", e)
    return []
  }
}

// Функция для парсинга архивных оценок (первые 4 - четверти, 5-я - годовая)
function parseArchiveGrades(gradesStr: string): number[] {
  try {
    const grades = gradesStr
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g !== "")
      .map((g) => {
        const parsed = Number.parseFloat(g)
        return isNaN(parsed) ? 0 : parsed
      })

    // Возвращаем массив из 5 элементов (4 четверти + годовая)
    return [
      grades[0] || 0, // Q1
      grades[1] || 0, // Q2
      grades[2] || 0, // Q3
      grades[3] || 0, // Q4
      grades[4] || 0, // Годовая
    ]
  } catch (e) {
    console.error("Ошибка при парсинге архивных оценок:", e)
    return [0, 0, 0, 0, 0]
  }
}
