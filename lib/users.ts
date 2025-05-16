import { getStudentsFromSheets } from "./google-sheets-server"

export type User = {
  id: string
  username: string
  password: string // В реальном приложении пароли должны быть хешированы
  name: string
  role: "student" | "admin"
  class: string // Класс ученика
}

// Локальные данные пользователей (используются как резервные)
const localUsers: User[] = [
  // Администраторы
  {
    id: "admin1",
    username: "admin",
    password: "admin",
    name: "Администратор",
    role: "admin",
    class: "",
  },
  {
    id: "admin2",
    username: "director",
    password: "director",
    name: "Директор школы",
    role: "admin",
    class: "",
  },

  // Ученики 11 класса с настоящими именами
  {
    id: "student1",
    username: "biryuk",
    password: "password",
    name: "Бирюк Лёша",
    role: "student",
    class: "11",
  },
  {
    id: "student2",
    username: "biryukova",
    password: "password",
    name: "Бирюкова Полина",
    role: "student",
    class: "11",
  },
  {
    id: "student3",
    username: "bogdanchik",
    password: "password",
    name: "Богданчик Никита",
    role: "student",
    class: "11",
  },
  {
    id: "student4",
    username: "bukatin",
    password: "password",
    name: "Букатин Максимилиан",
    role: "student",
    class: "11",
  },
  {
    id: "student5",
    username: "gabro",
    password: "password",
    name: "Габро Богдан",
    role: "student",
    class: "11",
  },
  {
    id: "student6",
    username: "gaponenko",
    password: "password",
    name: "Гапоненко Юля",
    role: "student",
    class: "11",
  },
  {
    id: "student7",
    username: "grinyuk",
    password: "password",
    name: "Гринюк Настя",
    role: "student",
    class: "11",
  },
  {
    id: "student8",
    username: "evstigneev",
    password: "password",
    name: "Евстигнеев Матвей",
    role: "student",
    class: "11",
  },
  {
    id: "student9",
    username: "zankevich",
    password: "password",
    name: "Занкевич Аня",
    role: "student",
    class: "11",
  },
  {
    id: "student10",
    username: "zyk",
    password: "password",
    name: "Зык Диана",
    role: "student",
    class: "11",
  },
  {
    id: "student11",
    username: "kib",
    password: "password",
    name: "Киб Яна",
    role: "student",
    class: "11",
  },
  {
    id: "student12",
    username: "kovaleva",
    password: "password",
    name: "Ковалева Надя",
    role: "student",
    class: "11",
  },
  {
    id: "student13",
    username: "kutsaev",
    password: "password",
    name: "Куцаев Матвей",
    role: "student",
    class: "11",
  },
  {
    id: "student14",
    username: "lisok",
    password: "password",
    name: "Лисок Андрей",
    role: "student",
    class: "11",
  },
  {
    id: "student15",
    username: "lupekin",
    password: "password",
    name: "Лупекин Артем",
    role: "student",
    class: "11",
  },
  {
    id: "student16",
    username: "matskevich",
    password: "password",
    name: "Мацкевич Лера",
    role: "student",
    class: "11",
  },
  {
    id: "student17",
    username: "mogilevets",
    password: "password",
    name: "Могилевец Илья",
    role: "student",
    class: "11",
  },
  {
    id: "student18",
    username: "muradyan",
    password: "password",
    name: "Мурадян Лиана",
    role: "student",
    class: "11",
  },
  {
    id: "student19",
    username: "nilov",
    password: "password",
    name: "Нилов Матвей",
    role: "student",
    class: "11",
  },
  {
    id: "student20",
    username: "perepechko",
    password: "password",
    name: "Перепечко Даник",
    role: "student",
    class: "11",
  },
  {
    id: "student21",
    username: "popova",
    password: "password",
    name: "Попова Калина",
    role: "student",
    class: "11",
  },
  {
    id: "student22",
    username: "rudenya",
    password: "password",
    name: "Руденя Милана",
    role: "student",
    class: "11",
  },
  {
    id: "student23",
    username: "semenchkenko",
    password: "password",
    name: "Семенчкенко Костя",
    role: "student",
    class: "11",
  },
  {
    id: "student24",
    username: "sluka",
    password: "password",
    name: "Слука Мария",
    role: "student",
    class: "11",
  },
  {
    id: "student25",
    username: "stasilovich",
    password: "password",
    name: "Стасилович Катя",
    role: "student",
    class: "11",
  },
  {
    id: "student26",
    username: "khromova",
    password: "password",
    name: "Хромова Настя",
    role: "student",
    class: "11",
  },
  {
    id: "student27",
    username: "yaronsky",
    password: "password",
    name: "Яронский Тимофей",
    role: "student",
    class: "11",
  },
]

// Кэш пользователей
let usersCache: User[] | null = null
let lastCacheUpdate = 0

// Функция для получения всех пользователей
export async function getUsers(): Promise<User[]> {
  const now = Date.now()

  // Используем кэш, если он не старше 5 минут
  if (usersCache && now - lastCacheUpdate < 5 * 60 * 1000) {
    return usersCache
  }

  try {
    // Получаем данные из Google Sheets
    const sheetsUsers = await getStudentsFromSheets()

    // Обновляем кэш
    usersCache = sheetsUsers
    lastCacheUpdate = now

    return sheetsUsers
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error)

    // В случае ошибки используем локальные данные
    return localUsers
  }
}

// Функция для поиска пользователя по логину и паролю
export async function findUser(username: string, password: string): Promise<User | undefined> {
  const users = await getUsers()
  return users.find((user) => user.username === username && user.password === password)
}

// Функция для получения пользователя по ID
export async function getUserById(id: string): Promise<User | undefined> {
  const users = await getUsers()
  return users.find((user) => user.id === id)
}

// Функция для получения всех учеников
export async function getAllStudents(): Promise<User[]> {
  const users = await getUsers()
  return users.filter((user) => user.role === "student")
}

// Функция для получения учеников по классу
export async function getStudentsByClass(className: string): Promise<User[]> {
  const users = await getUsers()
  return users.filter((user) => user.role === "student" && user.class === className)
}

// Получение списка всех классов
export async function getAllClasses(): Promise<string[]> {
  const users = await getUsers()
  const classes = new Set<string>()

  users.forEach((user) => {
    if (user.role === "student" && user.class) {
      classes.add(user.class)
    }
  })

  return Array.from(classes).sort()
}

// Синхронные версии функций для обратной совместимости
export function findUserSync(username: string, password: string): User | undefined {
  return localUsers.find((user) => user.username === username && user.password === password)
}

export function getUserByIdSync(id: string): User | undefined {
  return localUsers.find((user) => user.id === id)
}

export function getAllStudentsSync(): User[] {
  return localUsers.filter((user) => user.role === "student")
}

export function getStudentsByClassSync(className: string): User[] {
  return localUsers.filter((user) => user.role === "student" && user.class === className)
}

export function getAllClassesSync(): string[] {
  const classes = new Set<string>()
  localUsers.forEach((user) => {
    if (user.role === "student" && user.class) {
      classes.add(user.class)
    }
  })
  return Array.from(classes).sort()
}
