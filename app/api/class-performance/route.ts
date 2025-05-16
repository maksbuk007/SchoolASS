import { NextResponse } from "next/server"
import { getClassPerformanceData } from "@/lib/google-sheets-server"

export async function GET() {
  try {
    const classData = await getClassPerformanceData()
    return NextResponse.json({ success: true, data: classData })
  } catch (error) {
    console.error("Ошибка при получении данных об успеваемости класса:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 },
    )
  }
}
