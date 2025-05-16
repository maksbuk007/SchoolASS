import { type NextRequest, NextResponse } from "next/server"
import { logLogin } from "@/lib/google-sheets-server"

export async function POST(request: NextRequest) {
  try {
    const { username, success, ip, device, userAgent } = await request.json()

    if (!username) {
      return NextResponse.json({ success: false, error: "Отсутствует логин пользователя" }, { status: 400 })
    }

    await logLogin(
      username,
      success,
      ip || request.headers.get("x-forwarded-for") || "Unknown",
      device || "Unknown",
      userAgent || "Unknown",
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ошибка при логировании входа:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 },
    )
  }
}
