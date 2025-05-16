import { type NextRequest, NextResponse } from "next/server"
import { getGoogleSheetsClient } from "@/lib/google-sheets-api"

// GET: Получение всех уведомлений
export async function GET() {
  try {
    // Получаем клиент Google Sheets
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    // Получаем данные о уведомлениях из таблицы
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Notifications!A2:E100", // Предполагаем, что данные начинаются со второй строки
    })

    const values = response.data.values || []

    // Преобразуем данные в нужный формат
    const notifications = values
      .map((row, index) => {
        if (!row[0] && !row[1] && !row[2]) return null // Пропускаем пустые строки

        return {
          id: row[0] || `notification-${index}`,
          title: row[1] || "",
          message: row[2] || "",
          type: row[3] || "info",
          date: row[4] ? new Date(row[4]).toISOString() : new Date().toISOString(),
        }
      })
      .filter(Boolean) // Фильтруем null значения

    return NextResponse.json({ success: true, data: notifications })
  } catch (error) {
    console.error("Ошибка при получении уведомлений:", error)

    // В случае ошибки возвращаем пустой массив
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        data: [],
      },
      { status: 500 },
    )
  }
}

// POST: Добавление нового уведомления
export async function POST(request: NextRequest) {
  try {
    const { title, message, type = "info" } = await request.json()

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: "Отсутствуют обязательные поля (title, message)" },
        { status: 400 },
      )
    }

    // Получаем клиент Google Sheets
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    // Генерируем уникальный ID для уведомления
    const id = `notification-${Date.now()}`
    const date = new Date().toISOString()

    // Добавляем уведомление в таблицу
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Notifications!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[id, title, message, type, date]],
      },
    })

    return NextResponse.json({
      success: true,
      data: { id, title, message, type, date },
    })
  } catch (error) {
    console.error("Ошибка при добавлении уведомления:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 },
    )
  }
}
