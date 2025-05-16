import { NextResponse } from "next/server"
import { getGoogleSheetsClient } from "@/lib/google-sheets-api"

export async function GET() {
  try {
    // Проверяем наличие переменных окружения
    const envStatus = {
      email: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKey:
        !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
        process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.includes("PRIVATE KEY"),
      spreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    }

    // Если какая-то переменная отсутствует, возвращаем ошибку
    if (!envStatus.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствует email сервисного аккаунта",
          error: "Переменная окружения GOOGLE_SERVICE_ACCOUNT_EMAIL не найдена",
          envStatus,
        },
        { status: 400 },
      )
    }

    if (!envStatus.privateKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствует приватный ключ сервисного аккаунта",
          error: "Переменная окружения GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY не найдена или некорректна",
          envStatus,
        },
        { status: 400 },
      )
    }

    if (!envStatus.spreadsheetId) {
      return NextResponse.json(
        {
          success: false,
          message: "Отсутствует ID таблицы Google Sheets",
          error: "Переменная окружения GOOGLE_SHEETS_SPREADSHEET_ID не найдена",
          envStatus,
        },
        { status: 400 },
      )
    }

    // Получаем клиент Google Sheets
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    // Получаем информацию о таблице
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const spreadsheetInfo = {
      title: spreadsheetResponse.data.properties?.title || "Неизвестная таблица",
      sheets: spreadsheetResponse.data.sheets?.map((sheet) => sheet.properties?.title || "Неизвестный лист") || [],
    }

    // Если успешно, возвращаем информацию
    return NextResponse.json({
      success: true,
      message: "Подключение к Google Sheets API успешно установлено",
      serviceAccount: maskEmail(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ""),
      spreadsheetId: maskId(process.env.GOOGLE_SHEETS_SPREADSHEET_ID || ""),
      spreadsheetInfo,
      envStatus,
    })
  } catch (error) {
    console.error("Ошибка при подключении к Google Sheets API:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Не удалось подключиться к Google Sheets API",
        error: error instanceof Error ? error.message : String(error),
        envStatus: {
          email: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          privateKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
          spreadsheetId: !!process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
        },
      },
      { status: 500 },
    )
  }
}

// Функция для маскирования email (показывает только первые 3 символа и домен)
function maskEmail(email: string): string {
  if (!email) return ""
  const parts = email.split("@")
  if (parts.length !== 2) return "***@***.***"

  const username = parts[0]
  const domain = parts[1]

  const maskedUsername = username.substring(0, 3) + "***"
  return `${maskedUsername}@${domain}`
}

// Функция для маскирования ID (показывает только первые и последние 4 символа)
function maskId(id: string): string {
  if (!id) return ""
  if (id.length <= 8) return "********"

  return id.substring(0, 4) + "****" + id.substring(id.length - 4)
}
