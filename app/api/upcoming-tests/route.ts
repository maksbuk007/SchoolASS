import { NextResponse } from "next/server"
import { getGoogleSheetsClient } from "@/lib/google-sheets-api"
import { subjects } from "@/lib/subjects"

export async function GET() {
  try {
    console.log("API: Запрос на получение предстоящих тестов")

    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    // Получаем данные из таблицы
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Tests_dates!A2:C18",
    })

    const values = response.data.values || []

    if (values.length === 0) {
      console.log("API: Таблица с тестами пуста")
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    // Формируем массив с предстоящими тестами
    // Фильтруем строки, где столбец C пустой
    const testsData = values
      .filter((row) => row.length >= 3 && row[2] && row[2].trim() !== "")
      .map((row) => {
        // Парсим дату (может быть в разных форматах)
        let testDate = null
        try {
          // Пробуем ISO формат
          testDate = new Date(row[1])

          // Если некорректная дата, пробуем формат DD.MM.YYYY
          if (isNaN(testDate.getTime()) && row[1].includes(".")) {
            const [day, month, year] = row[1].split(".")
            testDate = new Date(`${year}-${month}-${day}`)
          }

          // Если всё ещё некорректная, используем текущую дату
          if (isNaN(testDate.getTime())) {
            testDate = new Date()
          }
        } catch (e) {
          testDate = new Date()
        }

        // Находим информацию о предмете
        const subjectId = row[0]
        const subject = subjects.find((s) => s.id === subjectId)
        const subjectName = subject ? subject.name : subjectId

        return {
          subjectId,
          subjectName,
          date: testDate.toISOString(),
          description: row[2] || "",
        }
      })

    // Сортируем по дате (ближайшие сначала)
    testsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    console.log("API: Успешно получены данные о предстоящих тестах")

    return NextResponse.json({
      success: true,
      data: testsData,
    })
  } catch (error) {
    console.error("API: Ошибка при получении данных о тестах:", error)

    return NextResponse.json({
      success: false,
      message: "Ошибка при получении данных о тестах",
      error: error instanceof Error ? error.message : String(error),
      data: [],
    })
  }
}
