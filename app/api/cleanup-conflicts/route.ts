import { NextResponse } from "next/server"
import { cleanupConflictSheets } from "@/lib/google-sheets-server"

export async function GET() {
  try {
    const result = await cleanupConflictSheets()

    return NextResponse.json({
      success: result,
      message: result ? "Конфликтующие листы успешно удалены" : "Конфликтующие листы не найдены",
    })
  } catch (error) {
    console.error("Ошибка при очистке конфликтующих листов:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Произошла ошибка при очистке конфликтующих листов",
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 },
    )
  }
}
