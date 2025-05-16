import { getStudentGradesFromSheets } from "./google-sheets-server"

export interface UpcomingTest {
  subject: string
  date: string
  description: string
}

export const getUpcomingTestsData = async (): Promise<UpcomingTest[]> => {
  try {
    console.log("Запрос данных о предстоящих тестах...")

    // Получаем данные из API
    const response = await fetch("/api/upcoming-tests")

    if (!response.ok) {
      console.error(`Ошибка при получении данных о тестах: HTTP ${response.status}`)
      return []
    }

    const result = await response.json()
    console.log("Результат запроса предстоящих тестов:", result)

    if (result.success && result.data) {
      return result.data
    }

    console.error("Данные о тестах не получены:", result)
    return []
  } catch (error) {
    console.error("Ошибка при получении данных о предстоящих тестах:", error)
    return []
  }
}

// Определяем интерфейс для оценки
export interface Grade {
  value: number
  date: string
}

// Определяем интерфейс для оценок по предмету
interface SubjectGrades {
  current: Grade[]
  quarters: { [quarterId: string]: Grade[] }
}

// Определяем интерфейс для оценок ученика по всем предметам
interface StudentGrades {
  studentId: string
  subjects: { [subjectId: string]: SubjectGrades }
}

// Определяем интерфейс для предмета
interface Subject {
  id: string
  name: string
}

// Список предметов
export const subjects = [
  { id: "Бел. яз.", name: "Белорусский язык" },
  { id: "Бел. лит.", name: "Белорусская литература" },
  { id: "Рус. яз.", name: "Русский язык" },
  { id: "Рус. лит.", name: "Русская литература" },
  { id: "Ин. яз.", name: "Иностранный язык" },
  { id: "Матем.", name: "Математика" },
  { id: "Информ.", name: "Информатика" },
  { id: "Ист. Бел.", name: "История Беларуси" },
  { id: "Всем. ист.", name: "Всемирная история" },
  { id: "Общество", name: "Обществоведение" },
  { id: "География", name: "География" },
  { id: "Биология", name: "Биология" },
  { id: "Физика", name: "Физика" },
  { id: "Химия", name: "Химия" },
  { id: "Астрономия", name: "Астрономия" },
  { id: "Физ-ра", name: "Физическая культура и здоровье" },
  { id: "ДП/МП", name: "Допризывная и медицинская подготовка" },
]

// Функция для вычисления среднего балла
export function calculateAverage(grades: number[], roundToInt = true): number {
  if (!grades || grades.length === 0) return 0

  // Фильтруем только числовые значения
  const validGrades = grades.filter((grade) => typeof grade === "number" && !isNaN(grade))
  if (validGrades.length === 0) return 0

  const sum = validGrades.reduce((acc, grade) => acc + grade, 0)
  const average = sum / validGrades.length

  return roundToInt ? Math.round(average) : average
}

// Четверти
export const quarters = [
  { id: "2023-Q1", name: "I четверть 2023-2024" },
  { id: "2023-Q2", name: "II четверть 2023-2024" },
  { id: "2024-Q3", name: "III четверть 2023-2024" },
  { id: "2024-Q4", name: "IV четверть 2023-2024" },
  { id: "current", name: "Текущая четверть" },
]

// Функция для получения данных ученика
export async function getStudentData(studentId: string) {
  try {
    const result = await getStudentGradesFromSheets(studentId)

    if (!result) {
      throw new Error("Не удалось получить данные из Google Sheets")
    }

    return result
  } catch (error) {
    console.error("Ошибка при получении данных ученика:", error)
    throw error
  }
}

export const updateGrade = async (
  studentId: string,
  subjectId: string,
  gradeIndex: number,
  value: number,
  quarter?: string,
  date?: string,
): Promise<boolean> => {
  try {
    const response = await fetch("/api/manage-grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "update",
        studentId,
        subjectId,
        gradeIndex,
        value,
        quarter,
        date,
      }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Ошибка при обновлении оценки:", error)
    return false
  }
}

export const addGrade = async (
  studentId: string,
  subjectId: string,
  value: number,
  date: string,
  quarter?: string,
): Promise<boolean> => {
  try {
    const response = await fetch("/api/manage-grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "add",
        studentId,
        subjectId,
        value,
        date,
        quarter,
      }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Ошибка при добавлении оценки:", error)
    return false
  }
}

export const deleteGrade = async (
  studentId: string,
  subjectId: string,
  gradeIndex: number,
  quarter?: string,
): Promise<boolean> => {
  try {
    const response = await fetch("/api/manage-grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "delete",
        studentId,
        subjectId,
        gradeIndex,
        quarter,
      }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Ошибка при удалении оценки:", error)
    return false
  }
}
