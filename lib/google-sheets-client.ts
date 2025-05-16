import { google } from "googleapis"
import { JWT } from "google-auth-library"

// Функция для получения авторизованного клиента Google Sheets
export async function getGoogleSheetsClient() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

    if (!email || !privateKey || !spreadsheetId) {
      throw new Error("Отсутствуют необходимые переменные окружения")
    }

    // Правильно обрабатываем приватный ключ
    // Если ключ содержит экранированные переносы строк, заменяем их на реальные
    const formattedPrivateKey = privateKey.includes("\\n") ? privateKey.replace(/\\n/g, "\n") : privateKey

    // Создаем JWT клиент для аутентификации
    const auth = new JWT({
      email,
      key: formattedPrivateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Создаем клиент для работы с Google Sheets API
    const sheets = google.sheets({ version: "v4", auth })

    return { sheets, spreadsheetId }
  } catch (error) {
    console.error("Ошибка при создании клиента Google Sheets:", error)
    throw error
  }
}
