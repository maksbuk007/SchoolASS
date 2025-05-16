import { NextResponse } from "next/server"
import { getGoogleSheetsClient } from "@/lib/google-sheets-api"

export async function GET() {
  try {
    // Получаем клиент Google Sheets
    const { sheets, spreadsheetId } = await getGoogleSheetsClient()

    // Пробуем получить информацию о таблице
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    // Получаем список листов
    const sheetNames = response.data.sheets?.map((sheet) => sheet.properties?.title || "") || []

    // Если запрос успешен, возвращаем успешный ответ с информацией о таблице
    return NextResponse.json({
      success: true,
      message: "Подключение к Google Sheets успешно установлено",
      spreadsheetInfo: {
        title: response.data.properties?.title || "Без названия",
        sheets: sheetNames,
      },
    })
  } catch (error) {
    // В случае ошибки возвращаем информацию об ошибке
    return NextResponse.json({
      success: false,
      message: "Не удалось проверить статус подключения к Google Sheets",
      error: error instanceof Error ? error.message : "Неизвестная ошибка",
    })
  }
}
