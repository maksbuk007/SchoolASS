import { getGoogleSheetsClient } from "./google-sheets-client"

// Добавим функцию для получения архивных оценок
export async function getStudentArchiveGrades(studentId: string) {
  try {
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    // Получаем данные из листа Previous_Grades
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Previous_Grades!A1:V28",
    })

    const values = response.data.values || []
    if (values.length === 0) {
      console.log("Лист с архивными оценками пуст")
      return null
    }

    // Получаем заголовки (предметы)
    const headers = values[0]

    // Ищем строку с данными ученика по ID в столбце V (индекс 21)
    const studentRowIndex = values.findIndex((row) => row.length > 21 && row[21] === studentId)

    if (studentRowIndex === -1) {
      console.log(`Ученик ${studentId} не найден в архиве оценок (столбец V)`)
      return null
    }

    const studentRow = values[studentRowIndex]
    console.log(`Найдена строка для ученика ${studentId} в архиве: ${studentRowIndex + 1}`)

    // Формируем объект с архивными оценками по предметам
    const result = {
      studentId,
      subjects: {},
    }

    // Обрабатываем каждый предмет (столбцы от D до T)
    for (let i = 3; i < Math.min(headers.length, 20); i++) {
      const subjectId = headers[i]
      if (!subjectId) continue

      // Проверяем, есть ли данные для этого предмета
      if (i < studentRow.length && studentRow[i]) {
        const gradesStr = studentRow[i]
        console.log(`Архивные оценки для ${subjectId}:`, gradesStr)

        try {
          // Парсим оценки, разделенные запятыми
          const gradesArray = gradesStr
            .split(",")
            .map((g) => g.trim())
            .filter((g) => g !== "")

          // Создаем массив оценок для каждой четверти и годовой
          const quarterGrades = {
            Q1: gradesArray[0] ? Number.parseFloat(gradesArray[0]) : 0,
            Q2: gradesArray[1] ? Number.parseFloat(gradesArray[1]) : 0,
            Q3: gradesArray[2] ? Number.parseFloat(gradesArray[2]) : 0,
            Q4: gradesArray[3] ? Number.parseFloat(gradesArray[3]) : 0,
            year: gradesArray[4] ? Number.parseFloat(gradesArray[4]) : 0,
          }

          // Добавляем оценки в результат
          result.subjects[subjectId] = quarterGrades
        } catch (e) {
          console.error(`Ошибка при парсинге архивных оценок для ${subjectId}:`, e)
          result.subjects[subjectId] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, year: 0 }
        }
      } else {
        result.subjects[subjectId] = { Q1: 0, Q2: 0, Q3: 0, Q4: 0, year: 0 }
      }
    }

    return result
  } catch (error) {
    console.error(`Ошибка при получении архивных оценок для ученика ${studentId}:`, error)
    return null
  }
}
