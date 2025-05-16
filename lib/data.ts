export interface UpcomingTest {
  subjectId: string
  subjectName: string
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

// Массив предметов
export const subjects: Subject[] = [
  { id: "bel_lang", name: "Бел. яз." },
  { id: "bel_lit", name: "Бел. лит." },
  { id: "rus_lang", name: "Русск. яз." },
  { id: "rus_lit", name: "Русск. лит." },
  { id: "foreign_lang", name: "Ин. яз." },
  { id: "math", name: "Математика" },
  { id: "informatics", name: "Информатика" },
  { id: "world_history", name: "Всем. истор." },
  { id: "bel_history", name: "Истор. Бел." },
  { id: "social_studies", name: "Обществов." },
  { id: "geography", name: "География" },
  { id: "biology", name: "Биология" },
  { id: "physics", name: "Физика" },
  { id: "astronomy", name: "Астрономия" },
  { id: "chemistry", name: "Химия" },
  { id: "physical_edu", name: "Физ-ра" },
  { id: "dp_mp", name: "ДП/МП" },
]

// Функция для вычисления среднего балла
export const calculateAverage = (grades: any[], roundQuarter = false): number => {
  if (!grades || grades.length === 0) {
    return 0
  }

  const sum = grades.reduce((acc: number, grade: any) => acc + grade.value, 0)
  const average = sum / grades.length

  return roundQuarter ? Math.round(average) : Number(average.toFixed(2))
}

export const quarters = [
  { id: "current", name: "Текущая" },
  { id: "2025-Q1", name: "1 четверть" },
  { id: "2025-Q2", name: "2 четверть" },
  { id: "2025-Q3", name: "3 четверть" },
]

// Функция для получения данных ученика
export const getStudentData = async (studentId: string): Promise<{ data: StudentGrades; lastUpdate: string }> => {
  try {
    // Получаем данные из API
    const response = await fetch(`/api/student-grades?studentId=${studentId}`)

    const result = await response.json()
    console.log("Результат запроса оценок студента:", result)

    if (result.success && result.data) {
      return {
        data: result.data,
        lastUpdate: result.lastUpdate || new Date().toLocaleString(),
      }
    }

    throw new Error(result.message || "Данные не получены")
  } catch (error) {
    console.error("Ошибка при получении данных ученика:", error)

    // В случае ошибки возвращаем пустую структуру данных
    const emptyData: StudentGrades = {
      studentId,
      subjects: {},
    }

    // Инициализируем пустую структуру для всех предметов
    subjects.forEach((subject) => {
      emptyData.subjects[subject.id] = {
        current: [],
        quarters: {
          "2025-Q1": [],
          "2025-Q2": [],
          "2025-Q3": [],
          "2025-Q4": [],
        },
      }
    })

    return {
      data: emptyData,
      lastUpdate: new Date().toLocaleString(),
    }
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
